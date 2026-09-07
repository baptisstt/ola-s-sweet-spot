import { useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bike, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBRL } from "@/lib/format";
import { itemTotal, useCart } from "@/lib/cart";
import { deliveryZonesQuery, storeSettingsQuery } from "@/lib/store-data";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido · Dino's" },
      { name: "description", content: "Escolha entrega ou retirada e confirme seu pedido na Dino's." },
      { property: "og:title", content: "Finalizar pedido · Dino's" },
      { property: "og:description", content: "Escolha entrega ou retirada e confirme seu pedido." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { data: zones = [] } = useQuery(deliveryZonesQuery);
  const { data: settings } = useQuery(storeSettingsQuery);

  const [type, setType] = useState<"delivery" | "retirada">("delivery");
  const [zoneId, setZoneId] = useState<string>("");
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    address: "",
    address_number: "",
    neighborhood: "",
    complement: "",
    reference: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const zone = zones.find((z) => z.id === zoneId);
  const deliveryFee = type === "delivery" && zone?.fee != null ? Number(zone.fee) : 0;
  const total = subtotal + deliveryFee;

  const canSubmit = useMemo(() => {
    if (items.length === 0) return false;
    if (!form.customer_name.trim() || !form.phone.trim()) return false;
    if (type === "delivery") {
      return !!form.address.trim() && !!form.address_number.trim() && !!form.neighborhood.trim();
    }
    return true;
  }, [items.length, form, type]);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_id: auth.user?.id ?? null,
          customer_name: form.customer_name.trim(),
          phone: form.phone.trim(),
          delivery_type: type,
          address: type === "delivery" ? form.address.trim() : null,
          address_number: type === "delivery" ? form.address_number.trim() : null,
          neighborhood: type === "delivery" ? form.neighborhood.trim() : null,
          complement: type === "delivery" ? form.complement.trim() || null : null,
          reference: type === "delivery" ? form.reference.trim() || null : null,
          delivery_zone_id: type === "delivery" && zoneId ? zoneId : null,
          subtotal,
          delivery_fee: deliveryFee,
          discount: 0,
          total,
          notes: form.notes.trim() || null,
        })
        .select("id, order_number")
        .single();
      if (error) throw error;

      for (const item of items) {
        const { data: orderItem, error: itemError } = await supabase
          .from("order_items")
          .insert({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal: itemTotal(item),
            notes: item.notes || null,
          })
          .select("id")
          .single();
        if (itemError) throw itemError;

        if (item.modifiers.length > 0) {
          const { error: modError } = await supabase.from("order_item_modifiers").insert(
            item.modifiers.map((m) => ({
              order_item_id: orderItem.id,
              modifier_id: m.id,
              modifier_name: m.name,
              unit_price: m.price,
            })),
          );
          if (modError) throw modError;
        }
      }

      clear();
      toast.success(`Pedido #${order.order_number} enviado!`);
      navigate({ to: "/pedido/$orderId", params: { orderId: order.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o pedido.");
    } finally {
      setSaving(false);
    }
  }

  if (items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-display text-4xl tracking-wide">Carrinho vazio</h1>
          <p className="mt-2 text-sm text-muted-foreground">Adicione itens antes de finalizar.</p>
          <Button asChild className="mt-6 rounded-full font-display text-lg tracking-wide">
            <Link to="/cardapio">Ver cardápio</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-4xl tracking-wide">Finalizar pedido</h1>

        {settings?.is_open === false && (
          <p className="mt-3 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
            A loja está fechada. Seu pedido pode demorar mais para ser confirmado.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          {(
            [
              { key: "delivery", label: "Entrega", icon: Bike },
              { key: "retirada", label: "Retirada", icon: ShoppingBag },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border p-4 font-display text-xl tracking-wide transition-colors",
                type === key ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-card",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4 rounded-2xl border border-border/70 bg-card p-5">
          <Field label="Nome completo" required>
            <Input value={form.customer_name} onChange={(e) => set("customer_name", e.target.value)} />
          </Field>
          <Field label="Telefone / WhatsApp" required>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" />
          </Field>

          {type === "delivery" && (
            <>
              {zones.length > 0 && (
                <Field label="Região de entrega">
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Selecione…</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} {z.fee != null ? `· ${formatBRL(Number(z.fee))}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Field label="Endereço" required>
                  <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
                </Field>
                <Field label="Número" required>
                  <Input value={form.address_number} onChange={(e) => set("address_number", e.target.value)} />
                </Field>
              </div>
              <Field label="Bairro" required>
                <Input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
              </Field>
              <Field label="Complemento">
                <Input value={form.complement} onChange={(e) => set("complement", e.target.value)} />
              </Field>
              <Field label="Ponto de referência">
                <Input value={form.reference} onChange={(e) => set("reference", e.target.value)} />
              </Field>
            </>
          )}

          <Field label="Observações do pedido">
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
          </Field>
        </div>

        <div className="mt-6 rounded-2xl border border-border/70 bg-card p-5">
          <h2 className="font-display text-2xl tracking-wide">Resumo</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="text-foreground">
                    {item.quantity}× {item.name}
                  </span>
                  {item.modifiers.length > 0 && (
                    <span className="block text-xs text-muted-foreground">
                      {item.modifiers.map((m) => m.name).join(", ")}
                    </span>
                  )}
                  {item.notes && <span className="block text-xs text-muted-foreground">Obs.: {item.notes}</span>}
                </span>
                <span className="shrink-0">{formatBRL(itemTotal(item))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border/70 pt-4 text-sm">
            <Row label="Subtotal" value={formatBRL(subtotal)} />
            <Row
              label="Taxa de entrega"
              value={
                type === "retirada"
                  ? "Retirada"
                  : zone
                    ? zone.fee == null
                      ? "A combinar"
                      : formatBRL(deliveryFee)
                    : "A confirmar"
              }
            />
            <div className="flex justify-between pt-2 font-display text-2xl">
              <span>Total</span>
              <span className="text-primary">{formatBRL(total)}</span>
            </div>
          </div>

          <Button
            className="mt-5 h-13 w-full rounded-full font-display text-xl tracking-wide"
            disabled={!canSubmit || saving}
            onClick={submit}
          >
            {saving ? "Enviando…" : "Confirmar pedido"}
          </Button>
          {!canSubmit && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Preencha os campos obrigatórios para confirmar.
            </p>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
