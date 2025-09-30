import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the new admin login as the default entry point.
  redirect('/u/portal/auth?admin');
}
