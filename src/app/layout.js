import "./globals.css";
import AuthProvider from "@/components/layout/AuthProvider";
import { Toaster } from "sonner";

export const metadata = {
  title: "OZL Studio",
  description: "OneZeroLabs — Client collaboration and billing platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(38,38,42,0.9)',
              backdropFilter: 'blur(60px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px',
              color: '#ffffff',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
