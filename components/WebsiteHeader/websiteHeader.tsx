"use client"
import Link from "next/link";
import Image from "next/image";
import React from "react";
import {websiteConfigs} from "@/website.configs";
import {usePathname} from "next/navigation";
import {useMobile} from "@/lib/hooks/use-mobile";
import MobileNav from "@/components/WebsiteHeader/mobileNav";
import DesktopNav from "@/components/WebsiteHeader/desktopNav";

export interface WebsiteRoute {
    href: string
    label: string
    active: boolean
}

export interface WebsiteHeaderProps {
    routes: WebsiteRoute[];
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
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
            <div className="container mx-auto h-16 px-4 py-6 flex justify-between items-center max-w-4xl">
                <Link href={websiteConfigs.menuItems[0].link} className="flex items-center space-x-2">
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