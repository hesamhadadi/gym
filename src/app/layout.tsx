import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'GymFinder | باشگاه یاب',
    template: '%s | GymFinder',
  },
  description: 'Find the best gyms near you | بهترین باشگاه رو پیدا کن',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="bg-dark-900 text-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
