import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface AuthOptions {
  requireAdmin?: boolean;
}

export default function withAuth<P>(WrappedComponent: React.ComponentType<P>, options: AuthOptions = {}) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
          router.push('/login?message=Please login to access this page');
          return;
        }

        // Verify token and check role
        try {
          const res = await axios.get('/api/auth/me');

          if (options.requireAdmin && res.data.role !== 'ADMIN') {
            router.push('/dashboard?message=You need admin privileges to access this page');
            return;
          }
        } catch (error: any) {
          if (error.response?.status === 401) {
            router.push('/login?message=Session expired, please login again');
          } else {
            router.push('/login?message=Authentication failed');
          }
          return;
        }
      };

      checkAuth();
    }, [router, options.requireAdmin]);

    // Show loading state
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    };
  };

// Usage:
// export default withAuth(MyPage, { requireAdmin: true });
// export default withAuth(MyPage); // Just require login