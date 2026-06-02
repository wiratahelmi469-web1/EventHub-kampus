import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'EventHub Universitas Nurul Fikri',
  description: 'Sistem Informasi Event & Kepanitiaan Universitas Nurul Fikri',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased text-slate-800 bg-[#F5F7FA]" suppressHydrationWarning>
        <SessionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

