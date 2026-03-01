export interface BaseModel {
  id: string;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
  is_active: boolean;
}
