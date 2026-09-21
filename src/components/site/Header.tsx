import { Link } from "@tanstack/react-router";
import { ShoppingBag, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { storeSettingsQuery } from "@/lib/store-data";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function Header() {
  const { count } = useCart();
  const { data: settings } = useQuery(storeSettingsQuery);
  const isOpen = settings?.is_open ?? true;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 shadow-[0_8px_30px_oklch(0_0_0/0.12)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:py-3.5">
        <Link
          to="/"
          aria-label="Ir para o início da Dino's"
          className="flex min-w-0 items-center gap-3 rounded-xl"
        >
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings?.name ?? "Dino's"}
              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-2xl leading-none text-primary-foreground shadow-lg shadow-primary/15">
              D
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-display text-2xl leading-none tracking-wide">
              {settings?.name ?? "Dino's"}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" /> Saubara · BA
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider sm:inline-block",
              isOpen
                ? "border-success/20 bg-success/15 text-success"
                : "border-destructive/20 bg-destructive/15 text-destructive",
            )}
            aria-label={isOpen ? "Loja aberta" : "Loja fechada"}
          >
            {isOpen ? "Loja aberta" : "Loja fechada"}
          </span>
          <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              Início
            </Link>
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
            aria-label={count > 0 ? `Abrir carrinho, ${count} itens` : "Abrir carrinho vazio"}
            className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary shadow-sm transition-transform hover:scale-105 hover:bg-secondary/80 active:scale-95"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground animate-in zoom-in"
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
