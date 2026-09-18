import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PlayerBar } from "@/components/player/player-bar";
import { PlayerProvider } from "@/components/player/player-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PlayerBar />
    </PlayerProvider>
  );
}
