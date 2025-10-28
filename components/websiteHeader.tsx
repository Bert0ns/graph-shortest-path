"use client"
import {Github, Menu} from "lucide-react"
import Link from "next/link";
import Image from "next/image";
import React from "react";
import {cn} from "@/lib/utils";
import {websiteConfigs} from "@/website.configs";
import {usePathname} from "next/navigation";
import {useMobile} from "@/lib/hooks/use-mobile";
import { Button } from "./ui/button";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import ThemeSelectorButton from "@/components/theme-components/themeSelectorButton";


export interface WebsiteRoute {
    href: string
    label: string
    active: boolean
}

export interface WebsiteHeaderProps {
    routes: WebsiteRoute[];
}

const DesktopNav: React.FC<WebsiteHeaderProps> = ({routes}) => {
    return (
        <>
            <nav className="flex items-center space-x-6 text-sm font-medium">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "transition-colors hover:text-blue-500",
                            route.active ? "text-blue-500" : "text-blue-300 dark:text-blue-400",
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
                <Link href={websiteConfigs.gitHubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-300 dark:text-blue-400 hover:text-blue-500 transition-colors"
                >
                    <Github size={20} />
                    <span className="hidden sm:inline">Source</span>
                </Link>
            </nav>
            <div className="flex items-center space-x-2">
                <ThemeSelectorButton/>
            </div>
        </>
    )
}

const MobileNav: React.FC<WebsiteHeaderProps> = ({routes}) => {
    const [open, setOpen] = React.useState<boolean>(false);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6"/>
                    <span className="sr-only">Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-[350px] pr-0 dark:bg-gray-800 dark:border-gray-700">
                <SheetHeader className="pb-4 border-b dark:border-gray-700">
                    <SheetTitle className="dark:text-gray-100">
                        <Link href="/public" className="flex items-center gap-2">
                            <Image
                                src={websiteConfigs.logo_img}
                                alt="Logo"
                                width={40}
                                height={40}
                                className="h-8 w-auto"
                            />
                            {websiteConfigs.title}
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                <div className="my-6 px-1">
                    <nav className="flex flex-col space-y-3">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "text-base font-medium py-2 px-3 rounded-md transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500",
                                    route.active
                                        ? "text-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                        : "text-blue-300 dark:text-blue-400"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto w-full pl-4 pt-4 pb-4 border-t dark:border-gray-700 flex flex-row gap-8">
                    <ThemeSelectorButton className="scale-150"/>

                    <Link
                        href={websiteConfigs.gitHubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-blue-300 dark:text-blue-400 hover:text-blue-500 transition-colors p-2"
                    >
                        <Github size={20} />
                        <span>Source</span>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default function WebsiteHeader() {
    const pathname: string = usePathname();
    const isMobile: boolean = useMobile();

    const routes: WebsiteRoute[] = websiteConfigs.menuItems.map((item) => ({
        href: item.link,
        label: item.label,
        active: pathname === item.link,
    }));

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto h-16 px-4 py-6 flex justify-between items-center max-w-4xl">
                <Link href="/public" className="flex items-center space-x-2">
                    <Image
                        src={websiteConfigs.logo_img}
                        alt="Logo"
                        width={100}
                        height={100}
                        className="w-24 h-auto"
                    />
                </Link>
                { isMobile ?
                    <MobileNav routes={routes}/>
                    :
                    <DesktopNav routes={routes}/>
                }
            </div>
        </header>
    )
}