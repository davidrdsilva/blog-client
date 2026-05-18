import Image from "next/image";
import Link from "next/link";
import MainNavSidebar from "./main-nav-sidebar";
import StockTicker from "./stock-ticker";
import { ThemeToggle } from "./theme-toggle";

export default function NavBar() {
    return (
        <header className="max-w-[1400px] mx-auto bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
            <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-7 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-6">
                <div className="justify-self-start">
                    <MainNavSidebar />
                </div>
                <div className="justify-self-center min-w-0 w-full flex justify-center">
                    <Link href="/" aria-label="The Falls Post — Home" className="block max-w-full">
                        <Image
                            src="/images/tfp.png"
                            alt="The Falls Post"
                            width={1080}
                            height={180}
                            priority
                            sizes="(max-width: 640px) 220px, (max-width: 1024px) 480px, 720px"
                            className="invert dark:invert-0 w-full max-w-[220px] sm:max-w-[420px] md:max-w-[560px] lg:max-w-[720px] h-auto"
                        />
                    </Link>
                </div>
                <div className="justify-self-end">
                    <ThemeToggle />
                </div>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800">
                <StockTicker />
            </div>
        </header>
    );
}
