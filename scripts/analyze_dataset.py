"""
SAÚDE SYNC — Script de Análise e Sanity Check do Dataset
Calcula métricas dinamicamente a partir do CSV sem hardcoding.
"""

import os
import json
import sys
import pandas as pd
import numpy as np

# Garantir UTF-8 no Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def analyze_dataset(file_path: str):
    """
    Executa a análise exploratória e sanitização do dataset de triagem do Saúde Sync.
    """
    if not os.path.exists(file_path):
        print(f"ERRO: Arquivo não encontrado: {file_path}")
        return None

    # Leitura do CSV detectando encoding padrão UTF-8
    df = pd.read_csv(file_path, encoding="utf-8")

    # Informações básicas
    total_registros = len(df)
    total_colunas = len(df.columns)
    colunas = list(df.columns)
    
    # Verificação de valores nulos e duplicidades
    nulos_por_coluna = df.isnull().sum().to_dict()
    total_nulos = int(df.isnull().sum().sum())
    total_duplicados = int(df.duplicated(subset=["atendimento_id"]).sum())

    # Conversão e validação de datas
    # Formato esperado: YYYY-MM-DD HH:mm
    df["data_hora_chegada_dt"] = pd.to_datetime(df["data_hora_chegada"], format="%Y-%m-%d %H:%M", errors="coerce")
    datas_invalidas = int(df["data_hora_chegada_dt"].isnull().sum())
    data_min = df["data_hora_chegada_dt"].min()
    data_max = df["data_hora_chegada_dt"].max()

    # Campos categóricos
    municipios = df["municipio_origem"].value_counts().to_dict()
    sintomas = df["sintoma_principal"].value_counts().to_dict()
    especialidades = df["especialidade_requerida"].value_counts().to_dict()
    plantonistas = df["medico_plantonista"].value_counts().to_dict()
    leitos = df["leito_disponivel"].value_counts().to_dict()
    status_atendimento = df["status_atendimento"].value_counts().to_dict()
    manchester_dist = df["classificacao_manchester"].value_counts().to_dict()

    # Tempos de espera e limites
    # Atenção: Vermelho possui tempo_espera_max_min == 0
    tempo_real = df["tempo_espera_real_min"]
    tempo_max = df["tempo_espera_max_min"]

    tempo_medio = float(tempo_real.mean())
    tempo_mediano = float(tempo_real.median())
    p90 = float(np.percentile(tempo_real, 90))
    p95 = float(np.percentile(tempo_real, 95))
    tempo_min = float(tempo_real.min())
    tempo_maximo = float(tempo_real.max())

    # Indicador de tempo excedido (tempo_real > tempo_max)
    acima_do_tempo_mask = df["tempo_espera_real_min"] > df["tempo_espera_max_min"]
    total_acima_do_tempo = int(acima_do_tempo_mask.sum())
    total_dentro_do_tempo = total_registros - total_acima_do_tempo
    perc_acima = (total_acima_do_tempo / total_registros) * 100

    # Tempos por classificação Manchester
    manchester_stats = {}
    for manch, group in df.groupby("classificacao_manchester"):
        manchester_stats[manch] = {
            "total": int(len(group)),
            "tempo_medio_real": round(float(group["tempo_espera_real_min"].mean()), 2),
            "tempo_mediano_real": float(group["tempo_espera_real_min"].median()),
            "tempo_max_referencia": int(group["tempo_espera_max_min"].iloc[0]),
            "acima_referencia": int((group["tempo_espera_real_min"] > group["tempo_espera_max_min"]).sum())
        }

    # Relatório formatado
    report_text = f"""==================================================
SAÚDE SYNC — DATASET REPORT
==================================================
Arquivo: {file_path}
Registros: {total_registros}
Colunas: {total_colunas}
Período: {data_min.strftime('%d/%m/%Y %H:%M') if pd.notnull(data_min) else 'N/A'} a {data_max.strftime('%d/%m/%Y %H:%M') if pd.notnull(data_max) else 'N/A'}
Valores nulos: {total_nulos}
Duplicidades: {total_duplicados}
Datas inválidas: {datas_invalidas}

Municípios ({len(municipios)}):
{json.dumps(municipios, indent=2, ensure_ascii=False)}

Sintomas Principais ({len(sintomas)}):
{json.dumps(sintomas, indent=2, ensure_ascii=False)}

Especialidades ({len(especialidades)}):
{json.dumps(especialidades, indent=2, ensure_ascii=False)}

Plantonistas ({len(plantonistas)}):
{json.dumps(plantonistas, indent=2, ensure_ascii=False)}

Leitos/Locais ({len(leitos)}):
{len(leitos)} locais mapeados

Status de Atendimento ({len(status_atendimento)}):
{json.dumps(status_atendimento, indent=2, ensure_ascii=False)}

Manchester (Distribuição e Tempos):
{json.dumps(manchester_stats, indent=2, ensure_ascii=False)}

Estatísticas Gerais de Tempo de Espera (min):
- Tempo médio: {tempo_medio:.2f} min
- Tempo mediano: {tempo_mediano:.2f} min
- P90 (Percentil 90): {p90:.2f} min
- P95 (Percentil 95): {p95:.2f} min
- Tempo Mínimo: {tempo_min:.1f} min
- Tempo Máximo: {tempo_maximo:.1f} min
- Acima do tempo de referência: {total_acima_do_tempo} ({perc_acima:.2f}%)
- Dentro do tempo de referência: {total_dentro_do_tempo} ({100 - perc_acima:.2f}%)
==================================================
"""
    print(report_text)
    
    # Salvar em .tmp/dataset_analysis.json para uso rápido pelas outras etapas
    os.makedirs(".tmp", exist_ok=True)
    with open(".tmp/dataset_analysis.json", "w", encoding="utf-8") as f:
        json.dump({
            "total_registros": total_registros,
            "total_colunas": total_colunas,
            "periodo": {
                "inicio": str(data_min),
                "fim": str(data_max)
            },
            "total_nulos": total_nulos,
            "total_duplicados": total_duplicados,
            "tempo_medio": round(tempo_medio, 2),
            "tempo_mediano": round(tempo_mediano, 2),
            "p90": round(p90, 2),
            "acima_do_tempo": total_acima_do_tempo,
            "dentro_do_tempo": total_dentro_do_tempo,
            "municipios": municipios,
            "sintomas": sintomas,
            "especialidades": especialidades,
            "manchester_stats": manchester_stats,
            "status_atendimento": status_atendimento
        }, f, indent=2, ensure_ascii=False)

    return df

if __name__ == "__main__":
    import sys
    path = "data/data_saudesync_triagem.csv"
    if len(sys.argv) > 1:
        path = sys.argv[1]
    analyze_dataset(path)
