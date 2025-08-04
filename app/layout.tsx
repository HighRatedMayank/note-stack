import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Provider } from "../app/components/Provider"
import { ThemeProviderWrapper } from "./components/ThemeProviderWrapper"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProviderWrapper attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          <Provider>
            <Toaster position="bottom-right" />
            <div className="flex">
              <Sidebar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </Provider>
            
        </AuthProvider>
        </ThemeProviderWrapper>
        
      </body>
    </html>
  );
}
