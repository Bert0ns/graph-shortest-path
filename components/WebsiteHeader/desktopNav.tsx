import {websiteConfigs} from "@/website.configs";
import Link from "next/link";
import React from "react";
import {WebsiteHeaderProps} from "@/components/WebsiteHeader/websiteHeader";
import ThemeSelectorButton from "@/components/theme-components/themeSelectorButton";
import {Github} from "lucide-react";
import {cn} from "@/lib/utils";

const DesktopNav: React.FC<WebsiteHeaderProps> = ({routes}) => {
    return (
        <>
            <nav className="flex items-center space-x-6 text-sm font-medium">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "transition-colors hover:text-primary",
                            route.active ? "text-primary" : "text-foreground/70",
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
                <Link href={websiteConfigs.gitHubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
                >
                    <Github size={20} aria-hidden="true" focusable="false" />
                    <span className="hidden sm:inline">Source</span>
                </Link>
            </nav>
            <div className="flex items-center space-x-2">
                <ThemeSelectorButton/>
            </div>
        </>
    )
}

export default DesktopNav;