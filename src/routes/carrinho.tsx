import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ImageIcon, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatBRL } from "@/lib/format";
import { itemTotal, useCart } from "@/lib/cart";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho · Dino's" },
      { name: "description", content: "Revise seu pedido antes de finalizar na Dino's." },
      { property: "og:title", content: "Carrinho · Dino's" },
      { property: "og:description", content: "Revise seu pedido antes de finalizar." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, updateQuantity, updateNotes, removeItem, clear, ready } = useCart();

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-4xl tracking-wide">Seu carrinho</h1>

        {!ready && <p className="mt-6 text-sm text-muted-foreground">Carregando…</p>}

        {ready && items.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-display text-2xl tracking-wide">Carrinho vazio</p>
            <p className="mt-1 text-sm text-muted-foreground">Escolha seus itens no cardápio.</p>
            <Button asChild className="mt-6 rounded-full font-display text-lg tracking-wide">
              <Link to="/cardapio">Ver cardápio</Link>
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li key={item.key} className="rounded-2xl border border-border/70 bg-card p-3">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-muted-foreground">
                          <ImageIcon className="h-5 w-5" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="truncate font-display text-xl tracking-wide">{item.name}</h2>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          aria-label={`Remover ${item.name}`}
                          className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {item.modifiers.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.modifiers.map((m) => m.name).join(", ")}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            aria-label="Diminuir"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-7 text-center font-display text-lg">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            aria-label="Aumentar"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="font-display text-xl text-primary">{formatBRL(itemTotal(item))}</span>
                      </div>
                      <Textarea
                        value={item.notes}
                        onChange={(e) => updateNotes(item.key, e.target.value)}
                        placeholder="Observações do item"
                        rows={2}
                        className="mt-3"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-border/70 bg-card p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-display text-2xl text-foreground">{formatBRL(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                A taxa de entrega é calculada no checkout, conforme a região escolhida.
              </p>
              <Button asChild className="mt-5 h-13 w-full rounded-full font-display text-xl tracking-wide">
                <Link to="/checkout">Finalizar pedido</Link>
              </Button>
              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-destructive"
              >
                Esvaziar carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
