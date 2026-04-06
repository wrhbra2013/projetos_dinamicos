# Projetos Dinâmicos

Gerenciador visual de projetos e atividades com mapa interativo, dashboard de progresso e sistema de feedbacks.

## Como usar

Abra o arquivo `index.html` diretamente no navegador, ou use um servidor local:

```bash
# Python (recomendado para evitar problemas de CORS)
python3 -m http.server 8000

# Node.js
npx serve .
```

Acesse: http://localhost:8000

## Estrutura do Projeto

```
projetos_dinamicos/
├── index.html              # Página principal (SPA)
├── downloads.html           # Página de downloads
├── static/                 # Arquivos estáticos
│   ├── css/
│   │   ├── style.css       # Estilos globais
│   │   └── mapa.css        # Estilos do mapa visual
│   ├── js/
│   │   ├── core/           # Núcleo da aplicação
│   │   │   ├── db.js       # Acesso a dados
│   │   │   ├── storage.js  # Armazenamento local
│   │   │   ├── api-client.js
│   │   │   └── theme.js    # Tema visual
│   │   ├── features/       # Funcionalidades
│   │   │   ├── mapa.js     # Mapa visual
│   │   │   ├── kanban.js   # Quadro Kanban
│   │   │   ├── timeline.js # Linha do tempo
│   │   │   ├── wizard.js   # Assistente de criação
│   │   │   ├── insights.js # Análises
│   │   │   ├── export.js   # Exportação
│   │   │   ├── project-dashboard.js
│   │   │   ├── keyboard.js # Atalhos
│   │   │   └── performance.js
│   │   ├── vendor/         # Bibliotecas de terceiros
│   │   │   ├── mermaid.min.js
│   │   │   └── mermaid-loader.js
│   │   └── components.js   # Componentes UI
│   └── components/         # Templates HTML
│       ├── header.html
│       └── footer.html
├── api.php                 # API REST (opcional, requer PHP)
├── data/                   # Dados JSON
├── releases/               # Builds para download
├── tauri/                  # Código desktop (Tauri)
├── dist/                   # Build output
├── config/                 # Configurações de build
│   ├── package.json
│   ├── vite.config.js
│   ├── capacitor.config.json
│   ├── build.sh
│   └── git-sync.sh
└── docs/                   # Documentação
    ├── CNAME
    └── stripe-tutorial.txt
```

## Funcionalidades

### Dashboard
- Visão geral de todos os projetos
- Progresso global de atividades
- Lista de projetos com status e progresso individual
- Criação de novos projetos via modal

### Mapa Visual
- Visualização gráfica de atividades por projeto
- Representação visual por status (planejamento, andamento, concluído)
- Arrastar nós do mapa
- Painel de detalhes ao clicar em uma atividade
- Gerenciar dependências entre atividades

### Kanban
- Quadro visual com colunas: Backlog, Em Andamento, Concluído
- Arrastar cards entre colunas
- Filtrar por projeto

### Timeline
- Visualização cronológica das atividades
- Navegação por data

### Insights
- Estatísticas e análises
- Velocity e Burndown
- Recomendações baseadas em IA

### Wizard de Projetos
- Assistente passo a passo para criar projetos
- Templates pré-definidos
- Análise de viabilidade

## Tecnologias

- HTML5, CSS3, JavaScript (Vanilla)
- localStorage para persistência
- TensorFlow.js para sugestões de IA
- Mermaid.js para diagramas
- Tauri (desktop)
- Capacitor (mobile)

## Build

Para gerar builds de produção:

```bash
cd config
./build.sh
```

Isso gera instaladores para Windows, macOS, Linux e Android.
