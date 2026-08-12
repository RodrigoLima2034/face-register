import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FACECAN Ponto Digital V2",
  description: "Controle de ponto corporativo por reconhecimento facial"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
