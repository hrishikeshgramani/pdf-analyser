import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Analyst — Intelligent Document Intelligence",
  description: "Upload any PDF and get instant AI-powered analytics, insights, and visual dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
