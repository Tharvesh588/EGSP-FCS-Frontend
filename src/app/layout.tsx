
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AlertProvider } from '@/context/alert-context';
import { GlobalAlert } from '@/components/ui/global-alert';

export const metadata: Metadata = {
  title: 'CreditWise',
  description: 'A comprehensive faculty performance management system for EGS Pillay Engineering College.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body className="font-display antialiased" suppressHydrationWarning>
        <AlertProvider>
          {children}
          <Toaster />
          <GlobalAlert />
        </AlertProvider>
      </body>
    </html>
  );
}
