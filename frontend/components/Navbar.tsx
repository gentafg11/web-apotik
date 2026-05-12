import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from './ThemeContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    router.replace('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/products', label: 'Produk' },
    { href: '/sales', label: 'Penjualan' },
    { href: '/expenses', label: 'Pengeluaran' },
    { href: '/users', label: 'User' },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-secondary border-b border-theme shadow-sm transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              A
            </div>
            <span className="text-xl font-bold text-theme-primary">Apotik</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-theme-secondary hover:bg-theme-tertiary hover:text-indigo-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-lg text-theme-secondary hover:bg-theme-tertiary hover:text-yellow-500 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
            >
              Logout
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-theme-secondary hover:bg-theme-tertiary rounded-lg transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <button
              className="p-2 text-theme-secondary hover:bg-theme-tertiary rounded-lg"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-indigo-600 text-white'
                    : 'text-theme-secondary hover:bg-theme-tertiary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-theme-tertiary"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
