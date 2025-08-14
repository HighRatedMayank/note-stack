import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Provider } from "../app/components/Provider"
import { ThemeProviderWrapper } from "./components/ThemeProviderWrapper"
import PageTransition from "./components/PageTransition";
import MobileOptimizations from "./components/MobileOptimizations";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <ThemeProviderWrapper attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Provider>
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
              <div className="flex h-full relative">
                <Sidebar />
                <main className="flex-1 min-h-screen transition-all duration-300 ease-in-out">
                  {children}
                </main>
                <PageTransition />
                <MobileOptimizations />
              </div>
            </Provider>
          </AuthProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
