"use client"
import {Monitor, Moon, Sun} from "lucide-react"

import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import React from "react";
import {useTheme} from "next-themes";


export interface ThemeSelectorButtonProps {
    className?: string
}

const ThemeSelectorButton: React.FC<ThemeSelectorButtonProps> = ({className}) => {
    const {setTheme, theme} = useTheme()

    const renderThemeIcon = () => {
        if (theme === "dark") {
            return <Moon className="h-4 w-4" />
        } else if (theme === "light") {
            return <Sun className="h-4 w-4" />
        } else if (theme === "blue") {
            return <span className="inline-block h-4 w-4 rounded-sm bg-blue-600" />
        }
        // Default fallback for system or unknown themes
        return <Monitor className="h-4 w-4"/>
    }

    return (
        <div className={cn("flex items-center", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-9 px-0">
                        {renderThemeIcon()}
                        <span className="sr-only">Change theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="mr-2 h-4 w-4"/>
                        <span>System</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4"/>
                        <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4"/>
                        <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("blue")}>
                        <span className="mr-2 inline-block h-4 w-4 rounded-sm bg-blue-600" />
                        <span>Blue</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
export default ThemeSelectorButton;