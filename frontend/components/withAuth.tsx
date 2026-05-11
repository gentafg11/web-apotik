import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface AuthOptions {
  requireAdmin?: boolean;
}

export default function withAuth<P>(WrappedComponent: React.ComponentType<P>, options: AuthOptions = {}) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
          router.replace('/login?message=Please login to access this page');
          return;
        }

        // Verify token and check role
        try {
          const res = await axios.get('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (options.requireAdmin && res.data.role !== 'ADMIN') {
            router.replace('/dashboard?message=You need admin privileges to access this page');
            return;
          }

          // Authenticated, hide loading
          setIsChecking(false);
        } catch (error: any) {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            router.replace('/login?message=Session expired, please login again');
          } else {
            router.replace('/login?message=Authentication failed');
          }
        }
      };

      checkAuth();
    }, [router, options.requireAdmin]);

    // Show loading state
    if (isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Authenticated, render component
    return <WrappedComponent {...props} />;
  };
}

// Usage:
// export default withAuth(MyPage, { requireAdmin: true });
// export default withAuth(MyPage); // Just require login