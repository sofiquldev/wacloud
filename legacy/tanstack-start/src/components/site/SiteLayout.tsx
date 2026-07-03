import { TopBar } from "./TopBar";
import { Header } from "./Header";
import { MainNav } from "./MainNav";
import { NoticeTicker } from "./NoticeTicker";
import { Footer } from "./Footer";

type SiteLayoutProps = {
  children: React.ReactNode;
  active?: string;
};

export function SiteLayout({ children, active = "/" }: SiteLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <TopBar />
      <Header />
      <MainNav active={active} />
      <NoticeTicker />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
