"use client"
import {ThemeProvider as NextThemesProvider} from "next-themes"
import React, {useEffect} from "react";
import LoadingTheme from "@/components/theme-components/loadingTheme";

export default function ThemeProvider({
                                          children,
                                          ...props
                                      }: React.ComponentProps<typeof NextThemesProvider>) {

    const [isMounted, setIsMounted] = React.useState(false);
    const [showLoader, setShowLoader] = React.useState(true);
    const [isExiting, setIsExiting] = React.useState(false);

    useEffect(() => {
        // schedule mount
        const id = window.setTimeout(() => {
            setIsMounted(true);
        }, 0);
        return () => window.clearTimeout(id);
    }, [])

    useEffect(() => {
        if (isMounted) {
            // trigger fade-out and remove overlay after transition
            const t2 = window.setTimeout(() => setIsExiting(true), 0);
            const t = window.setTimeout(() => setShowLoader(false), 300);
            return () => {
                window.clearTimeout(t2);
                window.clearTimeout(t)
            };
        }
    }, [isMounted])

    if(!isMounted) {
        return <LoadingTheme exiting={false}/>;
    }

    return (
        <NextThemesProvider {...props}>
            {showLoader && <LoadingTheme exiting={isExiting}/>}
            {children}
        </NextThemesProvider>
    )
}