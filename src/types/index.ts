export type UserType = "landscaper" | "homeowner" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType | null;
  credits_balance: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  share_slug: string | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: string;
  project_id: string;
  user_id: string;
  storage_path: string;
  thumb_path: string | null;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface Generation {
  id: string;
  image_id: string;
  user_id: string;
  parent_gen_id: string | null;
  storage_path: string | null;
  status: GenerationStatus;
  style_preset: string | null;
  time_of_day: string | null;
  season: string | null;
  weather: string | null;
  custom_prompt: string | null;
  is_inpainting: boolean;
  full_prompt: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export type CreditTransactionType =
  | "signup"
  | "subscription"
  | "purchase"
  | "generation"
  | "refund";

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: CreditTransactionType;
  description: string | null;
  generation_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export type SubscriptionPlan = "starter" | "pro" | "business";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: SubscriptionPlan;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  generation_id: string | null;
  storage_path: string | null;
  caption: string | null;
  style_preset: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface GenerateRequest {
  image_id: string;
  style_preset?: string;
  time_of_day?: string;
  season?: string;
  weather?: string;
  custom_prompt?: string;
}

export interface InpaintRequest extends GenerateRequest {
  parent_generation_id: string;
  mask_description: string;
}
