import type { Metadata } from 'next';
import './globals.css';
import ClerkClientProvider from './ClerkClientProvider';
import Footer from '@/components/ui/Footer';
import Header from '@/components/ui/Header';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';


let title = 'ContractSuite - Indepth Contract Analysis';
let description = 'Indepth Contract Analysis and signing';
let url = 'https://note-cast.vercel.app/';
let ogimage = '';
let sitename = 'blindCast';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'Ug',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className='flex flex-col min-h-screen bg-grey-100'>
        <ClerkClientProvider>
          <Header />
          {children}
          <Analytics />
          <Footer />
          <Toaster position="bottom-left" reverseOrder={false} />
        </ClerkClientProvider>
      </body>
    </html>
  );
}
