import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { ToastContainer } from "react-toastify";

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
          <div className="">
            {children}
          </div>
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
