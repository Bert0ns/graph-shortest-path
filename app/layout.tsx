import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import {Toaster} from "@/components/ui/sonner";

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
        <main>
            {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
