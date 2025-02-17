import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mereka - Career Advice Platform",
  description: "Get personalized career advice and guidance from industry experts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased bg-white`}>
        <Providers>
          <header className="sticky top-0 z-50 header-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://cdn.brandfetch.io/idP99DVbZ3/theme/dark/logo.svg" 
                    alt="Mereka Logo" 
                    className="h-8 w-auto invert brightness-0"
                  />
                </div>
                <nav className="hidden md:flex items-center gap-8">
                  <a href="/" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                    Home
                  </a>
                  <a href="/about" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                    About
                  </a>
                  <a href="/contact" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">
                    Contact
                  </a>
                </nav>
              </div>
            </div>
          </header>

          <main className="flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {children}
            </div>
          </main>

          <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Mereka. All rights reserved.
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
