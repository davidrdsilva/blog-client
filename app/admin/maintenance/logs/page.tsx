import type { Metadata } from "next";

import Footer from "@/app/components/footer";
import NavBar from "@/app/components/navbar";
import { getSystemLogs } from "@/app/lib/api";

import SystemLogsFeed from "./system-logs-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "System Logs",
    description: "In-memory API log feed for the running instance.",
};

export default async function SystemLogsPage() {
    const snapshot = await getSystemLogs();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
            <NavBar />
            <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 max-w-5xl">
                <SystemLogsFeed initialEntries={snapshot.entries} capacity={snapshot.capacity} />
            </main>
            <Footer />
        </div>
    );
}
