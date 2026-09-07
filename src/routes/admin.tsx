import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BarChart3,
  Boxes,
  Check,
  ChevronDown,
  Clock3,
  FolderOpen,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração · Dino's" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type Tab = "dashboard" | "orders" | "products" | "categories" | "modifiers" | "promotions" | "banners" | "customers" | "coupons" | "zones" | "settings";
const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "products", label: "Produtos", icon: Package },
  { id: "categories", label: "Categorias", icon: FolderOpen },
  { id: "modifiers", label: "Adicionais", icon: Boxes },
  { id: "promotions", label: "Promoções", icon: Tag },
  { id: "banners", label: "Banners", icon: Megaphone },
  { id: "customers", label: "Clientes", icon: Users },
  { id: "coupons", label: "Cupons", icon: Ticket },
  { id: "zones", label: "Entrega", icon: MapPin },
  { id: "settings", label: "Configurações", icon: Settings },
];

function Admin() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        if (active) navigate({ to: "/auth" });
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (!active) return;
      if (profile?.role !== "admin") {
        toast.error("Acesso administrativo não autorizado.");
        navigate({ to: "/" });
        return;
      }
      setAllowed(true);
      setChecking(false);
    });
    return () => { active = false; };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  }

  if (checking || !allowed) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Verificando acesso…</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">D</div>
            <div>
              <p className="font-display text-xl tracking-wide">Dino's</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Painel administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="hidden rounded-full sm:inline-flex"><Link to="/">Ver loja</Link></Button>
            <Button variant="ghost" onClick={signOut} className="rounded-full" aria-label="Sair"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-border/70 lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-r">
          <nav className="flex gap-1 overflow-x-auto p-3 lg:sticky lg:top-16 lg:flex-col">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setTab(id)} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors lg:w-full", tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground")}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-8">
          {tab === "dashboard" && <Dashboard />}
          {tab === "orders" && <Orders />}
          {tab === "products" && <Products />}
          {tab === "categories" && <Categories />}
          {tab === "modifiers" && <Modifiers />}
          {tab === "promotions" && <Promotions />}
          {tab === "banners" && <Banners />}
          {tab === "customers" && <Customers />}
          {tab === "coupons" && <Coupons />}
          {tab === "zones" && <Zones />}
          {tab === "settings" && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

function useTable<T = Record<string, unknown>>(table: string, order?: string) {
  return useQuery({ queryKey: ["admin", table, order], queryFn: async () => {
    let q = supabase.from(table).select("*");
    if (order) q = q.order(order, { ascending: false });
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as T[];
  } });
}

function PageTitle({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-display text-4xl tracking-wide">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>;
}

function Dashboard() {
  const { data: orders = [] } = useTable<any>("orders", "created_at");
  const { data: products = [] } = useTable<any>("products");
  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const pending = orders.filter((o) => ["novo", "confirmado", "preparando", "saiu_para_entrega", "pronto_para_retirada"].includes(o.status));
  const completed = orders.filter((o) => o.status === "concluido");
  const revenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const average = todayOrders.length ? revenue / todayOrders.length : 0;
  return <>
    <PageTitle title="Dashboard" description="Visão geral do funcionamento da Dino's." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Metric label="Pedidos hoje" value={todayOrders.length} icon={<ShoppingBag />} />
      <Metric label="Pendentes" value={pending.length} icon={<Clock3 />} />
      <Metric label="Concluídos" value={completed.length} icon={<Check />} />
      <Metric label="Faturamento hoje" value={formatBRL(revenue)} icon={<BarChart3 />} />
      <Metric label="Ticket médio" value={formatBRL(average)} icon={<Tag />} />
    </div>
    <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <section className="rounded-2xl border border-border/70 bg-card p-5"><h2 className="font-display text-2xl tracking-wide">Últimos pedidos</h2><div className="mt-4 divide-y divide-border/70">{orders.slice(0, 8).map((o) => <div key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm"><div><b>#{o.order_number}</b><span className="ml-3 text-muted-foreground">{o.customer_name}</span></div><div className="text-right"><b>{formatBRL(Number(o.total))}</b><span className="ml-3 text-xs text-muted-foreground">{orderStatusLabel(o.status)}</span></div></div>)}{orders.length === 0 && <Empty text="Nenhum pedido registrado ainda." />}</div></section>
      <section className="rounded-2xl border border-border/70 bg-card p-5"><h2 className="font-display text-2xl tracking-wide">Catálogo</h2><div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Produtos cadastrados" value={products.length} icon={<Package />} compact /><Metric label="Disponíveis" value={products.filter((p) => p.available && p.active).length} icon={<Check />} compact /></div></section>
    </div>
  </>;
}

function Metric({ label, value, icon, compact }: { label: string; value: string | number; icon: React.ReactNode; compact?: boolean }) {
  return <div className={cn("rounded-2xl border border-border/70 bg-card p-4", compact && "p-3")}><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span><span className="text-primary">{icon}</span></div><div className="mt-3 font-display text-3xl tracking-wide">{value}</div></div>;
}

function Products() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useTable<any>("products");
  const { data: categories = [] } = useTable<any>("categories");
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", promotional_price: "", category_id: "", display_order: "0", active: true, available: true, featured: false, on_promotion: false });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function start(p?: any) { setEditing(p ?? null); setForm({ name: p?.name ?? "", description: p?.description ?? "", price: p ? String(p.price) : "", promotional_price: p?.promotional_price == null ? "" : String(p.promotional_price), category_id: p?.category_id ?? "", display_order: String(p?.display_order ?? 0), active: p?.active ?? true, available: p?.available ?? true, featured: p?.featured ?? false, on_promotion: p?.on_promotion ?? false }); setFile(null); }
  async function save() {
    if (!form.name.trim() || !form.price) return toast.error("Nome e preço são obrigatórios.");
    setSaving(true);
    try {
      let image_url = editing?.image_url ?? null;
      if (file) {
        const path = `products/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        image_url = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      const payload = { name: form.name.trim(), description: form.description.trim() || null, price: Number(form.price), promotional_price: form.promotional_price ? Number(form.promotional_price) : null, category_id: form.category_id || null, image_url, display_order: Number(form.display_order) || 0, active: form.active, available: form.available, featured: form.featured, on_promotion: form.on_promotion };
      const result = editing ? await supabase.from("products").update(payload).eq("id", editing.id) : await supabase.from("products").insert(payload);
      if (result.error) throw result.error;
      toast.success(editing ? "Produto atualizado." : "Produto cadastrado."); setEditing(null); await qc.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível salvar."); } finally { setSaving(false); }
  }
  async function remove(id: string) { if (!confirm("Excluir este produto?")) return; const { error } = await supabase.from("products").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Produto excluído."); qc.invalidateQueries({ queryKey: ["admin", "products"] }); } }
  async function toggle(id: string, field: "available" | "active", value: boolean) { const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id); if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin", "products"] }); }

  return <>
    <PageTitle title="Produtos" description="Cadastre produtos, preços, disponibilidade e imagens." action={<Button onClick={() => start()} className="rounded-full"><Plus className="mr-2 h-4 w-4" />Novo produto</Button>} />
    {editing !== null || form.name ? <Editor title={editing ? "Editar produto" : "Novo produto"} onClose={() => { setEditing(null); setForm({ name: "", description: "", price: "", promotional_price: "", category_id: "", display_order: "0", active: true, available: true, featured: false, on_promotion: false }); }} onSave={save} saving={saving}>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Nome" required><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field><Field label="Categoria"><select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Sem categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Preço" required><Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></Field><Field label="Preço promocional"><Input type="number" min="0" step="0.01" value={form.promotional_price} onChange={e => setForm({ ...form, promotional_price: e.target.value })} /></Field><Field label="Ordem"><Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: e.target.value })} /></Field><Field label="Imagem"><Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} /></Field></div>
      <Field label="Descrição"><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([["active", "Ativo"], ["available", "Disponível"], ["featured", "Destaque"], ["on_promotion", "Promoção"]] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"><input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{label}</label>)}</div>
    </Editor> : null}
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead className="bg-background/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Produto</th><th>Categoria</th><th>Preço</th><th>Status</th><th className="p-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-border/70">{products.map(p => <tr key={p.id}><td className="p-4"><div className="flex items-center gap-3">{p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-xl bg-background"><ImagePlus className="h-4 w-4 text-muted-foreground" /></div>}<div><b>{p.name}</b>{p.featured && <span className="ml-2 text-xs text-primary">Destaque</span>}</div></div></td><td>{categories.find(c => c.id === p.category_id)?.name ?? "—"}</td><td>{formatBRL(Number(p.on_promotion && p.promotional_price != null ? p.promotional_price : p.price))}</td><td><button onClick={() => toggle(p.id, "available", !p.available)} className={cn("rounded-full px-2.5 py-1 text-xs font-bold", p.available && p.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>{p.available && p.active ? "Disponível" : "Indisponível"}</button></td><td className="p-4 text-right"><Button variant="ghost" size="sm" onClick={() => start(p)}>Editar</Button><Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td></tr>)}{!isLoading && products.length === 0 && <tr><td colSpan={5}><Empty text="Nenhum produto cadastrado." /></td></tr>}</tbody></table></div></section>
  </>;
}

function Categories() {
  const qc = useQueryClient(); const { data = [] } = useTable<any>("categories"); const [name, setName] = useState(""); const [editing, setEditing] = useState<any | null>(null);
  async function save() { if (!name.trim()) return; const slug = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); const q = editing ? supabase.from("categories").update({ name: name.trim(), slug }).eq("id", editing.id) : supabase.from("categories").insert({ name: name.trim(), slug, display_order: data.length }); const { error } = await q; if (error) toast.error(error.message); else { toast.success("Categoria salva."); setName(""); setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "categories"] }); } }
  return <><PageTitle title="Categorias" description="Organize o cardápio e a ordem de exibição." action={<div className="flex gap-2"><Input placeholder="Nova categoria" value={name} onChange={e => setName(e.target.value)} className="w-48" /><Button onClick={save} className="rounded-full"><Plus className="mr-2 h-4 w-4" />{editing ? "Salvar" : "Adicionar"}</Button></div>} /><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.map(c => <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4"><div><b>{c.name}</b><p className="text-xs text-muted-foreground">Ordem {c.display_order} · {c.active ? "Ativa" : "Inativa"}</p></div><div><Button variant="ghost" size="sm" onClick={() => { setEditing(c); setName(c.name); }}>Editar</Button><Button variant="ghost" size="sm" onClick={async () => { const { error } = await supabase.from("categories").delete().eq("id", c.id); if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin", "categories"] }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}{data.length === 0 && <Empty text="Nenhuma categoria cadastrada." />}</section></>;
}

function Orders() {
  const qc = useQueryClient(); const { data = [] } = useTable<any>("orders", "created_at"); const [selected, setSelected] = useState<any | null>(null); const { data: items = [] } = useQuery({ queryKey: ["admin", "order-items", selected?.id], enabled: !!selected, queryFn: async () => { const { data, error } = await supabase.from("order_items").select("*, order_item_modifiers(*)").eq("order_id", selected.id); if (error) throw error; return data ?? []; } });
  async function status(id: string, value: string) { const { error } = await supabase.from("orders").update({ status: value, updated_at: new Date().toISOString() }).eq("id", id); if (error) toast.error(error.message); else { toast.success("Status atualizado."); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); setSelected((s: any) => s ? { ...s, status: value } : s); } }
  return <><PageTitle title="Pedidos" description="Acompanhe pedidos e altere o status em tempo real." /><section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]"><div className="overflow-hidden rounded-2xl border border-border/70 bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-background/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Pedido</th><th>Cliente</th><th>Tipo</th><th>Valor</th><th>Status</th></tr></thead><tbody className="divide-y divide-border/70">{data.map(o => <tr key={o.id} onClick={() => setSelected(o)} className="cursor-pointer hover:bg-background/50"><td className="p-4 font-bold">#{o.order_number}<span className="ml-2 text-xs font-normal text-muted-foreground">{new Date(o.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></td><td>{o.customer_name}</td><td>{o.delivery_type === "delivery" ? "Delivery" : "Retirada"}</td><td>{formatBRL(Number(o.total))}</td><td><span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold">{orderStatusLabel(o.status)}</span></td></tr>)}{data.length === 0 && <tr><td colSpan={5}><Empty text="Nenhum pedido registrado." /></td></tr>}</tbody></table></div></div>{selected ? <section className="rounded-2xl border border-border/70 bg-card p-5"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Pedido #{selected.order_number}</p><h2 className="font-display text-3xl tracking-wide">{selected.customer_name}</h2><p className="text-sm text-muted-foreground">{selected.phone}</p></div><Button variant="ghost" size="icon" onClick={() => setSelected(null)}><X /></Button></div><div className="mt-5 space-y-2 text-sm">{items.map((i: any) => <div key={i.id} className="rounded-xl bg-background p-3"><div className="flex justify-between"><b>{i.quantity}× {i.product_name}</b><span>{formatBRL(Number(i.subtotal))}</span></div>{i.order_item_modifiers?.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{i.order_item_modifiers.map((m: any) => m.modifier_name).join(", ")}</p>}</div>)}</div><div className="mt-5 space-y-1 border-t border-border/70 pt-4 text-sm"><Row label="Subtotal" value={formatBRL(Number(selected.subtotal))} /><Row label="Entrega" value={formatBRL(Number(selected.delivery_fee))} /><Row label="Total" value={formatBRL(Number(selected.total))} strong /></div><div className="mt-5"><Label>Status</Label><select value={selected.status} onChange={e => status(selected.id, e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{["novo", "confirmado", "preparando", "saiu_para_entrega", "pronto_para_retirada", "concluido", "cancelado"].map(s => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}</select></div>{selected.delivery_type === "delivery" && <div className="mt-5 rounded-xl bg-background p-3 text-sm"><b>Endereço</b><p className="mt-1 text-muted-foreground">{selected.address}, {selected.address_number} · {selected.neighborhood}{selected.complement ? ` · ${selected.complement}` : ""}{selected.reference ? ` · Ref.: ${selected.reference}` : ""}</p></div>}</section> : <section className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">Selecione um pedido para ver os detalhes.</section>}</section></>;
}

function Modifiers() {
  const qc = useQueryClient(); const { data: groups = [] } = useTable<any>("modifier_groups"); const { data: mods = [] } = useTable<any>("modifiers"); const [group, setGroup] = useState({ name: "", min_select: "0", max_select: "1" }); const [modifier, setModifier] = useState({ name: "", price: "", group_id: "" });
  async function addGroup() { if (!group.name.trim()) return; const { error } = await supabase.from("modifier_groups").insert({ name: group.name.trim(), min_select: Number(group.min_select), max_select: Number(group.max_select) }); if (error) toast.error(error.message); else { setGroup({ name: "", min_select: "0", max_select: "1" }); qc.invalidateQueries({ queryKey: ["admin", "modifier_groups"] }); } }
  async function addModifier() { if (!modifier.name.trim() || !modifier.group_id) return toast.error("Informe nome e grupo."); const { error } = await supabase.from("modifiers").insert({ name: modifier.name.trim(), price: Number(modifier.price || 0), group_id: modifier.group_id }); if (error) toast.error(error.message); else { setModifier({ name: "", price: "", group_id: "" }); qc.invalidateQueries({ queryKey: ["admin", "modifiers"] }); } }
  return <><PageTitle title="Adicionais" description="Grupos, limites de seleção e adicionais vinculáveis aos produtos." /><div className="grid gap-4 xl:grid-cols-2"><Editor title="Novo grupo" onSave={addGroup}><div className="grid gap-3 sm:grid-cols-3"><Field label="Nome"><Input value={group.name} onChange={e => setGroup({ ...group, name: e.target.value })} /></Field><Field label="Mínimo"><Input type="number" min="0" value={group.min_select} onChange={e => setGroup({ ...group, min_select: e.target.value })} /></Field><Field label="Máximo"><Input type="number" min="1" value={group.max_select} onChange={e => setGroup({ ...group, max_select: e.target.value })} /></Field></div></Editor><Editor title="Novo adicional" onSave={addModifier}><div className="grid gap-3 sm:grid-cols-3"><Field label="Nome"><Input value={modifier.name} onChange={e => setModifier({ ...modifier, name: e.target.value })} /></Field><Field label="Preço"><Input type="number" min="0" step="0.01" value={modifier.price} onChange={e => setModifier({ ...modifier, price: e.target.value })} /></Field><Field label="Grupo"><select value={modifier.group_id} onChange={e => setModifier({ ...modifier, group_id: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione…</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field></div></Editor></div><div className="mt-4 grid gap-3 md:grid-cols-2">{groups.map(g => <div key={g.id} className="rounded-2xl border border-border/70 bg-card p-4"><b>{g.name}</b><p className="text-xs text-muted-foreground">Seleção: {g.min_select}–{g.max_select}</p><div className="mt-3 space-y-2">{mods.filter(m => m.group_id === g.id).map(m => <div key={m.id} className="flex justify-between text-sm"><span>{m.name}</span><span>{formatBRL(Number(m.price))}</span></div>)}</div></div>)}</div></>;
}

function Promotions() { return <SimpleCrud title="Promoções" description="Gerencie promoções com período de validade." table="promotions" fields={["name", "description", "promotional_price", "starts_at", "ends_at"]} />; }
function Banners() { return <SimpleCrud title="Banners" description="Gerencie os banners exibidos na página inicial." table="banners" fields={["title", "description", "cta", "link", "image_url"]} />; }
function Coupons() { return <SimpleCrud title="Cupons" description="Cadastre códigos, regras e validade de descontos." table="coupons" fields={["code", "discount_type", "value", "minimum_order", "starts_at", "ends_at", "max_uses"]} />; }

function SimpleCrud({ title, description, table, fields }: { title: string; description: string; table: string; fields: string[] }) {
  const qc = useQueryClient(); const { data = [] } = useTable<any>(table); const [editing, setEditing] = useState<any | null>(null); const [values, setValues] = useState<Record<string, string>>({});
  function start(row?: any) { setEditing(row ?? {}); const v: Record<string, string> = {}; fields.forEach(f => v[f] = row?.[f] == null ? "" : String(row[f])); setValues(v); }
  async function save() { const payload: any = { ...values }; ["promotional_price", "value", "minimum_order", "max_uses"].forEach(k => { if (k in payload) payload[k] = payload[k] === "" ? null : Number(payload[k]); }); if ("starts_at" in payload) payload.starts_at = payload.starts_at ? new Date(payload.starts_at).toISOString() : null; if ("ends_at" in payload) payload.ends_at = payload.ends_at ? new Date(payload.ends_at).toISOString() : null; const q = editing?.id ? supabase.from(table).update(payload).eq("id", editing.id) : supabase.from(table).insert(payload); const { error } = await q; if (error) toast.error(error.message); else { toast.success("Salvo."); setEditing(null); qc.invalidateQueries({ queryKey: ["admin", table] }); } }
  async function remove(id: string) { if (!confirm("Excluir este registro?")) return; const { error } = await supabase.from(table).delete().eq("id", id); if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin", table] }); }
  return <><PageTitle title={title} description={description} action={<Button onClick={() => start()} className="rounded-full"><Plus className="mr-2 h-4 w-4" />Novo</Button>} />{editing !== null && <Editor title={editing.id ? "Editar" : "Novo registro"} onClose={() => setEditing(null)} onSave={save}>{fields.map(f => <Field key={f} label={humanize(f)}><Input type={f.includes("at") ? "datetime-local" : ["promotional_price", "value", "minimum_order", "max_uses"].includes(f) ? "number" : "text"} value={f.includes("at") && values[f] ? values[f].slice(0, 16) : values[f] ?? ""} onChange={e => setValues({ ...values, [f]: e.target.value })} /></Field>)}</Editor>}<section className="overflow-hidden rounded-2xl border border-border/70 bg-card"><div className="divide-y divide-border/70">{data.map(row => <div key={row.id} className="flex items-center justify-between gap-4 p-4"><div className="min-w-0">{fields.slice(0, 3).map(f => <div key={f} className="truncate text-sm"><b>{humanize(f)}:</b> {row[f] == null ? "—" : String(row[f])}</div>)}</div><div className="shrink-0"><Button variant="ghost" size="sm" onClick={() => start(row)}>Editar</Button><Button variant="ghost" size="sm" onClick={() => remove(row.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}{data.length === 0 && <Empty text="Nenhum registro cadastrado." />}</div></section></>;
}

function Zones() { const qc = useQueryClient(); const { data = [] } = useTable<any>("delivery_zones"); const [name, setName] = useState(""); const [fee, setFee] = useState(""); async function add() { if (!name.trim()) return; const { error } = await supabase.from("delivery_zones").insert({ name: name.trim(), fee: fee ? Number(fee) : null }); if (error) toast.error(error.message); else { setName(""); setFee(""); qc.invalidateQueries({ queryKey: ["admin", "delivery_zones"] }); } } return <><PageTitle title="Áreas de entrega" description="Defina regiões atendidas e suas taxas reais." action={<div className="flex gap-2"><Input placeholder="Bairro / região" value={name} onChange={e => setName(e.target.value)} /><Input className="w-28" type="number" min="0" step="0.01" placeholder="Taxa" value={fee} onChange={e => setFee(e.target.value)} /><Button onClick={add} className="rounded-full"><Plus /></Button></div>} /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.map(z => <div key={z.id} className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4"><div><b>{z.name}</b><p className="text-sm text-muted-foreground">{z.fee == null ? "Taxa não definida" : formatBRL(Number(z.fee))}</p></div><Button variant="ghost" size="icon" onClick={async () => { const { error } = await supabase.from("delivery_zones").delete().eq("id", z.id); if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["admin", "delivery_zones"] }); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}{data.length === 0 && <Empty text="Nenhuma região cadastrada." />}</div></>; }

function Customers() { const { data = [] } = useTable<any>("profiles"); return <><PageTitle title="Clientes" description="Visualize os perfis registrados no sistema." /><section className="overflow-hidden rounded-2xl border border-border/70 bg-card"><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead className="bg-background/60 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Nome</th><th>Telefone</th><th>Perfil</th><th>Cadastro</th></tr></thead><tbody className="divide-y divide-border/70">{data.map(p => <tr key={p.id}><td className="p-4 font-semibold">{p.full_name || "Sem nome"}</td><td>{p.phone || "—"}</td><td>{p.role}</td><td>{new Date(p.created_at).toLocaleDateString("pt-BR")}</td></tr>)}{data.length === 0 && <tr><td colSpan={4}><Empty text="Nenhum cliente cadastrado." /></td></tr>}</tbody></table></div></section></>; }

function SettingsPanel() { const qc = useQueryClient(); const { data } = useQuery({ queryKey: ["admin", "store_settings"], queryFn: async () => { const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle(); if (error) throw error; return data; } }); const [form, setForm] = useState<any>(null); useEffect(() => { if (data && !form) setForm({ ...data, opening_hours: JSON.stringify(data.opening_hours ?? {}, null, 2) }); }, [data, form]); async function save() { if (!form) return; let opening_hours: any = {}; try { opening_hours = JSON.parse(form.opening_hours || "{}"); } catch { return toast.error("Horários precisam estar em JSON válido."); } const { opening_hours: _, ...rest } = form; const { error } = await supabase.from("store_settings").update({ ...rest, opening_hours }).eq("id", 1); if (error) toast.error(error.message); else { toast.success("Configurações salvas."); qc.invalidateQueries({ queryKey: ["admin", "store_settings"] }); } } if (!form) return <div>Carregando…</div>; return <><PageTitle title="Configurações" description="Dados públicos e estado atual da loja." /><Editor title="Dados da loja" onSave={save}><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field><Field label="WhatsApp"><Input value={form.whatsapp ?? ""} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></Field><Field label="Telefone"><Input value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field><Field label="Instagram"><Input value={form.instagram ?? ""} onChange={e => setForm({ ...form, instagram: e.target.value })} /></Field><Field label="Endereço"><Input value={form.address ?? ""} onChange={e => setForm({ ...form, address: e.target.value })} /></Field><Field label="Logo URL"><Input value={form.logo_url ?? ""} onChange={e => setForm({ ...form, logo_url: e.target.value })} /></Field></div><Field label="Descrição"><Textarea rows={3} value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} /></Field><Field label="Horários (JSON)"><Textarea rows={7} value={form.opening_hours} onChange={e => setForm({ ...form, opening_hours: e.target.value })} /></Field><label className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-3 text-sm"><input type="checkbox" checked={!!form.is_open} onChange={e => setForm({ ...form, is_open: e.target.checked })} /> Loja aberta</label></Editor></>; }

function Editor({ title, children, onSave, onClose, saving }: { title: string; children: React.ReactNode; onSave: () => void; onClose?: () => void; saving?: boolean }) { return <section className="mb-5 rounded-2xl border border-primary/30 bg-card p-5"><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl tracking-wide">{title}</h2>{onClose && <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>}</div><div className="space-y-4">{children}</div><div className="mt-5 flex justify-end"><Button onClick={onSave} disabled={saving} className="rounded-full">{saving ? "Salvando…" : "Salvar"}</Button></div></section>; }
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}{required ? " *" : ""}</Label>{children}</div>; }
function Empty({ text }: { text: string }) { return <div className="p-8 text-center text-sm text-muted-foreground">{text}</div>; }
function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) { return <div className={cn("flex justify-between gap-3", strong && "font-bold text-base pt-2") }><span>{label}</span><span>{value}</span></div>; }
function orderStatusLabel(status: string) { return ({ novo: "Novo", confirmado: "Confirmado", preparando: "Preparando", saiu_para_entrega: "Saiu para entrega", pronto_para_retirada: "Pronto para retirada", concluido: "Concluído", cancelado: "Cancelado" } as Record<string, string>)[status] ?? status; }
function humanize(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase()); }
