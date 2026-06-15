import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALF BANQ Mortgage Broker | Dubai's Premier Mortgage Specialists",
  description: "Dubai's leading mortgage broker. Access 25+ UAE banks, the best rates, and expert guidance for residential, commercial, and investment properties.",
  keywords: "mortgage broker Dubai, home loan UAE, mortgage Dubai, property finance UAE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
