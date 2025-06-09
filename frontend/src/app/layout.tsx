import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ToastContainer } from "react-toastify";
import AuthGuard from "@/components/providers/AuthGuard";

export const metadata: Metadata = {
  title: "Realtime Chat App",
  description: "A real-time chat application with Next.js and Socket.io",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased bg-gradient-to-br from-[var(--background-dark)] to-[var(--primary-dark)]/80 min-h-screen`}
      >
        <ReduxProvider>
          <AuthGuard>
            <div className="">
              {children}
            </div>
          </AuthGuard>
        </ReduxProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </body>
    </html>
  );
}
