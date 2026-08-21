import type { Metadata } from "next";
import { Inter, Outfit, Caveat } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coltask - Professional Agile Management",
  description: "Advanced Agile task management and real-time E2EE collaboration for high-performing teams.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${caveat.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        {/* Mobile Device Block Overlay */}
        <div className="fixed inset-0 z-99999 bg-[#fdfdfc] flex flex-col items-center justify-center p-8 text-center md:hidden">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6 shadow-xl">
            <span className="text-white font-heading font-bold text-2xl">C</span>
          </div>
          <h2 className="text-2xl font-heading font-bold mb-4">Please use a larger screen.</h2>
          <p className="text-black/60 font-medium leading-relaxed">
            Coltask is a professional project management tool optimized for laptops, desktops, and tablets (pads). Our complex drag-and-drop interfaces require a larger screen to provide the best experience.
          </p>
        </div>

        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
