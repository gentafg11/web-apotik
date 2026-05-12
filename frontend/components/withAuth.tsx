import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import LoadingSpinner from './ui/LoadingSpinner';

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>, requireAdmin = false) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
          router.replace('/login');
          return;
        }

        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) throw new Error('Unauthorized');

          if (requireAdmin && res.headers.get('role') !== 'ADMIN') {
            router.replace('/dashboard');
            return;
          }

          setIsLoading(false);
        } catch {
          localStorage.removeItem('token');
          router.replace('/login');
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}