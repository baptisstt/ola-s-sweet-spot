import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { storeSettingsQuery } from "@/lib/store-data";
import { cn } from "@/lib/utils";

export function Header() {
  const { count } = useCart();
  const { data: settings } = useQuery(storeSettingsQuery);
  const isOpen = settings?.is_open ?? true;

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/88 shadow-[0_10px_35px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings?.name ?? "Dino's"}
              className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-lg shadow-black/20 ring-1 ring-white/10"
            />
          ) : (
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary font-display text-2xl leading-none text-primary-foreground shadow-lg shadow-primary/20">
              D
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-display text-[1.65rem] leading-none tracking-wide">
              {settings?.name ?? "Dino's"}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> Saubara · BA
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] sm:inline-block",
              isOpen
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {isOpen ? "Loja aberta" : "Loja fechada"}
          </span>
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/cardapio"
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              Cardápio
            </Link>
          </nav>
          <Link
            to="/carrinho"
            aria-label="Abrir carrinho"
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/8 bg-secondary/90 transition-all hover:border-primary/40 hover:bg-secondary hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground animate-in zoom-in">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
