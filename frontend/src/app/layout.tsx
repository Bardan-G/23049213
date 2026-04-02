import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import LiveChatWidget from "@/components/chats/LiveChats";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = { title: "G Kastha Living ",
  icons:{
    icon:"/logo.png"
  }
 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-[#fdfbf7] text-[#1a1a1a] antialiased flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <LiveChatWidget />
        </Providers>
        {/* <script src="https://khalti.s3.ap-south-1.amazonaws.com/KPG/script/1_5/khalti-checkout.min.js"></script> */}
      </body>
    </html>
  );
}