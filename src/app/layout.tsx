import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Realtime API Agents",
  description: "A demo app from OpenAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/sbfd7rdikurnwbifsggp.webp" />
      </head>
      <body className={`${poppins.className} antialiased bg-white text-gray-900`}>
        <header className="sticky top-0 z-50 border-b border-gray-100 header-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-20">
              <div className="flex items-center gap-4 hover:opacity-90 transition-opacity cursor-pointer">
                <img 
                  src="/images/sbfd7rdikurnwbifsggp.webp" 
                  alt="Organization Logo" 
                  className="h-16 w-auto"
                />
                <span className="text-4xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                  mereka
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="container-shadow bg-white rounded-xl p-6">
              {children}
            </div>
          </div>
        </main>

        <footer className="border-t border-gray-100 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Mereka. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
