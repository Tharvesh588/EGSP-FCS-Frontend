import { redirect } from 'next/navigation';

export default function AppPage() {
  // In a real app, you would get the user's role from your auth session
  const role = 'faculty'; // "faculty" or "admin"

  if (role === 'admin') {
    redirect('/admin/dashboard');
  } else {
    redirect('/dashboard');
  }
}
