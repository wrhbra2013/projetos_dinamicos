const DB_KEY = 'apoia_data';

function getDefaultData() {
    return {
        subjects: [
            { id: 'p1', name: 'O Sol Poente', description: 'Romance literário sobre memória e identidade', icon: '📖', color: '#6366f1', createdAt: '2025-03-10' },
            { id: 'p2', name: 'Versos Livres', description: 'Coletânea de poemas contemporâneos', icon: '✒️', color: '#ec4899', createdAt: '2025-03-12' },
            { id: 'p3', name: 'Mudanças Climáticas na Amazônia', description: 'Pesquisa sobre impacto ambiental na floresta', icon: '🌳', color: '#10b981', createdAt: '2025-03-15' },
            { id: 'p4', name: 'IA na Educação', description: 'Estudo sobre inteligência artificial no ensino', icon: '🤖', color: '#f59e0b', createdAt: '2025-03-18' },
            { id: 'p5', name: 'Contos da Cidade', description: 'Coletânea de contos urbanos', icon: '🏙️', color: '#14b8a6', createdAt: '2025-03-20' },
        ],
        summaries: [
            {
                id: 'd1', subjectId: 'p1', title: 'Capítulo 1 - O Despertar',
                content: 'CAPÍTULO 1 — O DESPERTAR\n\nA luz da manhã entrava pelas frestas da janela, desenhando linhas douradas no chão de tábuas gastas. Elena abriu os olhos lentamente, como quem emerge de um sonho profundo.\n\nHavia algo diferente naquele dia. O ar parecia mais denso, carregado de possibilidades que ela não sabia nomear. Sentou-se na cama e observou o quarto — os livros empilhados no canto, a xícara de café fria sobre a mesa de cabeceira, o retrato desbotado da avó.\n\n— Hoje é o dia — murmurou para si mesma, embora não soubesse exatamente o que isso significava.\n\nVinte anos vivendo na mesma cidade, na mesma casa, no mesmo quarto. E de repente, uma carta sem remetente trouxera de volta todas as perguntas que ela havia enterrado no fundo do peito.\n\nNOTAS DO AUTOR:\n- Revisar a descrição da cidade no capítulo 2\n- Incluir mais elementos sensoriais (cheiros, texturas)\n- Verificar cronologia dos flashbacks',
                createdAt: '2025-03-20', updatedAt: '2025-03-25'
            },
            {
                id: 'd2', subjectId: 'p1', title: 'Capítulo 2 - A Carta',
                content: 'CAPÍTULO 2 — A CARTA\n\nO envelope era de um papel amarelado, com textura áspera. Elena o segurou por um longo minuto antes de abri-lo, sentindo o peso das palavras que ainda não havia lido.\n\n— Quem entregou isso? — perguntou ao vizinho.\n\n— Não sei, menina. Estava debaixo da porta quando acordei.\n\nEla rasgou o selo com cuidado. Dentro, uma folha única, escrita com caligrafia firme e elegante:\n\n"Nem todo segredo merece ser enterrado. Alguns esperam o tempo certo para vir à tona. Quando estiver pronta, procure a Rua das Acácias, número 42. Há respostas que só o silêncio pode guardar."\n\nNão havia assinatura.\n\nElena leu e releu as palavras cinco vezes. A caligrafia era familiar, mas por mais que forçasse a memória, não conseguia situá-la.\n\nNOTAS DO AUTOR:\n- Criar mais tensão/mistério neste capítulo\n- Descrever melhor a Rua das Acácias\n- Adicionar flashback da infância de Elena',
                createdAt: '2025-03-28', updatedAt: '2025-04-02'
            },
            {
                id: 'd3', subjectId: 'p3', title: 'Introdução - Contexto Ambiental',
                content: 'INTRODUÇÃO\n\nA Floresta Amazônica, maior bioma tropical do mundo, enfrenta uma crise sem precedentes. Este estudo analisa os impactos das mudanças climáticas na região entre 2010 e 2025, com foco em três variáveis principais: temperatura média, precipitação pluviométrica e frequência de eventos extremos.\n\nMETODOLOGIA\n\nForam utilizados dados do INPE (Instituto Nacional de Pesquisas Espaciais) e do IPCC, combinados com imagens de satélite da NASA. A análise estatística foi realizada usando regressão linear multivariada e modelos de séries temporais.\n\nRESULTADOS PRELIMINARES\n\n1. A temperatura média na região aumentou 1,2°C desde 2010\n2. A estação seca se alongou em média 18 dias\n3. A frequência de queimadas aumentou 34% na última década\n\nREFERÊNCIAS\n\n- INPE (2024). Relatório de Desmatamento\n- IPCC (2023). Sixth Assessment Report\n- Nobre, C. et al. (2022). Amazon Tipping Point',
                createdAt: '2025-04-01', updatedAt: '2025-04-05'
            },
        ],
        tests: [
            {
                id: 'r1', subjectId: 'p1', title: 'Revisão do Capítulo 1',
                description: 'Critérios de avaliação para o primeiro capítulo do romance.',
                questions: [
                    { id: 'c1', question: 'A ambientação do capítulo é envolvente?', options: ['Sim, totalmente', 'Parcialmente', 'Não, precisa melhorar', 'Não se aplica'], correct: 0 },
                    { id: 'c2', question: 'O desenvolvimento da protagonista é consistente?', options: ['Sim, muito bem construída', 'Razoável', 'Superficial', 'Inconsistente'], correct: 0 },
                    { id: 'c3', question: 'O ritmo da narrativa está adequado?', options: ['Bom ritmo', 'Um pouco lento', 'Muito acelerado', 'Desigual'], correct: 0 },
                    { id: 'c4', question: 'Os diálogos soam naturais?', options: ['Naturais e fluidos', 'Um pouco formais', 'Forçados', 'Não há diálogos'], correct: 0 },
                    { id: 'c5', question: 'A descrição sensorial é eficaz?', options: ['Rica e envolvente', 'Suficiente', 'Escassa', 'Excessiva'], correct: 0 },
                ],
                createdAt: '2025-03-25'
            },
            {
                id: 'r2', subjectId: 'p3', title: 'Revisão do Artigo - Metodologia',
                description: 'Avaliação da seção de metodologia da pesquisa.',
                questions: [
                    { id: 'c1', question: 'A metodologia está claramente descrita?', options: ['Clara e detalhada', 'Aceitável', 'Vaga', 'Ausente'], correct: 0 },
                    { id: 'c2', question: 'Os métodos estatísticos são apropriados?', options: ['Sim, bem aplicados', 'Adequados mas superficiais', 'Inadequados', 'Não especificados'], correct: 0 },
                    { id: 'c3', question: 'As fontes de dados são confiáveis?', options: ['Fontes robustas e atuais', 'Aceitáveis', 'Desatualizadas', 'Não citadas'], correct: 0 },
                    { id: 'c4', question: 'Há reprodutibilidade na metodologia?', options: ['Sim, totalmente replicável', 'Parcialmente', 'Não replicável', 'Não se aplica'], correct: 0 },
                    { id: 'c5', question: 'As limitações do estudo são discutidas?', options: ['Sim, de forma transparente', 'Mencionadas brevemente', 'Ignoradas', 'Não se aplica'], correct: 0 },
                ],
                createdAt: '2025-04-05'
            },
        ],
        results: []
    };
}

function loadData() {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            return getDefaultData();
        }
    }
    const def = getDefaultData();
    saveData(def);
    return def;
}

function saveData(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function resetData() {
    localStorage.removeItem(DB_KEY);
    return getDefaultData();
}

function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
