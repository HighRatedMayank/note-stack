import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./context/AuthContext";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
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
