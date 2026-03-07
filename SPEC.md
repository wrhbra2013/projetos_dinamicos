# SPEC.md - Dashboard de Projetos Flask

## 1. Project Overview
- **Project Name**: ProjeDy - Dashboard de Gestão de Projetos
- **Type**: Web Application (Flask)
- **Core Functionality**: Dashboard para gerenciar projetos e atividades com relatórios em PDF
- **Target Users**: Equipes de desenvolvimento que precisam controlar projetos e atividades

## 2. UI/UX Specification

### Layout Structure
- **Header**: Logo "ProjeDy" + navegação
- **Main Content**: Container centralizado com max-width 1200px
- **Footer**: Copyright

### Responsive Breakpoints
- Mobile: < 768px (1 coluna)
- Tablet: 768px - 1024px (2 colunas)
- Desktop: > 1024px (3 colunas)

### Visual Design
- **Color Palette**:
  - Primary: #1a1a2e (fundo escuro)
  - Secondary: #16213e (cards)
  - Accent: #0f3460 (hover)
  - Highlight: #e94560 (botões, alertas)
  - Text Primary: #eaeaea
  - Text Secondary: #a0a0a0
  - Success: #00d26a
  - Warning: #ffc107
  - Danger: #dc3545

- **Typography**:
  - Font Family: 'Segoe UI', system-ui, sans-serif
  - Headings: 700 weight, 1.5rem - 2rem
  - Body: 400 weight, 1rem

- **Spacing**: 8px base (8, 16, 24, 32, 48)

- **Effects**: 
  - Cards: box-shadow 0 4px 20px rgba(0,0,0,0.3)
  - Hover: transform scale(1.02), transition 0.3s
  - Border-radius: 12px

### Components

#### Página 1 - Dashboard (/)
- Grid de cards de projetos
- Cada card mostra: nome, descrição, data criação
- Botão "Ver Atividades" em cada card
- Card "Novo Projeto" para adicionar projetos

#### Página 2 - Formulário (/projeto/<id>)
- Título do projeto no header
- Formulário com campos:
  - Nome da Atividade (text)
  - Stack (select: Frontend, Backend, Banco de Dados, Cloud)
  - Data/Hora (datetime-local)
  - Prioridade (select: Alta - 1 dia, Média - 2 dias, Baixa - 3 dias)
  - Relatório de Execução (textarea)
- Botão "Salvar Atividade"

#### Página 3 - Relatório (/relatorio)
- Tabela com todas as atividades
- Colunas: Projeto, Atividade, Stack, Data, Prioridade, Relatório
- Filtros por projeto e por prioridade
- Botão "Gerar PDF" para download

## 3. Functionality Specification

### Database (PostgreSQL)
- Tabela `projetos`: id, nome, descricao, data_criacao
- Tabela `atividades`: id, projeto_id, nome, stack, data_hora, prioridade, relatorio, created_at

### Rotas Flask
- GET / - Lista projetos
- POST /projeto - Cria novo projeto
- GET /projeto/<id> - Formulário de atividades
- POST /projeto/<id>/atividade - Salva atividade
- GET /relatorio - Lista todas atividades com filtros
- GET /relatorio/pdf - Gera PDF

### Funcionalidades
- Criar/listar projetos
- Adicionar atividades a projetos
- Listar atividades com filtros
- Gerar relatório PDF com pandas e fpdf

## 4. Acceptance Criteria
- [ ] Dashboard exibe cards de projetos do PostgreSQL
- [ ] Ao clicar em card, abre formulário de atividades
- [ ] Formulário salva dados com timestamp
- [ ] Página de relatório mostra todas atividades
- [ ] Filtros funcionam corretamente
- [ ] Botão gera PDF com pandas
- [ ] Design responsivo funciona em mobile
- [ ] CSS puro, sem frameworks
