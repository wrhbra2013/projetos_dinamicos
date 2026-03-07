# Projetos Dinâmicos

Este projeto gerencia projetos e atividades, gera relatórios e exporta PDF textual com resumo de progresso por projeto.

## Executando localmente

1. Crie e ative um ambiente virtual (recomendado):

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Instale dependências:

```bash
pip install -r requirements.txt
```

3. Configure a variável `DATABASE_URL` se necessário (opcional). Por padrão o app usa:

```
postgresql://postgres:wander@localhost:5432/projedydb
```

4. Rode a aplicação:

```bash
python app.py
```

Acesse: http://127.0.0.1:5000

## URLs úteis

- Página de relatório (lista): `/relatorio`
- Fluxograma visual: `/relatorio/fluxograma` (usa Mermaid local em `static/js/mermaid.min.js` quando disponível)
- Exportar PDF textual resumido: `/relatorio/pdf`

Você pode passar filtros comuns como query params:

- `?projeto_id=1`
- `?status=andamento` (valores esperados: `planejamento`, `andamento`, `concluido`)
- `?prioridade=alta`

Exemplo:

```
http://127.0.0.1:5000/relatorio/pdf?projeto_id=2&status=andamento
```

## PDF textual gerado

O endpoint `/relatorio/pdf` gera um PDF chamado `relatorio_resumo.pdf` contendo:

- Resumo por projeto (total de atividades, concluídas e porcentagem)
- Estimativa de progresso temporal quando houver datas planejadas
- Lista resumida de atividades por projeto
- Seção "Auditoria Rápida e Recomendações"

O PDF é gerado com a biblioteca `fpdf` (já listada em `requirements.txt`).

## Ativar Mermaid local

O projeto contém um loader em `static/js/mermaid-loader.js` que tenta carregar `static/js/mermaid.min.js` localmente e, caso não exista, faz fallback para o CDN.

Para uso totalmente local, baixe o script do Mermaid e coloque em `static/js/`:

```bash
curl -L https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js -o static/js/mermaid.min.js
```

Após isso, abra `/relatorio/fluxograma` e o Mermaid será carregado localmente.

## Próximos passos recomendados

- Melhorar o layout do fluxograma (agrupamento por projeto com `subgraph`, direção TD/LR)
- Exportar PDF visual renderizando a página (ex.: Playwright/Chromium) — opcional se quiser PDF fiel ao visual
- Adicionar testes e CI para garantir estabilidade
- Avaliar índices no banco (colunas: `projeto_id`, `status`, `prioridade`)

## Contato

Para dúvidas ou melhorias, abra uma issue localmente ou comente o código nas rotas relevantes (`app.py`).

---
Gerado automaticamente por assistente — atualize conforme necessário.
