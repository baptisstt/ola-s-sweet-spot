import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Banner = Tables<"banners">;
export type Promotion = Tables<"promotions">;
export type StoreSettings = Tables<"store_settings">;
export type DeliveryZone = Tables<"delivery_zones">;
export type ModifierGroup = Tables<"modifier_groups">;
export type Modifier = Tables<"modifiers">;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const storeSettingsQuery = queryOptions({
  queryKey: ["store-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw new Error(error.message);
    return data as StoreSettings | null;
  },
});

export const activeCategoriesQuery = queryOptions({
  queryKey: ["categories", "active"],
  queryFn: async () =>
    unwrap<Category[]>(
      await supabase
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("display_order")
        .order("name"),
    ),
});

export const activeProductsQuery = queryOptions({
  queryKey: ["products", "active"],
  queryFn: async () =>
    unwrap<Product[]>(
      await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("display_order")
        .order("name"),
    ),
});

export const activeBannersQuery = queryOptions({
  queryKey: ["banners", "active"],
  queryFn: async () =>
    unwrap<Banner[]>(
      await supabase.from("banners").select("*").eq("active", true).order("display_order"),
    ),
});

export const activePromotionsQuery = queryOptions({
  queryKey: ["promotions", "active"],
  queryFn: async () => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("active", true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Promotion[];
  },
});

export const deliveryZonesQuery = queryOptions({
  queryKey: ["delivery-zones", "active"],
  queryFn: async () =>
    unwrap<DeliveryZone[]>(
      await supabase.from("delivery_zones").select("*").eq("active", true).order("name"),
    ),
});

export function productModifiersQuery(productId: string) {
  return queryOptions({
    queryKey: ["product-modifiers", productId],
    queryFn: async () => {
      const { data: links, error: linkError } = await supabase
        .from("product_modifier_groups")
        .select("group_id")
        .eq("product_id", productId);
      if (linkError) throw new Error(linkError.message);
      const ids = (links ?? []).map((l) => l.group_id);
      if (ids.length === 0) return [] as Array<ModifierGroup & { modifiers: Modifier[] }>;

      const [{ data: groups, error: gErr }, { data: mods, error: mErr }] = await Promise.all([
        supabase.from("modifier_groups").select("*").in("id", ids).eq("active", true).order("name"),
        supabase.from("modifiers").select("*").in("group_id", ids).eq("active", true).order("name"),
      ]);
      if (gErr) throw new Error(gErr.message);
      if (mErr) throw new Error(mErr.message);

      return (groups ?? []).map((g) => ({
        ...(g as ModifierGroup),
        modifiers: ((mods ?? []) as Modifier[]).filter((m) => m.group_id === g.id),
      }));
    },
  });
}

export function effectivePrice(product: Product): number {
  if (product.on_promotion && product.promotional_price != null) return Number(product.promotional_price);
  return Number(product.price);
}
