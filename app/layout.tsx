import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="bottom-right" />
          <div className="flex">
            <Sidebar />
        <main className="flex-1">
          {children}
        </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
