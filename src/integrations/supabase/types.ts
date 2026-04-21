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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string | null
          created_at: string
          date: string
          id: string
          notes: string | null
          pet_id: string
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          time: string
          updated_at: string
          user_id: string
          vet_name: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          pet_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          time: string
          updated_at?: string
          user_id: string
          vet_name?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          pet_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          time?: string
          updated_at?: string
          user_id?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "vet_clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_logs: {
        Row: {
          created_at: string
          date: string
          given_at: string | null
          id: string
          schedule_id: string
          skipped: boolean | null
        }
        Insert: {
          created_at?: string
          date?: string
          given_at?: string | null
          id?: string
          schedule_id: string
          skipped?: boolean | null
        }
        Update: {
          created_at?: string
          date?: string
          given_at?: string | null
          id?: string
          schedule_id?: string
          skipped?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "feeding_logs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "feeding_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_schedules: {
        Row: {
          active: boolean | null
          created_at: string
          food_type: string | null
          id: string
          meal_name: string
          pet_id: string
          portion: string | null
          time: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          food_type?: string | null
          id?: string
          meal_name: string
          pet_id: string
          portion?: string | null
          time: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          food_type?: string | null
          id?: string
          meal_name?: string
          pet_id?: string
          portion?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_schedules_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          pet_id: string
          record_date: string | null
          record_type: Database["public"]["Enums"]["health_record_type"] | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          pet_id: string
          record_date?: string | null
          record_type?: Database["public"]["Enums"]["health_record_type"] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          pet_id?: string
          record_date?: string | null
          record_type?: Database["public"]["Enums"]["health_record_type"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean | null
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          med_name: string
          pet_id: string
          start_date: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          med_name: string
          pet_id: string
          start_date?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          med_name?: string
          pet_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          allergies: string | null
          breed: string | null
          created_at: string
          dob: string | null
          gender: Database["public"]["Enums"]["pet_gender"] | null
          id: string
          microchip_id: string | null
          name: string
          notes: string | null
          photo_url: string | null
          species: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          allergies?: string | null
          breed?: string | null
          created_at?: string
          dob?: string | null
          gender?: Database["public"]["Enums"]["pet_gender"] | null
          id?: string
          microchip_id?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          species: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          allergies?: string | null
          breed?: string | null
          created_at?: string
          dob?: string | null
          gender?: Database["public"]["Enums"]["pet_gender"] | null
          id?: string
          microchip_id?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          species?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          booking_date: string
          booking_time: string | null
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          service_id: string
          status: Database["public"]["Enums"]["booking_status"] | null
          user_id: string
        }
        Insert: {
          booking_date: string
          booking_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_time?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string | null
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          price: string | null
          provider_id: string | null
          rating: number | null
          review_count: number | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          price?: string | null
          provider_id?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          price?: string | null
          provider_id?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccines: {
        Row: {
          administered_by: string | null
          created_at: string
          date_given: string | null
          id: string
          next_due: string | null
          pet_id: string
          vaccine_name: string
        }
        Insert: {
          administered_by?: string | null
          created_at?: string
          date_given?: string | null
          id?: string
          next_due?: string | null
          pet_id: string
          vaccine_name: string
        }
        Update: {
          administered_by?: string | null
          created_at?: string
          date_given?: string | null
          id?: string
          next_due?: string | null
          pet_id?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      vet_clinics: {
        Row: {
          address: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
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
      app_role: "owner" | "vet" | "admin"
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      health_record_type: "checkup" | "surgery" | "lab" | "other"
      pet_gender: "male" | "female" | "unknown"
      service_category:
        | "grooming"
        | "boarding"
        | "dog_walking"
        | "pharmacy"
        | "training"
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
      app_role: ["owner", "vet", "admin"],
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      health_record_type: ["checkup", "surgery", "lab", "other"],
      pet_gender: ["male", "female", "unknown"],
      service_category: [
        "grooming",
        "boarding",
        "dog_walking",
        "pharmacy",
        "training",
      ],
    },
  },
} as const
