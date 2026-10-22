import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GaiaUGC — Marketplace de micro-creadores UGC",
    template: "%s · GaiaUGC",
  },
  description:
    "El marketplace que conecta micro-creadores de contenido UGC con marcas pequeñas y medianas. Briefs claros, contratos automáticos, pagos protegidos y métricas reales.",
  icons: {
    icon: "/logo/logo.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadMessages = 0;
  let unreadNotifications = 0;

  if (user) {
    const [messagesResult, activityResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("type", "message_received")
        .is("read_at", null),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .neq("type", "message_received")
        .is("read_at", null),
    ]);

    unreadMessages = messagesResult.count ?? 0;
    unreadNotifications = activityResult.count ?? 0;
  }

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Navbar
          user={user}
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifications}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}