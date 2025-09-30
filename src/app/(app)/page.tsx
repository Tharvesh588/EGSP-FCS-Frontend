"use client";

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    setRole(storedRole);
  }, []);

  useEffect(() => {
    if (role) {
      if (role === 'admin') {
        redirect('/admin/dashboard');
      } else {
        redirect('/dashboard');
      }
    }
  }, [role]);

  // Render nothing or a loading spinner while checking the role
  return null;
}
