'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

function NavbarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/products', label: 'Products' },
    { href: '/sales', label: 'Sales' },
    { href: '/expenses', label: 'Expenses' },
    { href: '/users', label: 'Users' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    router.replace('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">Apotik</span>
          </a>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-600 hover:bg-white/60 hover:text-indigo-600'
                }`}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              Logout
            </button>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 focus:outline-none"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200/50">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                  isActive(link.href) ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Navbar() {
  return <NavbarInner />;
}