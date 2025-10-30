import {websiteConfigs} from "@/website.configs";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import {WebsiteHeaderProps} from "@/components/WebsiteHeader/websiteHeader";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Github, Menu} from "lucide-react";
import {cn} from "@/lib/utils";
import ThemeSelectorButton from "@/components/theme-components/themeSelectorButton";

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
            <SheetContent side="right" className="w-[85%] sm:w-[350px] pr-0 bg-background">
                <SheetHeader className="pb-4 border-b border-border">
                    <SheetTitle className="text-foreground">
                        <Link href={websiteConfigs.menuItems[0].link} className="flex items-center gap-2">
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
                    <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                </SheetHeader>

                <div className="my-6 px-1">
                    <nav className="flex flex-col space-y-3">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "text-base font-medium py-2 px-3 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                                    route.active
                                        ? "text-primary bg-accent/50"
                                        : "text-foreground/70"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto w-full pl-4 pt-4 pb-4 border-t border-border flex flex-row gap-8">
                    <ThemeSelectorButton className="scale-150"/>

                    <Link
                        href={websiteConfigs.gitHubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors p-2"
                    >
                        <Github size={20} aria-hidden="true" focusable="false" />
                        <span>Source</span>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MobileNav
