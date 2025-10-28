import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import {Toaster} from "@/components/ui/sonner";
import ThemeProvider from "@/components/theme-components/themeProvider";
import WebsiteHeader from "@/components/websiteHeader";
import {websiteConfigs} from "@/website.configs";

export const metadata: Metadata = {
  title: websiteConfigs.title,
  description: websiteConfigs.description,
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
            <WebsiteHeader />
            {children}
            <Toaster position="bottom-left" />
        </ThemeProvider>
      </body>
    </html>
  );
}
