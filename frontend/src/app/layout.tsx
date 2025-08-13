import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GoSellr - World\'s Best E-commerce Platform',
  description: 'World\'s Best Level E-commerce Frontend - GoSellr',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove cz-shortcut-listen attribute added by browser extensions
              if (typeof window !== 'undefined') {
                const removeCzShortcutListen = () => {
                  const elements = document.querySelectorAll('[cz-shortcut-listen]');
                  elements.forEach(el => el.removeAttribute('cz-shortcut-listen'));
                };
                
                // Remove on initial load
                removeCzShortcutListen();
                
                // Remove on DOM changes
                const observer = new MutationObserver(removeCzShortcutListen);
                observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ['cz-shortcut-listen'],
                  subtree: true
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
