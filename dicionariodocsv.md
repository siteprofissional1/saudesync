saudesync Regional — Triagem Manchester & Gestão Hospitalar
Arquivo: data_healthsync_triagem_2.csv
Base indicada: 1.200 registros × 24 colunas.
1. atendimento_id
   - Tipo: string
   - Versão: Original
   - Descrição: Chave primária do prontuário de atendimento no pronto-socorro.
   - Exemplo: ATD-9001
2. data_hora_chegada
   - Tipo: datetime
   - Versão: Nova
   - Descrição: Data e hora de abertura da ficha na recepção.
   - Formato: YYYY-MM-DD HH:MM:SS
   - Exemplo: 2026-02-10 08:14:00
3. senha_painel
   - Tipo: string
   - Versão: Nova
   - Descrição: Código da senha exibida na TV de chamada ao vivo via Firestore.
   - Exemplo: EMG-104
4. paciente_idade
   - Tipo: int
   - Versão: Original
   - Descrição: Idade do paciente em anos completos.
   - Intervalo informado: 1 a 96 anos.
   - Exemplo: 64
5. paciente_sexo
   - Tipo: string
   - Versão: Nova
   - Descrição: Sexo biológico registrado no cadastro.
   - Valores: M ou F
   - Exemplo: M
6. municipio_origem
   - Tipo: string
   - Versão: Nova
   - Descrição: Município de residência.
   - Exemplos: Ourinhos, Santa Cruz do Rio Pardo, Chavantes etc.
   - Exemplo: Ourinhos
7. sintoma_principal
   - Tipo: string
   - Versão: Original
   - Descrição: Queixa principal relatada durante a triagem.
   - Exemplos: dor torácica, dispneia, trauma etc.
   - Exemplo: Dor Torácica Aguda
8. comorbidades
   - Tipo: string
   - Versão: Nova
   - Descrição: Doenças pré-existentes relevantes.
   - Exemplos: HAS, Diabetes, DPOC, Cardiopatia etc.
   - Exemplo: Hipertensão + Diabetes
9. pressao_arterial
   - Tipo: string
   - Versão: Original
   - Descrição: Pressão arterial em formato textual clínico PAS/PAD.
   - Exemplo: 170/105
10. pressao_sistolica_mmhg
    - Tipo: int
    - Versão: Nova
    - Descrição: Pressão arterial sistólica em formato numérico, pronta para gráficos.
    - Unidade: mmHg
    - Exemplo: 170     Guia Técnico e Dicionário de Da…
11. pressao_diastolica_mmhg
    - Tipo: int
    - Versão: Nova
    - Descrição: Pressão arterial diastólica numérica em mmHg.
    - Exemplo: 105
12. frequencia_cardiaca_bpm
    - Tipo: int
    - Versão: Original
    - Descrição: Batimentos cardíacos por minuto medidos no oxímetro/monitor.
    - Exemplo: 118
13. temperatura_axilar_c
    - Tipo: float
    - Versão: Nova
    - Descrição: Temperatura corporal axilar em graus Celsius.
    - Exemplo: 36.9
14. saturacao_o2_percent
    - Tipo: int
    - Versão: Nova
    - Descrição: Saturação periférica de oxigênio, SpO₂, medida por oximetria de pulso.
    - Exemplo: 91
15. glicemia_capilar_mg_dl
    - Tipo: int
    - Versão: Nova
    - Descrição: Glicemia capilar/dextro na admissão em mg/dL.
    - Exemplo: 215
16. escala_dor_0_10
    - Tipo: int
    - Versão: Nova
    - Descrição: Escala Visual Analógica de dor.
    - Intervalo: 0 sem dor até 10 dor intensa.
    - Exemplo: 9
17. classificacao_manchester
    - Tipo: string
    - Versão: Original
    - Descrição: Cor e nível de prioridade segundo o Protocolo de Manchester.
    - Valores: Vermelho, Laranja, Amarelo, Verde ou Azul.
    - Exemplo: Vermelho - Emergência
18. tempo_espera_max_min
    - Tipo: int
    - Versão: Original
    - Descrição: Tempo-alvo máximo em minutos definido pelo protocolo.
    - Valores: 0, 10, 60, 120 ou 240
    - Exemplo: 0
19. tempo_espera_real_min
    - Tipo: int
    - Versão: Nova
    - Descrição: Tempo efetivo que o paciente aguardou até o atendimento médico.
    - Exemplo: 2
20. especialidade_requerida
    - Tipo: string
    - Versão: Original
    - Descrição: Especialidade médica para encaminhamento.
    - Exemplos: Cardiologia, Ortopedia etc.
    - Exemplo: Cardiologia     Guia Técnico e Dicionário de Da…