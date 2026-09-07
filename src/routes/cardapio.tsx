import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
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

  return (
    <SiteLayout>
      {settings?.is_open === false && (
        <div className="bg-destructive px-4 py-2 text-center text-sm font-bold uppercase tracking-wider text-destructive-foreground">
          Loja fechada no momento
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-4xl tracking-wide sm:text-5xl">Cardápio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Bateu a fome? A Dino's resolve.</p>

        <div className="sticky top-[68px] z-30 -mx-4 mt-5 bg-background/90 px-4 py-3 backdrop-blur-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar no cardápio…"
              className="h-12 rounded-full pl-10"
            />
          </div>

          {categories.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => navigate({ search: {} })}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  !activeCategory
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/70 bg-card text-muted-foreground",
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
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    activeCategory?.id === c.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-card text-muted-foreground",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando cardápio…</p>}

        {!isLoading && visible.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-2xl tracking-wide">Nada por aqui ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length === 0
                ? "Os produtos ainda não foram cadastrados no painel administrativo."
                : "Nenhum item encontrado para essa busca."}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-10">
          {grouped.map(({ category, items }) => (
            <section key={category.id}>
              <h2 className="font-display text-3xl tracking-wide">{category.name}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={setSelected} />
                ))}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section>
              <h2 className="font-display text-3xl tracking-wide">Outros</h2>
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
