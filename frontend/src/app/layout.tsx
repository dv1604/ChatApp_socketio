import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";

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
        className={`font-sans antialiased`}
      >
        <ReduxProvider>
          <div className="">
            {children}
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
