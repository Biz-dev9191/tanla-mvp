import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aurora Cloud · AI Customer Communication Orchestrator',
  description: 'An enterprise agentic communication layer that decides what to communicate, why, how, through which channel, and validates safety guardrails.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined') {
                  if ('scrollRestoration' in history) {
                    history.scrollRestoration = 'manual';
                  }
                  window.scrollTo(0, 0);
                  if (document.documentElement) document.documentElement.scrollTop = 0;
                  if (document.body) document.body.scrollTop = 0;
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-aurora-neutral-100 text-aurora-neutral-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
