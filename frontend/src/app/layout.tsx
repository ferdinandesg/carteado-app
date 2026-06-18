import "../styles/globals.scss";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carteado",
  icons: {
    icon: [{ url: "/favicon.webp", type: "image/webp" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
