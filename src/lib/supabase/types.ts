export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          image: string | null;
          plan: "FREE" | "PRO" | "ADMIN";
          stripe_customer_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          image?: string | null;
          plan?: "FREE" | "PRO" | "ADMIN";
          stripe_customer_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          image?: string | null;
          plan?: "FREE" | "PRO" | "ADMIN";
          stripe_customer_id?: string | null;
          created_at?: string | null;
        };
      };
      palettes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          prompt: string | null;
          tokens: unknown;
          tags: string[] | null;
          is_public: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          prompt?: string | null;
          tokens: unknown;
          tags?: string[] | null;
          is_public?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          prompt?: string | null;
          tokens?: unknown;
          tags?: string[] | null;
          is_public?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      usage: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          period_end: string;
          palette_generations: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          period_start: string;
          period_end: string;
          palette_generations?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          period_start?: string;
          period_end?: string;
          palette_generations?: number;
        };
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
