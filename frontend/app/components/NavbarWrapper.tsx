'use client';

import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function NavbarSkeleton() {
  return <div className="h-16 bg-gray-100" />;
}

export default function NavbarWrapper() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <Navbar />
    </Suspense>
  );
}