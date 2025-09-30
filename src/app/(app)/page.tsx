"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AppPage() {
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole === 'admin') {
      redirect('/admin/dashboard');
    } else if (storedRole === 'faculty') {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  }, []);

  // Render nothing or a loading spinner while checking the role
  return null;
}
