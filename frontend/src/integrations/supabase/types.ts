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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cpl: {
        Row: {
          bobot: number
          created_at: string | null
          deskripsi: string
          id: string
          kategori: string
          kode_cpl: string
          updated_at: string | null
        }
        Insert: {
          bobot?: number
          created_at?: string | null
          deskripsi: string
          id?: string
          kategori: string
          kode_cpl: string
          updated_at?: string | null
        }
        Update: {
          bobot?: number
          created_at?: string | null
          deskripsi?: string
          id?: string
          kategori?: string
          kode_cpl?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cpl_mata_kuliah: {
        Row: {
          bobot_kontribusi: number | null
          cpl_id: string
          created_at: string | null
          id: string
          mata_kuliah_id: string
        }
        Insert: {
          bobot_kontribusi?: number | null
          cpl_id: string
          created_at?: string | null
          id?: string
          mata_kuliah_id: string
        }
        Update: {
          bobot_kontribusi?: number | null
          cpl_id?: string
          created_at?: string | null
          id?: string
          mata_kuliah_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cpl_mata_kuliah_cpl_id_fkey"
            columns: ["cpl_id"]
            isOneToOne: false
            referencedRelation: "cpl"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cpl_mata_kuliah_mata_kuliah_id_fkey"
            columns: ["mata_kuliah_id"]
            isOneToOne: false
            referencedRelation: "mata_kuliah"
            referencedColumns: ["id"]
          },
        ]
      }
      mata_kuliah: {
        Row: {
          created_at: string | null
          dosen_id: string | null
          id: string
          kode_mk: string
          nama_mk: string
          semester: number
          sks: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosen_id?: string | null
          id?: string
          kode_mk: string
          nama_mk: string
          semester: number
          sks: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosen_id?: string | null
          id?: string
          kode_mk?: string
          nama_mk?: string
          semester?: number
          sks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mata_kuliah_dosen_id_fkey"
            columns: ["dosen_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nilai_cpl: {
        Row: {
          cpl_id: string
          created_at: string | null
          id: string
          mahasiswa_id: string
          mata_kuliah_id: string
          nilai: number
          semester: number
          tahun_ajaran: string
          updated_at: string | null
        }
        Insert: {
          cpl_id: string
          created_at?: string | null
          id?: string
          mahasiswa_id: string
          mata_kuliah_id: string
          nilai: number
          semester: number
          tahun_ajaran: string
          updated_at?: string | null
        }
        Update: {
          cpl_id?: string
          created_at?: string | null
          id?: string
          mahasiswa_id?: string
          mata_kuliah_id?: string
          nilai?: number
          semester?: number
          tahun_ajaran?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nilai_cpl_cpl_id_fkey"
            columns: ["cpl_id"]
            isOneToOne: false
            referencedRelation: "cpl"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nilai_cpl_mahasiswa_id_fkey"
            columns: ["mahasiswa_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nilai_cpl_mata_kuliah_id_fkey"
            columns: ["mata_kuliah_id"]
            isOneToOne: false
            referencedRelation: "mata_kuliah"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          nim: string | null
          nip: string | null
          prodi: string | null
          semester: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          nim?: string | null
          nip?: string | null
          prodi?: string | null
          semester?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          nim?: string | null
          nip?: string | null
          prodi?: string | null
          semester?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "dosen" | "mahasiswa"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "dosen", "mahasiswa"],
    },
  },
} as const
