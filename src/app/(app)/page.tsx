"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AppPage() {
  useEffect(() => {
    // Default to admin dashboard, mirroring the root page redirection
    redirect('/admin/dashboard');
  }, []);

  // Render nothing or a loading spinner while redirecting
  return null;
}
