"use client"
import {ThemeProvider as NextThemesProvider} from "next-themes"
import React, {useEffect} from "react";
import LoadingTheme from "@/components/theme-components/loadingTheme";

export default function ThemeProvider({
                                          children,
                                          ...props
                                      }: React.ComponentProps<typeof NextThemesProvider>) {

    const [isMounted, setIsMounted] = React.useState(false);

    useEffect(() => {
        // Schedule state update asynchronously to avoid cascading renders warning.
        const id = window.setTimeout(() => {
            setIsMounted(true);
        }, 0);
        return () => window.clearTimeout(id);
    }, [])

    if (!isMounted) {
        return <LoadingTheme/>;
    }

    return (
        <NextThemesProvider {...props}>
            {children}
        </NextThemesProvider>
    )
}