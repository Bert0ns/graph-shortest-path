import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import {Toaster} from "@/components/ui/sonner";
import ThemeProvider from "@/components/theme-components/themeProvider";
import WebsiteHeader from "@/components/websiteHeader";
import {websiteConfigs} from "@/website.configs";
import {NextFontWithVariable} from "next/dist/compiled/@next/font";
import {Poppins} from "next/font/google";


const poppins: NextFontWithVariable = Poppins({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
    variable: '--font-poppins',
    display: 'swap',
})

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
      <body className={`${poppins.variable} font-serif antialiased min-h-screen`}>
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
