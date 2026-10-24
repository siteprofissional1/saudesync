"""
SAÚDE SYNC — Gemini Insights Agent
Gera sínteses operacionais estruturadas a partir de contexto determinístico fornecido.
"""

import json
import logging
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.config import GEMINI_API_KEY

logger = logging.getLogger("saudesync.gemini_agent")

SYSTEM_INSTRUCTION = """
Você é o Agente Especialista em Inteligência Operacional Hospitalar do projeto Saúde Sync (Hackathon Antigravity SENAI).
Sua missão é transformar dados operacionais consolidados e métricas exatas em relatórios executivos em linguagem natural fluida e profissional.

DIRETRIZES FUNDAMENTAIS E INEGOCIÁVEIS:
1. VERACIDADE ESTRITA: Use estritamente as métricas, contagens e percentuais fornecidos no payload de contexto. NUNCA invente números ou altere percentuais já calculados.
2. LIMITES ÉTICOS E CLÍNICOS: Você atua em inteligência de gestão hospitalar. É terminantemente PROIBIDO fazer diagnósticos de doenças, prescrever medicamentos, sugerir doses ou propor intervenções clínicas individuais.
3. CONTEXTO ACADÊMICO: O projeto utiliza um conjunto de dados simulado para fins de demonstração acadêmica.
4. FORMATO DE SAÍDA: Responda em Português do Brasil com tom analítico, propositivo e estruturado em categorias claras de gestão (Fluxo, Filas, Tempo de Espera, Especialidades e Regionalização).
"""

class GeminiAgent:
    """
    Agente de IA Generativa: Especialista em interpretação e redação de insights operacionais.
    """
    def __init__(self):
        self.api_key = GEMINI_API_KEY

    def generate_insights_from_context(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Submete o contexto determinístico consolidado ao Gemini ou aciona fallback estruturado.
        """
        # Se chave Gemini não estiver configurada, utilizar motor analítico local
        if not self.api_key or self.api_key.strip() == "":
            logger.info("Chave GEMINI_API_KEY não configurada. Ativando fallback de insights analíticos determinísticos.")
            return self._generate_rule_based_insights(context, source="Motor Analítico Local (Chave Gemini pendente)")

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            headers = {"Content-Type": "application/json"}

            prompt_content = f"""
Com base EXCLUSIVAMENTE nas métricas operacionais consolidadas abaixo, gere 4 insights estratégicos de gestão hospitalar:

METRICAS DETERMINISTICAS CONSOLIDADAS:
- Total de Atendimentos: {context.get('total_atendimentos')}
- Tempo Médio de Espera Geral: {context.get('tempo_medio_espera_min')} minutos (Mediana: {context.get('tempo_mediano_espera_min')} min | P90: {context.get('p90_espera_min')} min)
- Pacientes Acima do Tempo de Referência: {context.get('pacientes_acima_tempo')} ({context.get('percentual_acima_tempo')}%)
- Especialidade com Maior Demanda: {context.get('especialidade_lider')}
- Município com Maior Volume: {context.get('municipio_lider')}
- Horário de Pico de Chegada: {context.get('horario_pico')} com {context.get('volume_no_pico')} atendimentos
- Concentração de Ourinhos: {context.get('concentracao_ourinhos_pct', 44.6)}% do total
- Violações por Manchester: {json.dumps(context.get('violacoes_por_classe', {}), ensure_ascii=False)}

Retorne um JSON puro (sem formatação markdown ```json) contendo uma lista de objetos com as chaves:
- "categoria": (ex: "Fluxo Operacional", "Tempo de Espera", "Demanda Regional", "Especialidades")
- "titulo": Título curto e impactante
- "texto": Texto analítico de 2 a 3 frases explicando o padrão operacional
- "metricas_utilizadas": Frase curta citando os números exatos utilizados
"""

            payload = {
                "contents": [{
                    "role": "user",
                    "parts": [{"text": SYSTEM_INSTRUCTION + "\n\n" + prompt_content}]
                }],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 1000
                }
            }

            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Limpar possíveis blocos markdown ```json
                if raw_text.startswith("```"):
                    raw_text = raw_text.split("\n", 1)[1]
                if raw_text.endswith("```"):
                    raw_text = raw_text.rsplit("\n", 1)[0]
                insights_json = json.loads(raw_text)

                # Formatar saída com timestamp
                timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
                for item in insights_json:
                    item["timestamp"] = timestamp
                    item["origem"] = "Google Gemini AI (1.5 Flash)"
                return insights_json
            else:
                logger.warning(f"Chamada ao Gemini retornou código {resp.status_code}: {resp.text}")
                return self._generate_rule_based_insights(context, source="Motor Analítico Local (Falha temporária na API Gemini)")

        except Exception as e:
            logger.warning(f"Exceção ao chamar Gemini API: {e}")
            return self._generate_rule_based_insights(context, source="Motor Analítico Local (Fallback de Resiliência)")

    def _generate_rule_based_insights(self, context: Dict[str, Any], source: str) -> List[Dict[str, Any]]:
        """
        Gera insights determinísticos inteligentes baseados em regras operacionais.
        Garante que a tela nunca fique em branco ou dependa exclusivamente de chave externa.
        """
        timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
        total = context.get("total_atendimentos", 1200)
        tempo_medio = context.get("tempo_medio_espera_min", 61.2)
        p90 = context.get("p90_espera_min", 126.1)
        acima = context.get("pacientes_acima_tempo", 250)
        perc_acima = context.get("percentual_acima_tempo", 20.8)
        esp_lider = context.get("especialidade_lider", "Clínica Geral")
        muni_lider = context.get("municipio_lider", "Ourinhos")
        horario_pico = context.get("horario_pico", "10:00")

        return [
            {
                "categoria": "Fluxo e Capacidade",
                "titulo": f"Concentração Crítica na Especialidade {esp_lider}",
                "texto": f"A especialidade {esp_lider} concentra a maior parcela dos atendimentos na base analisada, indicando que a escala médica desse setor é o principal determinante para a vazão geral da unidade.",
                "metricas_utilizadas": f"Especialidade mais demandada: {esp_lider} em base de {total} atendimentos.",
                "timestamp": timestamp,
                "origem": source
            },
            {
                "categoria": "Tempo de Espera e Metas",
                "titulo": "Cumprimento de Tempos de Referência Manchester",
                "texto": f"Aproximadamente {perc_acima}% dos atendimentos ({acima} pacientes) ultrapassaram o tempo máximo tolerado pelo protocolo de Manchester. Enquanto a média é de {tempo_medio} minutos, o percentil 90 atinge {p90} minutos.",
                "metricas_utilizadas": f"Média: {tempo_medio} min | P90: {p90} min | Acima do tempo: {acima} ({perc_acima}%).",
                "timestamp": timestamp,
                "origem": source
            },
            {
                "categoria": "Demanda Regional",
                "titulo": f"Polo de Acolhimento Centrado em {muni_lider}",
                "texto": f"{muni_lider} representa a maior fatia da demanda da unidade, demonstrando a importância da integração de fluxos e contrarreferência com a rede básica dos municípios vizinhos.",
                "metricas_utilizadas": f"Município líder: {muni_lider} entre 9 municípios atendidos.",
                "timestamp": timestamp,
                "origem": source
            },
            {
                "categoria": "Gestão de Escalas",
                "titulo": f"Pico Operacional Concentrado no Período das {horario_pico}",
                "texto": f"O pico de chegada de pacientes ocorre prioritariamente na faixa das {horario_pico}. O remanejamento de plantonistas para reforço nas salas de triagem nesse intervalo pode reduzir substancialmente a formação de filas.",
                "metricas_utilizadas": f"Maior volume de acolhimento identificado na faixa das {horario_pico}.",
                "timestamp": timestamp,
                "origem": source
            }
        ]
