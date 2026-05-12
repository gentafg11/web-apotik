import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Dashboard from './index'; // reuse the chart component

export default function ProtectedDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) router.replace('/login');
    else {
      // set axios header globally
      const axios = require('axios');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return <Dashboard />;
}
