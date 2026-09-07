import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ORDER_STATUS_LABEL, formatBRL, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/pedido/$orderId")({
  head: () => ({
    meta: [
      { title: "Pedido confirmado · Dino's" },
      { name: "description", content: "Acompanhe o status do seu pedido na Dino's." },
      { property: "og:title", content: "Pedido confirmado · Dino's" },
      { property: "og:description", content: "Acompanhe o status do seu pedido." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, order_items(*, order_item_modifiers(*))")
        .eq("id", orderId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return order;
    },
    refetchInterval: 30000,
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-10">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando pedido…</p>}

        {!isLoading && !data && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-2xl tracking-wide">Pedido não encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Se você acabou de fazer o pedido, entre em contato com a loja pelo WhatsApp.
            </p>
          </div>
        )}

        {data && (
          <>
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
              <h1 className="mt-4 font-display text-4xl tracking-wide">Pedido #{data.order_number}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateTime(data.created_at)} ·{" "}
                {data.delivery_type === "delivery" ? "Entrega" : "Retirada"}
              </p>
              <span className="mt-4 inline-block rounded-full bg-primary/15 px-4 py-1.5 font-display text-lg tracking-wide text-primary">
                {ORDER_STATUS_LABEL[data.status] ?? data.status}
              </span>
            </div>

            <div className="mt-8 rounded-2xl border border-border/70 bg-card p-5">
              <ul className="space-y-2 text-sm">
                {data.order_items?.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="min-w-0">
                      <span>
                        {item.quantity}× {item.product_name}
                      </span>
                      {item.order_item_modifiers?.length > 0 && (
                        <span className="block text-xs text-muted-foreground">
                          {item.order_item_modifiers.map((m) => m.modifier_name).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0">{formatBRL(Number(item.subtotal))}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatBRL(Number(data.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span className="text-foreground">{formatBRL(Number(data.delivery_fee))}</span>
                </div>
                <div className="flex justify-between pt-2 font-display text-2xl text-foreground">
                  <span>Total</span>
                  <span className="text-primary">{formatBRL(Number(data.total))}</span>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="mt-6 w-full rounded-full">
              <Link to="/cardapio">Fazer outro pedido</Link>
            </Button>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
