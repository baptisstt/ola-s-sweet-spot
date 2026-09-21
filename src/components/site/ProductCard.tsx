import { Plus, ImageIcon } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { effectivePrice, type Product } from "@/lib/store-data";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) {
  const unavailable = !product.available;
  const hasPromo = product.on_promotion && product.promotional_price != null;

  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={() => onSelect(product)}
      className={cn(
        "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-stretch gap-4 rounded-[1.35rem] border border-white/7 bg-card/95 p-3.5 text-left shadow-[0_10px_35px_rgba(0,0,0,0.12)] transition-all",
        unavailable
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-1 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:shadow-black/25 active:scale-[0.99]",
      )}
    >
      <div className="flex min-w-0 flex-col justify-between gap-2 py-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[1.35rem] leading-tight tracking-wide">{product.name}</h3>
            {product.featured && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Destaque
              </span>
            )}
            {unavailable && (
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                Indisponível
              </span>
            )}
          </div>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-primary">
            {formatBRL(effectivePrice(product))}
          </span>
          {hasPromo && (
            <span className="text-sm text-muted-foreground line-through">
              {formatBRL(Number(product.price))}
            </span>
          )}
        </div>
      </div>

      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-secondary shadow-inner sm:h-28 sm:w-28">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </span>
        )}
        {!unavailable && (
          <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/25 ring-2 ring-background/70">
            <Plus className="h-4 w-4" />
          </span>
        )}
      </div>
    </button>
  );
}
