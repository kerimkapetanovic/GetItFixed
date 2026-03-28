import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatLauncher from "@/components/ai-repair/ChatLauncher";
import { LanguageProvider } from "@/components/providers/language-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const antiFlashScript = `(function(){try{var t=localStorage.getItem('site_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GetItFixed - Your Trusted Home Repair Solution",
  description: "GetItFixed connects you with trusted local professionals for all your home repair needs. Fast, reliable, and hassle-free service at your fingertips.",
  icons: {
    icon: "/GetItFixed Logo.png", 
    shortcut: "/GetItFixed Logo.png",
    apple: "/GetItFixed Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: set dark class before React hydrates to prevent white flash */}
        <script dangerouslySetInnerHTML={{ __html: antiFlashScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <ChatLauncher />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
