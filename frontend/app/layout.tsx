import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FaceCensor — Instant Face Redaction",
  description: "Upload any photo and automatically censor faces with military-grade precision.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: '#111',
                border: '1px solid #222',
                color: '#f0f0f0',
                fontFamily: "'Jost', sans-serif",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
