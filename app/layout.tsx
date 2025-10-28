import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import {Toaster} from "@/components/ui/sonner";
import ThemeProvider from "@/components/theme-components/themeProvider";

export const metadata: Metadata = {
  title: "Shortest Path Finder",
  description: "Visualize and find the shortest path in custom graphs using Dijkstra's algorithm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <main>
                {children}
            </main>
            <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
