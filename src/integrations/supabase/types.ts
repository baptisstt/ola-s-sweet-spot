export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          active: boolean
          cta: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          link: string | null
          title: string
        }
        Insert: {
          active?: boolean
          cta?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          link?: string | null
          title: string
        }
        Update: {
          active?: boolean
          cta?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          link?: string | null
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          discount_type: string
          ends_at: string | null
          id: string
          max_uses: number | null
          minimum_order: number | null
          starts_at: string | null
          uses: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          discount_type: string
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          minimum_order?: number | null
          starts_at?: string | null
          uses?: number
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          discount_type?: string
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          minimum_order?: number | null
          starts_at?: string | null
          uses?: number
          value?: number
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          active: boolean
          fee: number | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          fee?: number | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          fee?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      modifier_groups: {
        Row: {
          active: boolean
          id: string
          max_select: number
          min_select: number
          name: string
        }
        Insert: {
          active?: boolean
          id?: string
          max_select?: number
          min_select?: number
          name: string
        }
        Update: {
          active?: boolean
          id?: string
          max_select?: number
          min_select?: number
          name?: string
        }
        Relationships: []
      }
      modifiers: {
        Row: {
          active: boolean
          group_id: string
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean
          group_id: string
          id?: string
          name: string
          price?: number
        }
        Update: {
          active?: boolean
          group_id?: string
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "modifiers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_modifiers: {
        Row: {
          id: string
          modifier_id: string | null
          modifier_name: string
          order_item_id: string
          unit_price: number
        }
        Insert: {
          id?: string
          modifier_id?: string | null
          modifier_name: string
          order_item_id: string
          unit_price?: number
        }
        Update: {
          id?: string
          modifier_id?: string | null
          modifier_name?: string
          order_item_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_modifiers_modifier_id_fkey"
            columns: ["modifier_id"]
            isOneToOne: false
            referencedRelation: "modifiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_modifiers_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          notes: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          address_number: string | null
          complement: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          delivery_fee: number
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          delivery_zone_id: string | null
          discount: number
          id: string
          neighborhood: string | null
          notes: string | null
          order_number: number
          phone: string
          reference: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_number?: string | null
          complement?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          delivery_fee?: number
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          delivery_zone_id?: string | null
          discount?: number
          id?: string
          neighborhood?: string | null
          notes?: string | null
          order_number?: never
          phone: string
          reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_number?: string | null
          complement?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          delivery_fee?: number
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          delivery_zone_id?: string | null
          discount?: number
          id?: string
          neighborhood?: string | null
          notes?: string | null
          order_number?: never
          phone?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_modifier_groups: {
        Row: {
          group_id: string
          product_id: string
        }
        Insert: {
          group_id: string
          product_id: string
        }
        Update: {
          group_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_modifier_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_modifier_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          available: boolean
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number
          featured: boolean
          id: string
          image_url: string | null
          name: string
          on_promotion: boolean
          price: number
          promotional_price: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          available?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_url?: string | null
          name: string
          on_promotion?: boolean
          price: number
          promotional_price?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          available?: boolean
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_url?: string | null
          name?: string
          on_promotion?: boolean
          price?: number
          promotional_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          name: string
          promotional_price: number | null
          starts_at: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          promotional_price?: number | null
          starts_at?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          promotional_price?: number | null
          starts_at?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address: string | null
          description: string | null
          id: number
          instagram: string | null
          is_open: boolean
          logo_url: string | null
          name: string
          opening_hours: Json
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          description?: string | null
          id?: number
          instagram?: string | null
          is_open?: boolean
          logo_url?: string | null
          name?: string
          opening_hours?: Json
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          description?: string | null
          id?: number
          instagram?: string | null
          is_open?: boolean
          logo_url?: string | null
          name?: string
          opening_hours?: Json
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer"
      delivery_type: "delivery" | "retirada"
      order_status:
        | "novo"
        | "confirmado"
        | "preparando"
        | "saiu_para_entrega"
        | "pronto_para_retirada"
        | "concluido"
        | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      delivery_type: ["delivery", "retirada"],
      order_status: [
        "novo",
        "confirmado",
        "preparando",
        "saiu_para_entrega",
        "pronto_para_retirada",
        "concluido",
        "cancelado",
      ],
    },
  },
} as const
