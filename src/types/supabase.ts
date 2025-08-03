export type Json =
  | string
  | number
  | boolean 
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      employees: {
        Row: {
          "Account Number": string | null
          "Alternate Approver": string | null
          "Alternative Mobile Number": string | null
          Area: string | null
          Bank: string | null
          "Bank Branch": string | null
          Branch: string | null
          City: string | null
          "Contract End Date": string | null
          "Contract Start Date": string | null
          Country: string | null
          "Date of Birth": string | null
          "Disability Cert No": string | null
          "Employee AVC": string | null
          "Employee Id": number
          "Employee Number": string | null
          "Employee Type": string | null
          "Employer AVC": string | null
          Entity: string | null
          "First Name": string | null
          Gender: string | null
          "House Number": string | null
          "Housing Levy Deduction": string | null
          "ID Number": number | null
          "Internship End Date": string | null
          "Job Group": string | null
          "Job Level": string | null
          "Job Title": string | null
          "Last Name": string | null
          "Leave Approver": string | null
          Manager: string | null
          "Marital Status": string | null
          "Middle Name": string | null
          "Mobile Number": string | null
          "NHIF Deduction": string | null
          "NHIF Number": string | null
          "NSSF Deduction": string | null
          "NSSF Number": string | null
          Office: string | null
          "Payroll Number": string | null
          "Pension Deduction": string | null
          "Pension Start Date": string | null
          "Personal Email": string | null
          "Postal Address": string | null
          "Postal Code": string | null
          "Postal Location": string | null
          "Probation End Date": string | null
          "Probation Start Date": string | null
          Road: string | null
          "SHIF Number": string | null
          "Start Date": string | null
          "Tax Exempted": string | null
          "Tax PIN": string | null
          "Termination Date": string | null
          Town: string | null
          "Type of Identification": string | null
          "WCF Number": string | null
          "Work Email": string | null
        }
        Insert: {
          "Account Number"?: string | null
          "Alternate Approver"?: string | null
          "Alternative Mobile Number"?: string | null
          Area?: string | null
          Bank?: string | null
          "Bank Branch"?: string | null
          Branch?: string | null
          City?: string | null
          "Contract End Date"?: string | null
          "Contract Start Date"?: string | null
          Country?: string | null
          "Date of Birth"?: string | null
          "Disability Cert No"?: string | null
          "Employee AVC"?: string | null
          "Employee Id": number
          "Employee Number"?: string | null
          "Employee Type"?: string | null
          "Employer AVC"?: string | null
          Entity?: string | null
          "First Name"?: string | null
          Gender?: string | null
          "House Number"?: string | null
          "Housing Levy Deduction"?: string | null
          "ID Number"?: number | null
          "Internship End Date"?: string | null
          "Job Group"?: string | null
          "Job Level"?: string | null
          "Job Title"?: string | null
          "Last Name"?: string | null
          "Leave Approver"?: string | null
          Manager?: string | null
          "Marital Status"?: string | null
          "Middle Name"?: string | null
          "Mobile Number"?: string | null
          "NHIF Deduction"?: string | null
          "NHIF Number"?: string | null
          "NSSF Deduction"?: string | null
          "NSSF Number"?: string | null
          Office?: string | null
          "Payroll Number"?: string | null
          "Pension Deduction"?: string | null
          "Pension Start Date"?: string | null
          "Personal Email"?: string | null
          "Postal Address"?: string | null
          "Postal Code"?: string | null
          "Postal Location"?: string | null
          "Probation End Date"?: string | null
          "Probation Start Date"?: string | null
          Road?: string | null
          "SHIF Number"?: string | null
          "Start Date"?: string | null
          "Tax Exempted"?: string | null
          "Tax PIN"?: string | null
          "Termination Date"?: string | null
          Town?: string | null
          "Type of Identification"?: string | null
          "WCF Number"?: string | null
          "Work Email"?: string | null
        }
        Update: {
          "Account Number"?: string | null
          "Alternate Approver"?: string | null
          "Alternative Mobile Number"?: string | null
          Area?: string | null
          Bank?: string | null
          "Bank Branch"?: string | null
          Branch?: string | null
          City?: string | null
          "Contract End Date"?: string | null
          "Contract Start Date"?: string | null
          Country?: string | null
          "Date of Birth"?: string | null
          "Disability Cert No"?: string | null
          "Employee AVC"?: string | null
          "Employee Id"?: number
          "Employee Number"?: string | null
          "Employee Type"?: string | null
          "Employer AVC"?: string | null
          Entity?: string | null
          "First Name"?: string | null
          Gender?: string | null
          "House Number"?: string | null
          "Housing Levy Deduction"?: string | null
          "ID Number"?: number | null
          "Internship End Date"?: string | null
          "Job Group"?: string | null
          "Job Level"?: string | null
          "Job Title"?: string | null
          "Last Name"?: string | null
          "Leave Approver"?: string | null
          Manager?: string | null
          "Marital Status"?: string | null
          "Middle Name"?: string | null
          "Mobile Number"?: string | null
          "NHIF Deduction"?: string | null
          "NHIF Number"?: string | null
          "NSSF Deduction"?: string | null
          "NSSF Number"?: string | null
          Office?: string | null
          "Payroll Number"?: string | null
          "Pension Deduction"?: string | null
          "Pension Start Date"?: string | null
          "Personal Email"?: string | null
          "Postal Address"?: string | null
          "Postal Code"?: string | null
          "Postal Location"?: string | null
          "Probation End Date"?: string | null
          "Probation Start Date"?: string | null
          Road?: string | null
          "SHIF Number"?: string | null
          "Start Date"?: string | null
          "Tax Exempted"?: string | null
          "Tax PIN"?: string | null
          "Termination Date"?: string | null
          Town?: string | null
          "Type of Identification"?: string | null
          "WCF Number"?: string | null
          "Work Email"?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          address: string
          available_start_date: string
          constituency: string
          county: string
          cover_letter: string
          created_at: string
          department: string
          education: string
          email: string
          expected_salary: string
          first_name: string
          graduation_year: string | null
          id: string
          id_number: string
          languages: string
          last_name: string
          markets_worked: string | null
          nationality: string
          phone: string
          position: string | null
          postal_code: string | null
          preferred_location: string
          previous_company: string
          previous_role: string
          previous_salary: string
          references: string | null
          resume_file_name: string
          resume_file_url: string
          skills: string
          status: string | null
          university: string
          updated_at: string | null
          user_id: string
          why_joining_us: string | null
          work_experience: string
        }
        Insert: {
          address: string
          available_start_date: string
          constituency: string
          county: string
          cover_letter: string
          created_at?: string
          department: string
          education: string
          email?: string
          expected_salary: string
          first_name?: string
          graduation_year?: string | null
          id?: string
          id_number: string
          languages: string
          last_name?: string
          markets_worked?: string | null
          nationality: string
          phone: string
          position?: string | null
          postal_code?: string | null
          preferred_location: string
          previous_company: string
          previous_role: string
          previous_salary: string
          references?: string | null
          resume_file_name: string
          resume_file_url: string
          skills: string
          status?: string | null
          university: string
          updated_at?: string | null
          user_id: string
          why_joining_us?: string | null
          work_experience: string
        }
        Update: {
          address?: string
          available_start_date?: string
          constituency?: string
          county?: string
          cover_letter?: string
          created_at?: string
          department?: string
          education?: string
          email?: string
          expected_salary?: string
          first_name?: string
          graduation_year?: string | null
          id?: string
          id_number?: string
          languages?: string
          last_name?: string
          markets_worked?: string | null
          nationality?: string
          phone?: string
          position?: string | null
          postal_code?: string | null
          preferred_location?: string
          previous_company?: string
          previous_role?: string
          previous_salary?: string
          references?: string | null
          resume_file_name?: string
          resume_file_url?: string
          skills?: string
          status?: string | null
          university?: string
          updated_at?: string | null
          user_id?: string
          why_joining_us?: string | null
          work_experience?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
