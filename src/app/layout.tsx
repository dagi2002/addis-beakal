import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Addis Beakal",
  description: "Production-minded rebuild of an Addis Ababa local discovery and reviews app."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
