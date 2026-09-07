-- Dino's: hardening de pedidos criados pelo cliente.
-- Os inserts públicos existentes continuam compatíveis com o checkout atual,
-- mas os triggers passam a substituir valores de catálogo enviados pelo cliente,
-- impedir produtos/adicionais indisponíveis e recalcular totais no banco.

create or replace function public.recalculate_order_totals(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subtotal numeric := 0;
  v_fee numeric := 0;
  v_type delivery_type;
  v_zone uuid;
begin
  select delivery_type, delivery_zone_id into v_type, v_zone from public.orders where id = p_order_id;
  select coalesce(sum(subtotal), 0) into v_subtotal from public.order_items where order_id = p_order_id;
  if v_type = 'delivery' and v_zone is not null then
    select coalesce(fee, 0) into v_fee from public.delivery_zones where id = v_zone and active = true;
  end if;
  update public.orders
     set subtotal = v_subtotal,
         delivery_fee = v_fee,
         discount = 0,
         total = v_subtotal + v_fee,
         updated_at = now()
   where id = p_order_id;
end;
$$;

create or replace function public.guard_order_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fee numeric := 0;
begin
  if tg_op = 'INSERT' then
    if new.customer_id is distinct from auth.uid() then
      new.customer_id := auth.uid();
    end if;
  end if;

  if new.delivery_type = 'delivery' then
    if new.address is null or btrim(new.address) = '' or new.address_number is null or btrim(new.address_number) = '' or new.neighborhood is null or btrim(new.neighborhood) = '' then
      raise exception 'Endereço de entrega incompleto';
    end if;
    if new.delivery_zone_id is not null then
      select fee into v_fee from public.delivery_zones where id = new.delivery_zone_id and active = true;
      if not found then raise exception 'Região de entrega inválida ou inativa'; end if;
      v_fee := coalesce(v_fee, 0);
    end if;
  else
    new.address := null;
    new.address_number := null;
    new.neighborhood := null;
    new.complement := null;
    new.reference := null;
    new.delivery_zone_id := null;
  end if;

  new.discount := 0;
  new.delivery_fee := case when new.delivery_type = 'delivery' then v_fee else 0 end;
  new.subtotal := case when tg_op = 'INSERT' then 0 else new.subtotal end;
  new.total := new.subtotal + new.delivery_fee;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.guard_order_item_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_mod_total numeric := 0;
begin
  if new.quantity < 1 or new.quantity > 50 then raise exception 'Quantidade inválida'; end if;
  if new.product_id is null then raise exception 'Produto inválido'; end if;

  select * into v_product from public.products where id = new.product_id;
  if not found or not v_product.active or not v_product.available then raise exception 'Produto indisponível'; end if;

  new.product_name := v_product.name;
  new.unit_price := case when v_product.on_promotion and v_product.promotional_price is not null then v_product.promotional_price else v_product.price end;
  new.subtotal := new.unit_price * new.quantity;
  return new;
end;
$$;

create or replace function public.guard_order_modifier_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mod public.modifiers%rowtype;
  v_product_id uuid;
begin
  if new.modifier_id is null then raise exception 'Adicional inválido'; end if;
  select * into v_mod from public.modifiers where id = new.modifier_id and active = true;
  if not found then raise exception 'Adicional indisponível'; end if;
  select product_id into v_product_id from public.product_modifier_groups pmg where pmg.group_id = v_mod.group_id and pmg.product_id = (select product_id from public.order_items where id = new.order_item_id) limit 1;
  if v_product_id is null then raise exception 'Adicional não vinculado ao produto'; end if;
  new.modifier_name := v_mod.name;
  new.unit_price := v_mod.price;
  return new;
end;
$$;

create or replace function public.recalculate_item_after_modifier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty integer;
  v_base numeric;
  v_order uuid;
begin
  select quantity, unit_price, order_id into v_qty, v_base, v_order from public.order_items where id = coalesce(new.order_item_id, old.order_item_id);
  update public.order_items oi
     set subtotal = (v_base + coalesce((select sum(unit_price) from public.order_item_modifiers m where m.order_item_id = oi.id), 0)) * v_qty
   where oi.id = coalesce(new.order_item_id, old.order_item_id);
  perform public.recalculate_order_totals(v_order);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_guard_order_before_write on public.orders;
create trigger trg_guard_order_before_write before insert or update on public.orders for each row execute function public.guard_order_before_write();

drop trigger if exists trg_guard_order_item_before_write on public.order_items;
create trigger trg_guard_order_item_before_write before insert or update on public.order_items for each row execute function public.guard_order_item_before_write();

drop trigger if exists trg_guard_order_modifier_before_write on public.order_item_modifiers;
create trigger trg_guard_order_modifier_before_write before insert or update on public.order_item_modifiers for each row execute function public.guard_order_modifier_before_write();

drop trigger if exists trg_recalculate_item_after_modifier_ins on public.order_item_modifiers;
create trigger trg_recalculate_item_after_modifier_ins after insert or update on public.order_item_modifiers for each row execute function public.recalculate_item_after_modifier();

drop trigger if exists trg_recalculate_item_after_modifier_del on public.order_item_modifiers;
create trigger trg_recalculate_item_after_modifier_del after delete on public.order_item_modifiers for each row execute function public.recalculate_item_after_modifier();
