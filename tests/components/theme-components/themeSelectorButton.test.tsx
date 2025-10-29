import '@testing-library/jest-dom'
import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import ThemeSelectorButton from '@/components/theme-components/themeSelectorButton'
import {useTheme} from 'next-themes'

// Strongly typed mock for next-themes
jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}))

type ThemeOption = 'light' | 'dark' | 'system' | 'blue'
type UseThemeReturn = {
    theme?: ThemeOption
    setTheme: jest.Mock<void, [ThemeOption]>
}

//const mockedUseTheme = require('next-themes').useTheme as jest.Mock<UseThemeReturn, []>
const mockedUseTheme = useTheme as unknown as jest.Mock<UseThemeReturn, []>

describe('ThemeSelectorButton', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('shows the Moon icon when theme = "dark"', () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: 'dark', setTheme})

        const {container} = render(<ThemeSelectorButton/>)

        // lucide-react adds classes like 'lucide lucide-moon'
        expect(container.querySelector('svg.lucide-moon')).toBeInTheDocument()
        expect(container.querySelector('svg.lucide-sun')).not.toBeInTheDocument()
        expect(container.querySelector('svg.lucide-monitor')).not.toBeInTheDocument()
        expect(container.querySelector('span.bg-blue-600')).not.toBeInTheDocument()

        // The button has an accessible name thanks to sr-only
        expect(screen.getByRole('button', {name: /change theme/i})).toBeInTheDocument()
    })

    it('shows the Sun icon when theme = "light"', () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: 'light', setTheme})

        const {container} = render(<ThemeSelectorButton/>)

        expect(container.querySelector('svg.lucide-sun')).toBeInTheDocument()
        expect(container.querySelector('svg.lucide-moon')).not.toBeInTheDocument()
        expect(container.querySelector('svg.lucide-monitor')).not.toBeInTheDocument()
        expect(container.querySelector('span.bg-blue-600')).not.toBeInTheDocument()
    })

    it('shows the blue square when theme = "blue"', () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: 'blue', setTheme})

        const {container} = render(<ThemeSelectorButton/>)

        expect(container.querySelector('span.bg-blue-600')).toBeInTheDocument()
        expect(container.querySelector('svg.lucide-moon')).not.toBeInTheDocument()
        expect(container.querySelector('svg.lucide-sun')).not.toBeInTheDocument()
        expect(container.querySelector('svg.lucide-monitor')).not.toBeInTheDocument()
    })

    it('shows the Monitor icon when theme is not specified (default/system)', () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: undefined, setTheme})

        const {container, rerender} = render(<ThemeSelectorButton/>)

        expect(container.querySelector('svg.lucide-monitor')).toBeInTheDocument()
        expect(container.querySelector('svg.lucide-moon')).not.toBeInTheDocument()
        expect(container.querySelector('svg.lucide-sun')).not.toBeInTheDocument()
        expect(container.querySelector('span.bg-blue-600')).not.toBeInTheDocument()

        // Also verify when theme = 'system'
        mockedUseTheme.mockReturnValue({theme: 'system', setTheme})
        rerender(<ThemeSelectorButton/>)
        expect(container.querySelector('svg.lucide-monitor')).toBeInTheDocument()
    })

    it('opens the menu and calls setTheme("light") when selecting Light', async () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: 'dark', setTheme})

        render(<ThemeSelectorButton/>)

        const trigger = screen.getByRole('button', {name: /change theme/i})
        // Open via keyboard (Radix: ArrowDown opens the menu)
        fireEvent.keyDown(trigger, {key: 'ArrowDown'})

        const lightItem = await screen.findByRole('menuitem', {name: /light/i})
        fireEvent.click(lightItem)

        expect(setTheme).toHaveBeenCalledWith('light')
    })

    it('selecting each item calls setTheme with the expected value', async () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: 'dark', setTheme})

        render(<ThemeSelectorButton/>)

        const openMenu = async () => {
            const trigger = screen.getByRole('button', {name: /change theme/i})
            fireEvent.keyDown(trigger, {key: 'ArrowDown'})
            await screen.findByRole('menu')
        }

        // System
        await openMenu()
        fireEvent.click(await screen.findByRole('menuitem', {name: /system/i}))
        expect(setTheme).toHaveBeenCalledWith('system')

        // Light
        await openMenu()
        fireEvent.click(await screen.findByRole('menuitem', {name: /light/i}))
        expect(setTheme).toHaveBeenCalledWith('light')

        // Dark
        await openMenu()
        fireEvent.click(await screen.findByRole('menuitem', {name: /dark/i}))
        expect(setTheme).toHaveBeenCalledWith('dark')

        // Blue
        await openMenu()
        fireEvent.click(await screen.findByRole('menuitem', {name: /blue/i}))
        expect(setTheme).toHaveBeenCalledWith('blue')

        expect(setTheme).toHaveBeenCalledTimes(4)
    })

    it('manages aria-expanded on the trigger when the menu opens and closes', async () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: 'dark', setTheme})

        render(<ThemeSelectorButton/>)

        const trigger = screen.getByRole('button', {name: /change theme/i})
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
        // initially closed
        expect(trigger).toHaveAttribute('aria-expanded', 'false')

        // open
        fireEvent.keyDown(trigger, {key: 'ArrowDown'})
        await screen.findByRole('menu')
        expect(trigger).toHaveAttribute('aria-expanded', 'true')

        // click an item to close
        fireEvent.click(await screen.findByRole('menuitem', {name: /dark/i}))
        expect(setTheme).toHaveBeenCalledWith('dark')

        // closed again
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('the trigger is a "ghost" icon-size button with an accessible name', () => {
        const setTheme: jest.Mock<void, [ThemeOption]> = jest.fn()
        mockedUseTheme.mockReturnValue({theme: 'light', setTheme})

        render(<ThemeSelectorButton className="custom-class"/>)

        const button = screen.getByRole('button', {name: /change theme/i})
        expect(button).toBeInTheDocument()
        // check a few key classes without being too strict
        expect(button).toHaveClass('w-9')
    })
})
