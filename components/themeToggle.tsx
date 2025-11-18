'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <button
            aria-label="Toggle Dark Mode"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="relative w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300
                 bg-gray-300 dark:bg-gray-700 focus:outline-none"
        >
            <span
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300
                    ${isDark ? '-translate-x-6' : 'translate-x-0'}`}
            />
            <span className="absolute left-1 top-2 text-yellow-400 text-sm">{!isDark ? '☀️' : ''}</span>
            <span className="absolute right-1 top-2 text-gray-900 text-sm">{isDark ? '🌙' : ''}</span>
            
        </button>
    );
}
