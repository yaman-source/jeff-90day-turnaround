import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "90 Day Turnaround | Jeff Lawrence — Business Turnaround Specialist",
  description:
    "Jeff Lawrence helps founder-led businesses ($2M–$25M) break through stalled growth and operational chaos with focused 90-day execution sprints. Western Canada.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
