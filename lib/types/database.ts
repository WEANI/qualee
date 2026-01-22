export interface Merchant {
  id: string;
  email: string;
  name: string | null;
  business_name: string | null;
  logo_url: string | null;
  logo_background_color?: string | null;
  background_url: string | null;
  qr_code_url: string | null;
  branding: Record<string, any>;
  google_review_link: string | null;
  google_maps_url: string | null;
  tripadvisor_url: string | null;
  instagram_handle: string | null;
  instagram_url: string | null;
  tiktok_handle: string | null;
  tiktok_url: string | null;
  weekly_schedule: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_tier: string;
  unlucky_probability?: number;
  retry_probability?: number;
  unlucky_quantity?: number;
  retry_quantity?: number;
  prize_quantities?: Record<string, number>;
  // WhatsApp workflow fields
  workflow_mode?: 'web' | 'whatsapp';
  whatsapp_message_template?: string | null;
  // Loyalty program fields
  loyalty_enabled?: boolean;
  loyalty_card_image_url?: string | null;
  points_per_purchase?: number;
  purchase_amount_threshold?: number;
  loyalty_currency?: 'EUR';
  welcome_points?: number;
  loyalty_message_template?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prize {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  probability: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  merchant_id: string;
  rating: number;
  comment: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  is_positive: boolean;
  user_token: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface Spin {
  id: string;
  merchant_id: string;
  prize_id: string | null;
  ip_hash: string | null;
  user_token: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  spin_id: string;
  merchant_id: string;
  code: string;
  prize_name: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface QRCode {
  id: string;
  merchant_id: string;
  asset_url: string;
  asset_type: string;
  created_at: string;
}

export interface SubscriptionTier {
  tier_name: string;
  max_locations: number;
  price: number;
  features: Record<string, any>;
}

export type NotificationType = 'feedback' | 'spin' | 'coupon_used' | 'new_customer';

export interface Notification {
  id: string;
  merchant_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

// ============================================================================
// LOYALTY SYSTEM TYPES
// ============================================================================

export type LoyaltyClientStatus = 'active' | 'suspended' | 'expired';

export interface LoyaltyClient {
  id: string;
  merchant_id: string;
  card_id: string; // Format: STAR-YYYY-XXXX
  name: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null; // Date de naissance pour cadeaux anniversaire
  points: number;
  total_purchases: number;
  total_spent: number;
  qr_code_data: string; // UUID unique pour le QR
  user_token: string | null;
  apple_pass_serial: string | null;
  google_pass_id: string | null;
  preferred_language: string | null; // Language preference (fr, en, th, es, pt)
  status: LoyaltyClientStatus;
  last_visit: string | null;
  created_at: string;
  updated_at: string;
}

export type PointsTransactionType = 'earn' | 'redeem' | 'bonus' | 'welcome' | 'adjustment';

export interface PointsTransaction {
  id: string;
  client_id: string;
  merchant_id: string;
  type: PointsTransactionType;
  points: number; // Positif = gain, Négatif = dépense
  balance_after: number;
  purchase_amount: number | null;
  description: string | null;
  reference_id: string | null;
  staff_id: string | null;
  created_at: string;
}

export type LoyaltyRewardType = 'discount' | 'product' | 'service' | 'cashback';

export interface LoyaltyReward {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  type: LoyaltyRewardType;
  value: string; // "10" pour 10%, "Dessert gratuit", etc.
  points_cost: number;
  quantity_available: number | null; // null = illimité
  image_url: string | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type RedeemedRewardStatus = 'pending' | 'used' | 'expired' | 'cancelled';

export interface RedeemedReward {
  id: string;
  client_id: string;
  reward_id: string | null;
  merchant_id: string;
  reward_name: string;
  reward_value: string;
  points_spent: number;
  redemption_code: string; // Format: RWD-XXXXXX
  status: RedeemedRewardStatus;
  expires_at: string | null;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
}

// Extended types with relations
export interface LoyaltyClientWithTransactions extends LoyaltyClient {
  transactions?: PointsTransaction[];
  redeemed_rewards?: RedeemedReward[];
}

export interface LoyaltyRewardWithStats extends LoyaltyReward {
  times_redeemed?: number;
}

// Stats interfaces
export interface LoyaltyStats {
  total_clients: number;
  active_clients: number;
  total_points_issued: number;
  total_points_redeemed: number;
  total_rewards_redeemed: number;
  average_points_per_client: number;
}

// ============================================================================
// MULTI-STORE SYSTEM TYPES
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  owner_id: string;

  // Multi-store sharing settings
  share_loyalty_cards: boolean;
  share_prizes: boolean;
  share_rewards: boolean;
  allow_cross_store_redemption: boolean;

  // Branding defaults
  default_logo_url: string | null;
  default_background_url: string | null;
  primary_color: string;
  secondary_color: string;

  // Subscription
  subscription_tier: 'starter' | 'pro' | 'multi-shop';
  max_stores: number;

  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  organization_id: string;
  merchant_id: string | null;

  // Store info
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;

  // Branding (overrides organization defaults)
  logo_url: string | null;
  background_url: string | null;
  qr_code_url: string | null;

  // Settings
  is_active: boolean;
  is_headquarters: boolean;

  // Sharing overrides
  use_shared_loyalty: boolean;
  use_shared_prizes: boolean;
  use_shared_rewards: boolean;

  // Social links
  google_review_link: string | null;
  google_maps_url: string | null;
  tripadvisor_url: string | null;
  instagram_url: string | null;

  // Wheel config
  wheel_bg_color: string | null;
  segment_colors: { color: string; textColor: string }[] | null;
  unlucky_quantity: number;
  retry_quantity: number;
  prize_quantities: Record<string, number>;

  // Operating hours
  operating_hours: Record<string, { open: string; close: string }> | null;

  created_at: string;
  updated_at: string;
}

export type OrganizationMemberRole = 'owner' | 'admin' | 'manager' | 'staff';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationMemberRole;
  store_ids: string[] | null; // null = access to all stores

  // Permissions
  can_manage_prizes: boolean;
  can_manage_loyalty: boolean;
  can_view_analytics: boolean;
  can_scan_codes: boolean;
  can_manage_staff: boolean;

  // Metadata
  invited_by: string | null;
  invited_at: string;
  joined_at: string | null;
  is_active: boolean;
}

export interface OrganizationPrize {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  probability: number;
  is_active: boolean;
  quantity: number | null;
  available_at_stores: string[] | null; // null = all stores
  redeemable_at_stores: string[] | null; // null = all stores
  created_at: string;
  updated_at: string;
}

export interface OrganizationReward {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  type: LoyaltyRewardType;
  value: string;
  points_cost: number;
  is_active: boolean;
  quantity_available: number | null;
  redeemable_at_stores: string[] | null;
  valid_from: string | null;
  valid_until: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StoreVisit {
  id: string;
  organization_id: string;
  store_id: string;
  loyalty_client_id: string | null;
  visit_type: 'spin' | 'loyalty_scan' | 'redemption' | 'feedback';
  user_token: string | null;
  ip_hash: string | null;
  created_at: string;
}

// Extended types with relations
export interface OrganizationWithStores extends Organization {
  stores?: Store[];
  member_count?: number;
}

export interface StoreWithOrganization extends Store {
  organization?: Organization;
}

export interface CouponWithStoreInfo extends Coupon {
  organization_id?: string | null;
  store_id?: string | null;
  won_at_store_id?: string | null;
  redeemed_at_store_id?: string | null;
  redeemable_at_any_store?: boolean;
  redeemed_by_staff_id?: string | null;
  won_at_store?: Store;
  redeemed_at_store?: Store;
}

// Multi-store stats
export interface MultiStoreStats {
  total_stores: number;
  active_stores: number;
  total_spins: number;
  total_coupons: number;
  total_feedback: number;
  total_loyalty_clients: number;
  stores_breakdown: {
    store_id: string;
    store_name: string;
    spins: number;
    coupons_used: number;
    feedback_count: number;
    avg_rating: number;
  }[];
}

// User context for multi-store
export interface UserStoreContext {
  organization_id: string;
  organization_name: string;
  role: OrganizationMemberRole;
  is_owner: boolean;
  stores: {
    store_id: string;
    store_name: string;
    is_headquarters: boolean;
  }[];
  current_store_id: string | null;
}
