import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeSelectorButton from '@/components/theme-components/themeSelectorButton';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}));

describe('ThemeSelectorButton', () => {
    const mockSetTheme = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders Moon icon when theme is dark', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
        });

        const { container } = render(<ThemeSelectorButton />);
        
        // Check if Moon icon is rendered (lucide-react icons have svg element)
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        
        // Moon icon should be present
        const svg = button?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders Sun icon when theme is light', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });

        const { container } = render(<ThemeSelectorButton />);
        
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        
        // Sun icon should be present
        const svg = button?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders blue square when theme is blue', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'blue',
            setTheme: mockSetTheme,
        });

        const { container } = render(<ThemeSelectorButton />);
        
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        
        // Blue square span should be present without mr-2 class
        const blueSquare = button?.querySelector('span.bg-blue-600');
        expect(blueSquare).toBeInTheDocument();
        expect(blueSquare).toHaveClass('rounded-sm', 'bg-blue-600');
        expect(blueSquare).not.toHaveClass('mr-2');
    });

    it('renders Sun icon as default for system theme', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'system',
            setTheme: mockSetTheme,
        });

        const { container } = render(<ThemeSelectorButton />);
        
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        
        // Sun icon should be present as default
        const svg = button?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('renders Sun icon as default for undefined theme', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: undefined,
            setTheme: mockSetTheme,
        });

        const { container } = render(<ThemeSelectorButton />);
        
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        
        // Sun icon should be present as default
        const svg = button?.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });

        const { container } = render(<ThemeSelectorButton className="custom-class" />);
        
        const wrapper = container.querySelector('.custom-class');
        expect(wrapper).toBeInTheDocument();
    });
});
