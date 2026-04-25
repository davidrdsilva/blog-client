import Link from "next/link";
import type { CategoryWithCount } from "@/app/types/post";

interface CategoriesStripProps {
    categories: CategoryWithCount[];
    activeId?: number;
}

/**
 * CategoriesStrip renders a horizontal list of category pills above the post
 * list on the homepage. Selecting one navigates to /?category=<id> (and the
 * "All" pill clears the filter by linking to /).
 */
export default function CategoriesStrip({ categories, activeId }: CategoriesStripProps) {
    if (categories.length === 0) return null;

    const totalAll = categories.reduce((sum, c) => sum + c.total_posts, 0);

    return (
        <nav
            aria-label="Filter by category"
            className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800"
        >
            <CategoryPill href="/" label="All" count={totalAll} active={activeId === undefined} />
            {categories.map((c) => (
                <CategoryPill
                    key={c.id}
                    href={`/?category=${c.id}`}
                    label={c.name}
                    count={c.total_posts}
                    active={activeId === c.id}
                />
            ))}
        </nav>
    );
}

interface CategoryPillProps {
    href: string;
    label: string;
    count: number;
    active: boolean;
}

function CategoryPill({ href, label, count, active }: CategoryPillProps) {
    const base =
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors";
    const activeCls =
        "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100";
    const idleCls =
        "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800";
    return (
        <Link href={href} className={`${base} ${active ? activeCls : idleCls}`}>
            {label}
            <span className="text-xs opacity-70">{count}</span>
        </Link>
    );
}
