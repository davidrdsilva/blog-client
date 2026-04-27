"use client";

import Image from "next/image";
import Link from "next/link";
import packageJson from "../../package.json";

export default function Footer() {
    return (
        <footer className="max-w-[1400px] mx-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 md:py-16 mt-20">
            <div className="container mx-auto justify-between px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-12">
                    <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                        <Link href="/">
                            <Image
                                src="/images/logo.png"
                                alt="The Falls Post"
                                width={180}
                                height={90}
                                className="mb-2 dark:invert"
                            />
                        </Link>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                            The Falls Post is a premier digital publication dedicated to delivering
                            insightful journalism, breaking news, and in-depth analysis on the
                            stories that shape our world.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                        <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs mb-2">
                            Sections
                        </h3>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Front Page
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            World
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Politics
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Business
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Technology
                        </Link>
                    </div>

                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                        <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs mb-2">
                            About Us
                        </h3>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Our Story
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Careers
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Contact Us
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Advertise
                        </Link>
                    </div>

                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                        <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs mb-2">
                            Pages
                        </h3>
                        <Link
                            href="/posts/new"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Publish with Us
                        </Link>
                        <Link
                            href="/admin/manage-posts"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Manage Articles
                        </Link>
                        <Link
                            href="/admin/characters"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Manage Cast
                        </Link>
                        <Link
                            href="/"
                            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
                        >
                            Newsletters
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <Link
                            href="/"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            Cookie Policy
                        </Link>
                        <Link
                            href="/"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            Accessibility Help
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <p>© {new Date().getFullYear()} The Falls Post. All rights reserved.</p>
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
                            v{packageJson.version}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
