# Projetos Dinâmicos

Gerenciador visual de projetos e atividades com mapa interativo, dashboard de progresso e sistema de feedbacks.

## Executando localmente

Abra o arquivo `index.html` diretamente no navegador:

```bash
# Usando Python (recomendado para evitar problemas de CORS)
python3 -m http.server 8000
```

Acesse: http://localhost:8000

Ou simplesmente abra `index.html` no seu navegador.

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

### Atividades
- Criar atividades com nome, descrição, stack tecnológica e prioridade
- Alterar status (planejamento → andamento → concluído)
- Definir dependências (atividades anteriores)
- Excluir atividades

### Feedbacks
- Sistema de feedbacks e sugestões
- Tipos: sugestão, crítica, elogio, reportar bug
- Filtro por tipo

### Relatórios
- Progresso por projeto
- Estatísticas gerais

## Estrutura de Arquivos

```
/
├── index.html              # Página principal (SPA)
├── static/
│   ├── css/
│   │   ├── style.css       # Estilos globais
│   │   └── mapa.css        # Estilos do mapa visual
│   ├── js/
│   │   ├── components.js   # Componentes reutilizáveis (header, footer)
│   │   ├── mapa.js         # Lógica principal do app
│   │   ├── mermaid-loader.js
│   │   └── mermaid.min.js
│   └── components/
│       ├── header.html
│       └── footer.html
```

## Dados

Os dados são armazenados no `localStorage` do navegador:
- Projetos
- Atividades
- Feedbacks

## Tecnologias

- HTML5, CSS3, JavaScript (Vanilla)
- localStorage para persistência
- Mermaid.js para diagramas (preparado)
