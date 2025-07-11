export interface Repair {
  id: number;
  customer_name: string;
  contact?: string;
  item_brand: string;
  item_model?: string;
  serial_number?: string;
  under_warranty: boolean;
  problem_description: string;
  status: 'pending-diagnosis' | 'awaiting-parts' | 'in-progress' | 'completed' | 'awaiting-pickup' | 'picked-up' | 'cancelled';
  repair_cost?: number;
  amount_paid?: number;
  parts_used?: string;
  created_at: string;
  updated_at: string;
}