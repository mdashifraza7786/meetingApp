import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from "@/components/Navbar";
import ClienProvider from "./ClientProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetingApp",
  description: "A MeetingApp where you can do video calling  ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ClienProvider>
            <Navbar />
            <main className="max-w-5xl mx-auto px-3 py-6">
              {children}
            </main>
          </ClienProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
