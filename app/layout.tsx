import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";

export const metadata: Metadata = {
    title: "Blog - Personal Diary",
    description:
        "A personal blog about philosophy, politics, gaming, software development, and random thoughts",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`antialiased`}>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
