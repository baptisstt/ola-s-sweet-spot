import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  activeCategoriesQuery,
  activeProductsQuery,
  storeSettingsQuery,
  type Product,
} from "@/lib/store-data";

const searchSchema = z.object({ categoria: z.string().optional() });

export const Route = createFileRoute("/cardapio")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Cardápio · Dino's Saubara-BA" },
      {
        name: "description",
        content: "Veja o cardápio completo da Dino's: lanches, porções e bebidas com entrega em Saubara-BA.",
      },
      { property: "og:title", content: "Cardápio · Dino's Saubara-BA" },
      { property: "og:description", content: "Escolha seu pedido no cardápio da Dino's." },
    ],
  }),
  component: Menu,
});

function Menu() {
  const { categoria } = Route.useSearch();
  const navigate = useNavigate({ from: "/cardapio" });
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const { data: categories = [] } = useQuery(activeCategoriesQuery);
  const { data: products = [], isLoading } = useQuery(activeProductsQuery);
  const { data: settings } = useQuery(storeSettingsQuery);

  const activeCategory = categories.find((c) => c.slug === categoria) ?? null;

  const visible = useMemo(() => {
    const normalized = term.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCategory && p.category_id !== activeCategory.id) return false;
      if (!normalized) return true;
      return (
        p.name.toLowerCase().includes(normalized) ||
        (p.description ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [products, activeCategory, term]);

  const grouped = useMemo(() => {
    return categories
      .map((c) => ({ category: c, items: visible.filter((p) => p.category_id === c.id) }))
      .filter((g) => g.items.length > 0);
  }, [categories, visible]);

  const uncategorized = visible.filter((p) => !p.category_id);

  function clearFilters() {
    setTerm("");
    navigate({ search: {} });
  }

  return (
    <SiteLayout>
      {settings?.is_open === false && (
        <div className="bg-destructive px-4 py-2 text-center text-sm font-bold uppercase tracking-wider text-destructive-foreground">
          Loja fechada no momento
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Escolha seu pedido</span>
            <h1 className="mt-1 font-display text-4xl tracking-wide sm:text-5xl">Cardápio</h1>
            <p className="mt-1 text-sm text-muted-foreground">Encontre seu próximo favorito em poucos toques.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-xs text-muted-foreground sm:flex">
            <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
            {visible.length} {visible.length === 1 ? "item" : "itens"} encontrados
          </div>
        </div>

        <div className="sticky top-[68px] z-30 -mx-4 mt-6 border-y border-border/60 bg-background/92 px-4 py-3 backdrop-blur-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por nome ou descrição…"
              aria-label="Buscar produtos no cardápio"
              className="h-12 rounded-full border-border/80 bg-card/90 pl-10 pr-10 shadow-sm"
            />
            {(term || activeCategory) && (
              <button
                type="button"
                onClick={clearFilters}
                aria-label="Limpar busca e filtros"
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="scrollbar-subtle mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por categoria">
              <button
                type="button"
                onClick={() => navigate({ search: {} })}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  !activeCategory
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                Todos
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate({ search: { categoria: c.slug } })}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                    activeCategory?.id === c.id
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground sm:hidden">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {visible.length} {visible.length === 1 ? "item" : "itens"}
          </span>
          {(term || activeCategory) && (
            <button type="button" onClick={clearFilters} className="font-semibold text-primary">
              Limpar filtros
            </button>
          )}
        </div>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando cardápio…</p>}

        {!isLoading && visible.length === 0 && (
          <div className="surface-elevated mt-10 rounded-3xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-2xl tracking-wide">Nada por aqui ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length === 0
                ? "Os produtos ainda não foram cadastrados no painel administrativo."
                : "Nenhum item encontrado para essa busca."}
            </p>
            {products.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold hover:border-primary/50"
              >
                Ver todos os produtos
              </button>
            )}
          </div>
        )}

        <div className="mt-6 space-y-10">
          {grouped.map(({ category, items }) => (
            <section key={category.id} aria-labelledby={`category-${category.id}`}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Categoria
                  </span>
                  <h2 id={`category-${category.id}`} className="font-display text-3xl tracking-wide">
                    {category.name}
                  </h2>
                </div>
                <span className="text-xs text-muted-foreground">{items.length} itens</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={setSelected} />
                ))}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section aria-labelledby="category-other">
              <div className="flex items-end justify-between gap-3">
                <h2 id="category-other" className="font-display text-3xl tracking-wide">Outros</h2>
                <span className="text-xs text-muted-foreground">{uncategorized.length} itens</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {uncategorized.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={setSelected} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </SiteLayout>
  );
}
