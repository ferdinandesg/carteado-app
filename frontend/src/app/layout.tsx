import "../styles/globals.scss";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carteado",
  icons: {
    icon: [{ url: "/assets/logo/favicon.png", type: "image/png" }],
    shortcut: [{ url: "/assets/logo/favicon.png", type: "image/png" }],
    apple: [{ url: "/assets/logo/favicon.png", type: "image/png" }],
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
