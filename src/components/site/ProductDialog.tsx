import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatBRL } from "@/lib/format";
import { effectivePrice, productModifiersQuery, type Product } from "@/lib/store-data";
import { useCart, type CartModifier } from "@/lib/cart";

export function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<Record<string, CartModifier[]>>({});

  const { data: groups = [], isLoading } = useQuery({
    ...productModifiersQuery(product?.id ?? ""),
    enabled: !!product,
  });

  useEffect(() => {
    setQuantity(1);
    setNotes("");
    setSelected({});
  }, [product?.id]);

  const allSelected = useMemo(() => Object.values(selected).flat(), [selected]);
  const base = product ? effectivePrice(product) : 0;
  const total = (base + allSelected.reduce((s, m) => s + m.price, 0)) * quantity;

  const invalidGroup = groups.find((g) => {
    const chosen = selected[g.id]?.length ?? 0;
    return chosen < g.min_select;
  });

  function toggle(groupId: string, max: number, modifier: CartModifier, checked: boolean) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (!checked) return { ...prev, [groupId]: current.filter((m) => m.id !== modifier.id) };
      if (max === 1) return { ...prev, [groupId]: [modifier] };
      if (current.length >= max) {
        toast.warning(`Máximo de ${max} opções neste grupo.`);
        return prev;
      }
      return { ...prev, [groupId]: [...current, modifier] };
    });
  }

  function handleAdd() {
    if (!product) return;
    if (invalidGroup) {
      toast.error(`Escolha pelo menos ${invalidGroup.min_select} opção em "${invalidGroup.name}".`);
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.image_url,
      unitPrice: base,
      quantity,
      notes: notes.trim(),
      modifiers: allSelected,
    });
    toast.success(`${product.name} adicionado ao carrinho`);
    onClose();
  }

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto p-0">
        {product && (
          <>
            <div className="relative h-48 w-full overflow-hidden bg-secondary sm:h-60">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10" />
                </span>
              )}
            </div>

            <div className="space-y-5 p-5">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="font-display text-3xl tracking-wide">{product.name}</DialogTitle>
                {product.description && (
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                )}
              </DialogHeader>

              <p className="font-display text-3xl text-primary">{formatBRL(base)}</p>

              {isLoading && <p className="text-sm text-muted-foreground">Carregando adicionais…</p>}

              {groups.map((group) => (
                <div key={group.id} className="space-y-2 rounded-xl border border-border/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-lg tracking-wide">{group.name}</p>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {group.min_select > 0 ? "Obrigatório" : "Opcional"} · até {group.max_select}
                    </span>
                  </div>
                  {group.modifiers.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sem opções cadastradas.</p>
                  )}
                  {group.modifiers.map((mod) => {
                    const checked = !!selected[group.id]?.some((m) => m.id === mod.id);
                    return (
                      <label
                        key={mod.id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-2 hover:bg-secondary/60"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) =>
                              toggle(
                                group.id,
                                group.max_select,
                                { id: mod.id, name: mod.name, price: Number(mod.price) },
                                v === true,
                              )
                            }
                          />
                          <span className="truncate text-sm">{mod.name}</span>
                        </span>
                        {Number(mod.price) > 0 && (
                          <span className="shrink-0 text-sm text-primary">
                            + {formatBRL(Number(mod.price))}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              ))}

              <div className="space-y-2">
                <p className="font-display text-lg tracking-wide">Observações</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex.: sem cebola, ponto da carne…"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-display text-xl">{quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handleAdd}
                  className="h-12 w-full rounded-full font-display text-lg tracking-wide"
                >
                  Adicionar · {formatBRL(total)}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
