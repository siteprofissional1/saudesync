"""
SAÚDE SYNC — Serviço Determinístico de Leitura e Análise do CSV
Implementa carregamento com cache em memória, filtros e métricas estatísticas.
"""

import os
import io
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.config import DATA_FILE_PATH

# Paleta de cores oficial do Protocolo de Manchester
MANCHESTER_COLORS = {
    "Vermelho - Emergência": "#EF4444",
    "Laranja - Muito Urgente": "#F97316",
    "Amarelo - Urgente": "#EAB308",
    "Verde - Pouco Urgente": "#22C55E",
    "Azul - Não Urgente": "#3B82F6"
}

class CsvService:
    """
    Serviço central de manipulação dos dados históricos do Saúde Sync.
    Garante que todos os cálculos matemáticos sejam determinísticos.
    """
    _instance = None
    _df: Optional[pd.DataFrame] = None
    _last_loaded: Optional[datetime] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CsvService, cls).__new__(cls)
        return cls._instance

    def load_data(self, force_reload: bool = False) -> pd.DataFrame:
        """
        Carrega o dataset em memória com tipagem e validação.
        """
        if self._df is not None and not force_reload:
            return self._df

        if not os.path.exists(DATA_FILE_PATH):
            raise FileNotFoundError(f"Arquivo CSV não encontrado em: {DATA_FILE_PATH}")

        df = pd.read_csv(DATA_FILE_PATH, encoding="utf-8")

        # Conversão estrita de data e hora (formato esperado: YYYY-MM-DD HH:mm)
        df["data_hora_chegada_dt"] = pd.to_datetime(
            df["data_hora_chegada"],
            format="%Y-%m-%d %H:%M",
            errors="coerce"
        )
        # Extrair data (sem hora) e hora isolada para agregações
        df["data_apenas"] = df["data_hora_chegada_dt"].dt.strftime("%Y-%m-%d")
        df["hora_apenas"] = df["data_hora_chegada_dt"].dt.hour

        # Garantir tipos numéricos
        num_cols = [
            "paciente_idade", "pressao_sistolica_mmhg", "pressao_diastolica_mmhg",
            "frequencia_cardiaca_bpm", "temperatura_axilar_c", "saturacao_o2_percent",
            "glicemia_capilar_mg_dl", "escala_dor_0_10", "tempo_espera_max_min",
            "tempo_espera_real_min"
        ]
        for col in num_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        self._df = df
        self._last_loaded = datetime.now()
        return self._df

    def get_raw_df(self) -> pd.DataFrame:
        return self.load_data()

    def filter_data(
        self,
        data_inicio: Optional[str] = None,
        data_fim: Optional[str] = None,
        classificacao: Optional[str] = None,
        municipio: Optional[str] = None,
        especialidade: Optional[str] = None,
        status: Optional[str] = None,
        sexo: Optional[str] = None,
        faixa_etaria: Optional[str] = None,
        sintoma: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Aplica filtros combinados sobre o dataframe.
        """
        df = self.load_data().copy()

        if data_inicio:
            df = df[df["data_apenas"] >= data_inicio]
        if data_fim:
            df = df[df["data_apenas"] <= data_fim]
        if classificacao:
            # Suporta filtro múltiplo separado por vírgula
            classes = [c.strip() for c in classificacao.split(",") if c.strip()]
            df = df[df["classificacao_manchester"].isin(classes)]
        if municipio:
            munis = [m.strip() for m in municipio.split(",") if m.strip()]
            df = df[df["municipio_origem"].isin(munis)]
        if especialidade:
            esps = [e.strip() for e in especialidade.split(",") if e.strip()]
            df = df[df["especialidade_requerida"].isin(esps)]
        if status:
            stts = [s.strip() for s in status.split(",") if s.strip()]
            df = df[df["status_atendimento"].isin(stts)]
        if sexo:
            df = df[df["paciente_sexo"].str.upper() == sexo.strip().upper()]
        if faixa_etaria:
            if faixa_etaria == "0-12":
                df = df[df["paciente_idade"] <= 12]
            elif faixa_etaria == "13-18":
                df = df[(df["paciente_idade"] >= 13) & (df["paciente_idade"] <= 18)]
            elif faixa_etaria == "19-59":
                df = df[(df["paciente_idade"] >= 19) & (df["paciente_idade"] <= 59)]
            elif faixa_etaria == "60+":
                df = df[df["paciente_idade"] >= 60]
        if sintoma:
            df = df[df["sintoma_principal"].str.contains(sintoma, case=False, na=False)]

        return df

    def calculate_summary(self, df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
        """
        Calcula os KPIs centrais de forma determinística.
        """
        if df is None:
            df = self.load_data()

        total = len(df)
        if total == 0:
            return {
                "total_atendimentos": 0,
                "aguardando_fila": 0,
                "tempo_medio_espera_min": 0.0,
                "tempo_mediano_espera_min": 0.0,
                "p90_espera_min": 0.0,
                "acima_tempo_referencia": 0,
                "percentual_acima_tempo": 0.0,
                "dentro_tempo_referencia": 0,
                "percentual_dentro_tempo": 0.0,
                "especialidade_mais_demandada": "N/A",
                "municipio_maior_volume": "N/A",
                "periodo_inicio": "N/A",
                "periodo_fim": "N/A"
            }

        tempo_real = df["tempo_espera_real_min"]
        tempo_max = df["tempo_espera_max_min"]

        tempo_medio = float(tempo_real.mean())
        tempo_mediano = float(tempo_real.median())
        p90 = float(np.percentile(tempo_real, 90))

        # Atendimentos em fila / aguardando
        aguardando_mask = df["status_atendimento"].str.contains("Aguardando", case=False, na=False)
        aguardando_fila = int(aguardando_mask.sum())

        # Acima do tempo (tempo_real > tempo_max)
        # Nota: Vermelho com limite 0 min é tratado sem erro aritmético
        acima_mask = df["tempo_espera_real_min"] > df["tempo_espera_max_min"]
        total_acima = int(acima_mask.sum())
        total_dentro = total - total_acima
        perc_acima = round((total_acima / total) * 100, 2)
        perc_dentro = round((total_dentro / total) * 100, 2)

        # Especialidade mais demandada
        especialidade_top = df["especialidade_requerida"].mode()[0] if not df["especialidade_requerida"].empty else "N/A"
        # Município com maior volume
        municipio_top = df["municipio_origem"].mode()[0] if not df["municipio_origem"].empty else "N/A"

        data_min = df["data_hora_chegada_dt"].min()
        data_max = df["data_hora_chegada_dt"].max()

        return {
            "total_atendimentos": total,
            "aguardando_fila": aguardando_fila,
            "tempo_medio_espera_min": round(tempo_medio, 2),
            "tempo_mediano_espera_min": round(tempo_mediano, 2),
            "p90_espera_min": round(p90, 2),
            "acima_tempo_referencia": total_acima,
            "percentual_acima_tempo": perc_acima,
            "dentro_tempo_referencia": total_dentro,
            "percentual_dentro_tempo": perc_dentro,
            "especialidade_mais_demandada": str(especialidade_top),
            "municipio_maior_volume": str(municipio_top),
            "periodo_inicio": data_min.strftime("%d/%m/%Y") if pd.notnull(data_min) else "N/A",
            "periodo_fim": data_max.strftime("%d/%m/%Y") if pd.notnull(data_max) else "N/A"
        }

    def generate_charts(self, df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
        """
        Produz os dados e layouts formatados para renderização no Plotly.js.
        """
        if df is None:
            df = self.load_data()

        total = len(df)
        if total == 0:
            return {}

        # 1. Distribuição Manchester (Donut)
        manch_counts = df["classificacao_manchester"].value_counts()
        manch_labels = list(manch_counts.index)
        manch_values = [int(v) for v in manch_counts.values]
        manch_colors = [MANCHESTER_COLORS.get(label, "#9FB2C4") for label in manch_labels]

        chart_manchester = {
            "id": "chart_manchester",
            "title": "Distribuição de Triagem (Protocolo Manchester)",
            "type": "pie",
            "data": [{
                "labels": manch_labels,
                "values": manch_values,
                "type": "pie",
                "hole": 0.55,
                "marker": {"colors": manch_colors},
                "textinfo": "label+percent",
                "hovertemplate": "<b>%{label}</b><br>Pacientes: <b>%{value}</b> (%{percent})<extra></extra>"
            }],
            "layout": {
                "showlegend": True,
                "margin": {"t": 30, "b": 20, "l": 20, "r": 20}
            }
        }

        # 2. Status dos Atendimentos (Bar Chart)
        status_counts = df["status_atendimento"].value_counts().head(8)
        chart_status = {
            "id": "chart_status",
            "title": "Status Operacional dos Atendimentos",
            "type": "bar",
            "data": [{
                "x": list(status_counts.index),
                "y": [int(v) for v in status_counts.values],
                "type": "bar",
                "marker": {"color": "#2F80ED"},
                "hovertemplate": "<b>Status: %{x}</b><br>Atendimentos: <b>%{y} pacientes</b><extra></extra>"
            }],
            "layout": {
                "xaxis": {"tickangle": -30},
                "yaxis": {"title": "Pacientes"},
                "margin": {"t": 30, "b": 70, "l": 40, "r": 20}
            }
        }

        # 3. Tempo Médio Real vs Limite de Referência por Manchester (Grouped Bar)
        grouped_time = df.groupby("classificacao_manchester")[["tempo_espera_real_min", "tempo_espera_max_min"]].mean().reset_index()
        chart_tempo_vs_limite = {
            "id": "chart_tempo_vs_limite",
            "title": "Tempo Médio Real vs Limite de Referência (min)",
            "type": "bar",
            "data": [
                {
                    "name": "Tempo Real Médio",
                    "x": list(grouped_time["classificacao_manchester"]),
                    "y": [round(float(v), 1) for v in grouped_time["tempo_espera_real_min"]],
                    "type": "bar",
                    "marker": {"color": "#21C7D9"},
                    "hovertemplate": "<b>%{x}</b><br>%{data.name}: <b>%{y} min</b><extra></extra>"
                },
                {
                    "name": "Limite Máximo Tolerado",
                    "x": list(grouped_time["classificacao_manchester"]),
                    "y": [round(float(v), 1) for v in grouped_time["tempo_espera_max_min"]],
                    "type": "bar",
                    "marker": {"color": "#EF4444"},
                    "hovertemplate": "<b>%{x}</b><br>%{data.name}: <b>%{y} min</b><extra></extra>"
                }
            ],
            "layout": {
                "barmode": "group",
                "xaxis": {"tickangle": -20},
                "yaxis": {"title": "Minutos"},
                "margin": {"t": 30, "b": 60, "l": 40, "r": 20}
            }
        }

        # 4. Volume de Atendimentos por Faixa Horária (Line / Area)
        hora_counts = df["hora_apenas"].value_counts().sort_index()
        horas_labels = [f"{h:02d}:00" for h in hora_counts.index]
        chart_horario = {
            "id": "chart_horario",
            "title": "Volume de Chegada por Faixa Horária (24h)",
            "type": "scatter",
            "data": [{
                "x": horas_labels,
                "y": [int(v) for v in hora_counts.values],
                "type": "scatter",
                "mode": "lines+markers",
                "fill": "tozeroy",
                "line": {"color": "#2F80ED", "shape": "spline"},
                "marker": {"size": 6},
                "hovertemplate": "<b>Horário: %{x}</b><br>Pacientes: <b>%{y}</b><extra></extra>"
            }],
            "layout": {
                "xaxis": {"title": "Horário"},
                "yaxis": {"title": "Atendimentos"},
                "margin": {"t": 30, "b": 40, "l": 40, "r": 20}
            }
        }

        # 5. Top 7 Sintomas Mais Frequentes (Horizontal Bar)
        sintomas_counts = df["sintoma_principal"].value_counts().head(7).iloc[::-1]
        sintomas_completos = list(sintomas_counts.index)
        sintomas_curtos = [
            (s[:32] + "...") if len(s) > 32 else s for s in sintomas_completos
        ]
        chart_sintomas = {
            "id": "chart_sintomas",
            "title": "Sintomas e Queixas Mais Recorrentes",
            "type": "bar",
            "data": [{
                "y": sintomas_curtos,
                "x": [int(v) for v in sintomas_counts.values],
                "hovertext": sintomas_completos,
                "type": "bar",
                "orientation": "h",
                "marker": {"color": "#3B82F6"},
                "hovertemplate": "<b>%{hovertext}</b><br>Total Registrado: <b>%{x} pacientes</b><extra></extra>"
            }],
            "layout": {
                "yaxis": {"automargin": True},
                "margin": {"t": 30, "b": 40, "l": 160, "r": 20}
            }
        }

        # 6. Volume por Município de Origem (Bar Chart)
        muni_counts = df["municipio_origem"].value_counts()
        chart_municipios = {
            "id": "chart_municipios",
            "title": "Atendimentos por Município de Origem",
            "type": "bar",
            "data": [{
                "x": list(muni_counts.index),
                "y": [int(v) for v in muni_counts.values],
                "type": "bar",
                "marker": {"color": "#10B981"},
                "hovertemplate": "<b>Município: %{x}</b><br>Pacientes: <b>%{y}</b><extra></extra>"
            }],
            "layout": {
                "xaxis": {"tickangle": -30},
                "margin": {"t": 30, "b": 70, "l": 40, "r": 20}
            }
        }

        # 7. Especialidades Requeridas (Horizontal Bar)
        esp_counts = df["especialidade_requerida"].value_counts().head(8).iloc[::-1]
        chart_especialidades = {
            "id": "chart_especialidades",
            "title": "Demanda por Especialidade Médica",
            "type": "bar",
            "data": [{
                "y": list(esp_counts.index),
                "x": [int(v) for v in esp_counts.values],
                "type": "bar",
                "orientation": "h",
                "marker": {"color": "#8B5CF6"}
            }],
            "layout": {
                "margin": {"t": 30, "b": 40, "l": 180, "r": 20}
            }
        }

        # 8. Evolução Temporal Diária (Line Chart)
        daily_counts = df["data_apenas"].value_counts().sort_index()
        chart_evolucao = {
            "id": "chart_evolucao",
            "title": "Evolução Histórica Diária de Atendimentos",
            "type": "scatter",
            "data": [{
                "x": list(daily_counts.index),
                "y": [int(v) for v in daily_counts.values],
                "type": "scatter",
                "mode": "lines+markers",
                "line": {"color": "#F59E0B"},
                "marker": {"size": 5}
            }],
            "layout": {
                "xaxis": {"tickangle": -45},
                "yaxis": {"title": "Atendimentos / Dia"},
                "margin": {"t": 30, "b": 80, "l": 40, "r": 20}
            }
        }

        return {
            "distribuicao_manchester": chart_manchester,
            "status_atendimento": chart_status,
            "tempo_real_vs_limite": chart_tempo_vs_limite,
            "volume_por_horario": chart_horario,
            "sintomas_mais_frequentes": chart_sintomas,
            "volume_por_municipio": chart_municipios,
            "especialidades_demandadas": chart_especialidades,
            "evolucao_temporal": chart_evolucao
        }

    def get_paginated_records(
        self,
        df: pd.DataFrame,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "data_hora_chegada",
        sort_desc: bool = True
    ) -> Dict[str, Any]:
        """
        Retorna registros formatados para tabela paginada no frontend.
        """
        total = len(df)
        if total == 0:
            return {"total": 0, "page": page, "page_size": page_size, "records": []}

        if sort_by in df.columns:
            df = df.sort_values(by=sort_by, ascending=not sort_desc)

        start = (page - 1) * page_size
        end = start + page_size
        subset = df.iloc[start:end]

        records = []
        for _, row in subset.iterrows():
            item = row.to_dict()
            # Remover colunas temporárias internas
            item.pop("data_hora_chegada_dt", None)
            item.pop("data_apenas", None)
            item.pop("hora_apenas", None)
            records.append(item)

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": int(np.ceil(total / page_size)),
            "records": records
        }

    def export_csv(self, df: pd.DataFrame) -> str:
        """
        Exporta dataframe filtrado para string CSV.
        """
        out_df = df.copy()
        out_df.drop(columns=["data_hora_chegada_dt", "data_apenas", "hora_apenas"], errors="ignore", inplace=True)
        return out_df.to_csv(index=False, encoding="utf-8")
