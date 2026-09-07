import { Link } from "@tanstack/react-router";
import { Home, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

const linkClass =
  "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold text-muted-foreground transition-colors";

export function BottomNav() {
  const { count } = useCart();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-stretch gap-1 px-3 pt-1">
        <Link to="/" className={linkClass} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>
          <Home className="h-5 w-5" />
          Início
        </Link>
        <Link to="/cardapio" className={linkClass} activeProps={{ className: "text-primary" }}>
          <UtensilsCrossed className="h-5 w-5" />
          Cardápio
        </Link>
        <Link to="/carrinho" className={linkClass} activeProps={{ className: "text-primary" }}>
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </span>
          Carrinho
        </Link>
      </div>
    </nav>
  );
}
