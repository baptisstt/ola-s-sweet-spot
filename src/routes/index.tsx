import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Bike, ShoppingBag, Flame, Star } from "lucide-react";
import heroImage from "@/assets/hero-dinos.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductDialog } from "@/components/site/ProductDialog";
import { Button } from "@/components/ui/button";
import { WEEKDAYS } from "@/lib/format";
import {
  activeBannersQuery,
  activeCategoriesQuery,
  activeProductsQuery,
  activePromotionsQuery,
  deliveryZonesQuery,
  storeSettingsQuery,
  type Product,
} from "@/lib/store-data";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dino's Saubara-BA · Delivery e Retirada" },
      {
        name: "description",
        content:
          "Bateu a fome? A Dino's resolve. Cardápio completo, promoções e pedidos por delivery ou retirada em Saubara-BA.",
      },
      { property: "og:title", content: "Dino's Saubara-BA · Delivery e Retirada" },
      { property: "og:description", content: "Bateu a fome? A Dino's resolve. Peça agora." },
    ],
  }),
  component: Home,
});

function Home() {
  const [selected, setSelected] = useState<Product | null>(null);
  const { data: settings } = useQuery(storeSettingsQuery);
  const { data: categories = [] } = useQuery(activeCategoriesQuery);
  const { data: products = [] } = useQuery(activeProductsQuery);
  const { data: banners = [] } = useQuery(activeBannersQuery);
  const { data: promotions = [] } = useQuery(activePromotionsQuery);
  const { data: zones = [] } = useQuery(deliveryZonesQuery);

  const featured = products.filter((p) => p.featured).slice(0, 6);
  const onPromo = products.filter((p) => p.on_promotion && p.promotional_price != null).slice(0, 6);
  const isOpen = settings?.is_open ?? true;
  const hours = (settings?.opening_hours ?? {}) as Record<string, string>;
  const hasHours = WEEKDAYS.some((d) => hours[d.key]);

  return (
    <SiteLayout>
      {!isOpen && (
        <div className="bg-destructive px-4 py-2 text-center text-sm font-bold uppercase tracking-wider text-destructive-foreground">
          Loja fechada no momento — você pode navegar pelo cardápio
        </div>
      )}

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Lanche artesanal da Dino's"
          width={1600}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            <Flame className="h-3.5 w-3.5" /> Saubara · Bahia
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[0.95] tracking-wide sm:text-7xl">
            Bateu a fome? <span className="ember-text">A Dino's resolve.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            {settings?.description ??
              "Sabor de verdade, feito na hora. Peça em poucos toques e receba em casa ou retire na loja."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-13 rounded-full px-8 font-display text-xl tracking-wider">
              <Link to="/cardapio">Pedir agora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-13 rounded-full border-foreground/25 bg-transparent px-8 font-display text-xl tracking-wider"
            >
              <Link to="/cardapio">Ver cardápio</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-primary" /> Delivery
            </span>
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" /> Retirada na loja
            </span>
            {isOpen && (
              <span className="flex items-center gap-2 text-success">
                <Clock className="h-4 w-4" /> Aberto agora
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Banners */}
      {banners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex snap-x gap-4 overflow-x-auto pb-2">
            {banners.map((b) => (
              <article
                key={b.id}
                className="relative w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border/70 bg-card sm:w-[420px]"
              >
                {b.image_url && (
                  <img src={b.image_url} alt={b.title} loading="lazy" className="h-40 w-full object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-display text-2xl tracking-wide">{b.title}</h3>
                  {b.description && <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>}
                  {b.cta && b.link && (
                    <a
                      href={b.link}
                      className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                    >
                      {b.cta}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="font-display text-3xl tracking-wide">Categorias</h2>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhuma categoria cadastrada ainda. Cadastre pelo painel administrativo.
          </p>
        ) : (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/cardapio"
                search={{ categoria: c.slug }}
                className="shrink-0 rounded-full border border-border/70 bg-card px-5 py-3 font-display text-lg tracking-wide transition-colors hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Destaques */}
      <ProductSection
        title="Melhores pedidos"
        icon={<Star className="h-5 w-5 text-primary" />}
        products={featured}
        empty="Ainda não há produtos em destaque."
        onSelect={setSelected}
      />

      {/* Promoções */}
      <ProductSection
        title="Promoções"
        icon={<Flame className="h-5 w-5 text-accent" />}
        products={onPromo}
        empty="Nenhuma promoção ativa no momento."
        onSelect={setSelected}
      />

      {promotions.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {promotions.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border border-accent/40 bg-card">
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} loading="lazy" className="h-40 w-full object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-display text-2xl tracking-wide">{p.name}</h3>
                  {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                  {p.promotional_price != null && (
                    <p className="mt-2 font-display text-2xl text-primary">
                      {formatBRL(Number(p.promotional_price))}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Localização, horários e entrega */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h3 className="flex items-center gap-2 font-display text-2xl tracking-wide">
              <MapPin className="h-5 w-5 text-primary" /> Onde estamos
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {settings?.address ?? "Endereço ainda não cadastrado."}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h3 className="flex items-center gap-2 font-display text-2xl tracking-wide">
              <Clock className="h-5 w-5 text-primary" /> Horários
            </h3>
            {hasHours ? (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {WEEKDAYS.filter((d) => hours[d.key]).map((d) => (
                  <li key={d.key} className="flex justify-between gap-3">
                    <span>{d.label}</span>
                    <span className="text-foreground">{hours[d.key]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Horários ainda não cadastrados.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5">
            <h3 className="flex items-center gap-2 font-display text-2xl tracking-wide">
              <Bike className="h-5 w-5 text-primary" /> Entrega e retirada
            </h3>
            {zones.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {zones.map((z) => (
                  <li key={z.id} className="flex justify-between gap-3">
                    <span className="truncate">{z.name}</span>
                    <span className="shrink-0 text-foreground">
                      {z.fee == null ? "A combinar" : formatBRL(Number(z.fee))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Regiões de entrega ainda não cadastradas. Retirada disponível na loja.
              </p>
            )}
          </div>
        </div>
      </section>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </SiteLayout>
  );
}

function ProductSection({
  title,
  icon,
  products,
  empty,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  products: Product[];
  empty: string;
  onSelect: (p: Product) => void;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="flex items-center gap-2 font-display text-3xl tracking-wide">
        {icon}
        {title}
      </h2>
      {products.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
}
