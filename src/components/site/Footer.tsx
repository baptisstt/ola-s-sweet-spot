import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Instagram, Phone, MapPin, MessageCircle } from "lucide-react";
import { storeSettingsQuery } from "@/lib/store-data";

export function Footer() {
  const { data: settings } = useQuery(storeSettingsQuery);

  return (
    <footer className="mt-16 border-t border-border/70 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-display text-3xl">{settings?.name ?? "Dino's"}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {settings?.description ?? "Bateu a fome? A Dino's resolve."}
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-display text-xl tracking-wide text-foreground">Contato</p>
          {settings?.address && (
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {settings.address}
            </p>
          )}
          {settings?.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              {settings.phone}
            </p>
          )}
          {settings?.whatsapp && (
            <a
              className="flex items-center gap-2 hover:text-foreground"
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
              WhatsApp
            </a>
          )}
          {settings?.instagram && (
            <a
              className="flex items-center gap-2 hover:text-foreground"
              href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="h-4 w-4 shrink-0 text-primary" />
              {settings.instagram}
            </a>
          )}
          {!settings?.address && !settings?.phone && !settings?.whatsapp && !settings?.instagram && (
            <p>Dados de contato ainda não cadastrados.</p>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-display text-xl tracking-wide text-foreground">Navegar</p>
          <Link to="/" className="block hover:text-foreground">
            Início
          </Link>
          <Link to="/cardapio" className="block hover:text-foreground">
            Cardápio
          </Link>
          <Link to="/carrinho" className="block hover:text-foreground">
            Carrinho
          </Link>
          <Link to="/admin" className="block hover:text-foreground">
            Área administrativa
          </Link>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {settings?.name ?? "Dino's"} · Saubara, Bahia
      </div>
    </footer>
  );
}
