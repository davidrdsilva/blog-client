import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./providers/theme-provider";

export const metadata: Metadata = {
    title: "The Falls Post",
    description:
        "Your daily dose of news about politics, crime world, culture, entertainment and more",
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
