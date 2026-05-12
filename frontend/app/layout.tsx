import '@/styles/globals.css';
import type { Metadata } from 'next';
import AuthProvider from './components/AuthProvider';
import NavbarWrapper from './components/NavbarWrapper';

export const metadata: Metadata = {
  title: 'Apotik App',
  description: 'Apotik CRUD & Reporting App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <NavbarWrapper />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}