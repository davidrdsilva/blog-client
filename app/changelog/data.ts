export interface ChangelogEntry {
    title: string;
    date: string;
    items: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
    {
        title: "Masthead em estilo editorial — Guardian/NYT",
        date: "2026-05-18",
        items: [
            "Logotipo da TFP ganha o centro do cabeçalho, em corpo maior, ladeado por menu e alternador de tema",
            "Faixa de ações migra para uma tira própria abaixo do masthead, visível também em telas pequenas",
            "navbar.tsx volta a ser Server Component, removendo JS desnecessário do bundle do cliente",
        ],
    },
    {
        title: "Whitenest — dossiê de personagens estreia na bancada",
        date: "2026-05-16",
        items: [
            "Nova página de dossiê para cada personagem do universo Whitenest",
            "Radar de atributos torna-se interativo, com leitura ponto a ponto",
            "Galeria de personagens ganha slideshow e variante de preenchimento (fill)",
            "Quatro células do ledger reorganizam-se como uma grade 2×2 de cartões",
            "Polimento geral da diagramação da página do personagem",
        ],
    },
    {
        title: "Admin — página de manutenção de logs do sistema",
        date: "2026-05-08",
        items: [
            "Nova rota /admin/maintenance/logs reúne os eventos do sistema em um único painel",
        ],
    },
    {
        title: "O changelog vai para o prelo",
        date: "2026-05-03",
        items: [
            "Nova rota /changelog, composta na mesma tipografia editorial do restante do jornal",
            "Arquivo de dados local lista cada versão em ordem cronológica inversa",
        ],
    },
    {
        title: "Renderizador do Editor.js — blocos de texto se fundem num só",
        date: "2026-05-03",
        items: [
            "Parágrafos e blocos de texto consecutivos passam a fluir como um único bloco tipográfico",
            "Aperta o ritmo vertical em posts longos",
        ],
    },
    {
        title: "Skills do Claude — /create-page, /decouple-code, /split-component",
        date: "2026-05-03",
        items: [
            "Três skills específicas do projeto desembarcam em .claude/skills",
            "Cada uma reforça as convenções do CLAUDE.md ao gerar ou refatorar código",
        ],
    },
    {
        title: "Diretrizes de agente migram de AGENTS.md para CLAUDE.md",
        date: "2026-05-03",
        items: [
            "Fonte única de verdade para as regras dos agentes de IA — nomenclatura, camadas, antipadrões",
            "Espelhado em CLAUDE.local.md para manter ajustes privados fora do repositório público",
        ],
    },
    {
        title: "Comentários ganham coluna própria no desktop",
        date: "2026-05-03",
        items: [
            "A discussão se desprende da coluna do artigo em telas largas",
            "Artigo e comentários dividem um layout de duas colunas em post-shell.tsx",
        ],
    },
];
