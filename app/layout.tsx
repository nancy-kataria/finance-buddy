import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "black",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Bull v. Bear",
  description: "Multi-agent financial jury that debates your investments before you make them.",
  authors: [{ name: "Bull v. Bear" }],
  openGraph: {
    title: "Bull v. Bear.",
    description: "Multi-agent financial jury that debates your investments before you make them.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}