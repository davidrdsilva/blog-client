export interface ChangelogEntry {
    title: string;
    date: string;
    items: string[];
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
    {
        title: "Changelog goes to print",
        date: "2026-05-03",
        items: [
            "New /changelog route, set in the same editorial type as the rest of the press",
            "Page-local data file lists every release in reverse-chronological order",
        ],
    },
    {
        title: "Editor.js renderer — text blocks collapse to one chunk",
        date: "2026-05-03",
        items: [
            "Consecutive paragraphs and text blocks now flow as a single typographic chunk",
            "Tightens vertical rhythm in long-form posts",
        ],
    },
    {
        title: "Claude skills — /create-page, /decouple-code, /split-component",
        date: "2026-05-03",
        items: [
            "Three project-specific Claude skills landed under .claude/skills",
            "Each enforces the conventions in CLAUDE.md when scaffolding or refactoring code",
        ],
    },
    {
        title: "Agent guidelines move from AGENTS.md to CLAUDE.md",
        date: "2026-05-03",
        items: [
            "Single source of truth for AI-agent rules — naming, layering, anti-patterns",
            "Mirrored to CLAUDE.local.md so private overrides stay out of the public repo",
        ],
    },
    {
        title: "Comments split into article and sidebar on desktop",
        date: "2026-05-03",
        items: [
            "Discussion thread breaks out of the article column on wider screens",
            "Article and comments share a desktop two-column layout in post-shell.tsx",
        ],
    },
];
