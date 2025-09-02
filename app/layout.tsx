import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { ThemeProviderWrapper } from "./components/ThemeProviderWrapper"
import PageTransition from "./components/PageTransition";
import MobileOptimizations from "./components/MobileOptimizations";
import LayoutWrapper from "./components/LayoutWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200" 
        suppressHydrationWarning
        data-theme="light"
      >
        <ThemeProviderWrapper>
          <AuthProvider>
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <PageTransition />
            <MobileOptimizations />
          </AuthProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
