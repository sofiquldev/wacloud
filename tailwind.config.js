import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Noto Sans Bengali"',
                    'Inter',
                    ...defaultTheme.fontFamily.sans,
                ],
                bangla: ['"Noto Sans Bengali"', 'Inter', 'sans-serif'],
            },
            colors: {
                civic: {
                    DEFAULT: 'var(--civic)',
                    foreground: 'var(--civic-foreground)',
                    muted: 'var(--civic-muted)',
                },
                gold: {
                    DEFAULT: 'var(--gold)',
                    foreground: 'var(--gold-foreground)',
                    muted: 'var(--gold-muted)',
                },
                surface: {
                    DEFAULT: 'var(--surface)',
                    elevated: 'var(--surface-elevated)',
                },
                ink: {
                    DEFAULT: 'var(--ink)',
                    soft: 'var(--ink-soft)',
                    faint: 'var(--ink-faint)',
                },
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                border: 'var(--border)',
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                },
            },
            boxShadow: {
                card: '0 1px 2px rgba(15, 23, 42, 0.06)',
                elevated: '0 8px 24px -8px rgba(13, 77, 63, 0.18)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
            },
        },
    },

    plugins: [forms],
};
