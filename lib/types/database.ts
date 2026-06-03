export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type GenericTableShape = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: Record<string, GenericTableShape> & {
      profiles: {
        Row: Record<string, unknown> & {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          default_hourly_rate: number;
          currency: string;
          created_at: string;
        };
        Insert: Record<string, unknown> & {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          default_hourly_rate?: number;
          currency?: string;
          created_at?: string;
        };
        Update: Record<string, unknown> & {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          default_hourly_rate?: number;
          currency?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: Record<string, unknown> & {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          note: string | null;
          default_hourly_rate: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown> & {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          note?: string | null;
          default_hourly_rate?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, unknown> & {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          note?: string | null;
          default_hourly_rate?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: Record<string, unknown> & {
          id: string;
          user_id: string;
          client_id: string | null;
          name: string;
          description: string | null;
          hourly_rate: number;
          status: "active" | "paused" | "completed" | string;
          is_billable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown> & {
          id?: string;
          user_id: string;
          client_id?: string | null;
          name: string;
          description?: string | null;
          hourly_rate?: number;
          status?: "active" | "paused" | "completed" | string;
          is_billable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, unknown> & {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          name?: string;
          description?: string | null;
          hourly_rate?: number;
          status?: "active" | "paused" | "completed" | string;
          is_billable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      time_entries: {
        Row: Record<string, unknown> & {
          id: string;
          user_id: string;
          client_id: string | null;
          project_id: string | null;
          description: string | null;
          start_time: string | null;
          end_time: string | null;
          duration_minutes: number;
          hourly_rate: number;
          amount: number;
          is_billable: boolean;
          entry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown> & {
          id?: string;
          user_id: string;
          client_id?: string | null;
          project_id?: string | null;
          description?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          duration_minutes?: number;
          hourly_rate?: number;
          amount?: number;
          is_billable?: boolean;
          entry_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Record<string, unknown> & {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          project_id?: string | null;
          description?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          duration_minutes?: number;
          hourly_rate?: number;
          amount?: number;
          is_billable?: boolean;
          entry_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
