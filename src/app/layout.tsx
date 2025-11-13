import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HueMind | AI Color Palette SaaS",
  description:
    "Generate production-ready color palettes, previews, and exports from a single prompt with HueMind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <SupabaseProvider initialSession={null}>{children}</SupabaseProvider>
        <Toaster
          richColors
          theme="dark"
          position="bottom-right"
          duration={1600}
          toastOptions={{
            classNames: {
              toast: "bg-surface/90 border border-border/60 backdrop-blur-xl text-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
