'use client';

import { useEffect } from 'react';
import axios from 'axios';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return <>{children}</>;
}