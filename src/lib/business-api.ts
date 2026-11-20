/**
 * Business Suite Domain API Service Layer.
 *
 * Provides typed HTTP communication with the Django REST backend:
 * - Authentication (SimpleJWT login, business self-registration)
 * - Brand Workspace Profile (fetch, update)
 * - Creator Discovery & Full Profiles
 * - Hierarchical Taxonomies (Categories, GIS Locations)
 * - Campaigns (listing, creation, metrics)
 * - Requirements (listing, creation, applications)
 */

import { apiClient } from "./api-client";
import type { Creator } from "@/data/mock";

export interface BusinessProfileData {
  id: string;
  company_name: string;
  business_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  about: string;
  logo_url: string;
  tax_id: string;
  verification_status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  notification_preferences?: Record<string, boolean>;
  hq_location?: {
    id: string;
    name: string;
    full_path?: string;
  } | null;
  subscription_plan?: string;
  created_at: string;
}

export interface CreatorSummary {
  id: string;
  name: string;
  handle: string;
  photo_url?: string;
  cover_url?: string;
  category?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  primary_location_name?: string;
  full_location?: string;
  bio?: string;
  about?: string;
  followers_count: number;
  engagement_rate: number;
  starting_price?: number;
  min_service_price?: number;
  is_verified?: boolean;
  social_accounts?: Array<{
    platform: string;
    handle: string;
    followers_count: number;
    engagement_rate: number;
  }>;
  services?: Array<{
    id: string;
    name: string;
    service_type_name?: string;
    price: number;
    turnaround_days?: number;
  }>;
  portfolio?: Array<{
    id: string;
    title?: string;
    media_url: string;
    media_type: string;
    caption?: string;
  }>;
}

export interface CampaignData {
  id: string;
  title: string;
  business: string;
  business_id?: string;
  category?: string;
  category_name?: string;
  brief?: string;
  objective?: string;
  deliverables_summary?: string;
  deliverables_spec?: string;
  location?: string;
  location_text?: string;
  budget: number;
  total_budget_cents: number;
  currency: string;
  creators: number;
  creators_needed: number;
  applications_count: number;
  deadline?: string;
  status: string;
  escrow_status: string;
  cover_image_url?: string;
  is_featured: boolean;
  created_at: string;
}

export interface RequirementData {
  id: string;
  title: string;
  category?: string;
  category_name?: string;
  language?: string;
  platforms?: string[];
  location_text?: string;
  min_budget: number;
  max_budget: number;
  min_budget_cents: number;
  max_budget_cents: number;
  currency: string;
  creators_needed: number;
  applications_count: number;
  deadline?: string;
  status: string;
  description: string;
  created_at: string;
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  slug: string;
}

export interface TaxonomyLocation {
  id: string;
  name: string;
  type: string;
  parent_name?: string;
  full_path?: string;
  country_code?: string;
}

// -----------------------------------------------------------------------------
// Data Adapters
// -----------------------------------------------------------------------------

export function mapBackendCreatorToCreator(c: any): Creator {
  const city = c.city || c.location?.city || "Kerala";
  const district = c.district || c.location?.district || "";
  const country = c.country || c.location?.country || "India";
  const formattedLocation = district ? `${city}, ${district}` : `${city}, ${country}`;

  return {
    id: String(c.id),
    name: c.name || c.display_name || "Creator",
    handle: c.handle?.startsWith("@") ? c.handle : `@${c.handle || "creator"}`,
    avatar:
      c.photo_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.display_name || "C")}&background=E0F2FE&color=0369A1&bold=true`,
    cover:
      c.cover_url ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    verified: Boolean(c.verified ?? c.is_verified),
    socialConnected: Boolean(
      c.social_accounts?.length || c.social_connected || c.platforms?.length,
    ),
    category: c.category || "General",
    secondaryCategories: [],
    location: c.full_location || formattedLocation,
    languages: c.languages?.length ? c.languages : ["Malayalam", "English"],
    bio: c.bio || "Content Creator on Influencers.com",
    about: c.about || c.bio || "No biography provided yet.",
    mainPlatform: (c.main_platform ||
      c.platforms?.[0] ||
      c.social_accounts?.[0]?.platform ||
      "Instagram") as any,
    followers: c.followers ?? c.followers_count ?? 0,
    engagement: c.engagement ?? c.engagement_rate ?? 0,
    startingPrice: c.startingPrice ?? c.starting_price ?? c.min_service_price ?? 0,
    responseRate: 95,
    lastActiveDays: 1,
    services: (c.services || []).map((s: any) => ({
      id: s.id,
      name: s.name || s.title || "Standard Package",
      turnaround: s.turnaround || `${s.delivery_time_days || s.turnaround_days || 3} days`,
      price: s.price ?? (s.starting_price_cents ? s.starting_price_cents / 100 : 0),
    })),
    socials: (c.social_accounts?.length
      ? c.social_accounts
      : (c.platforms || []).map((p: string) => ({
          platform: p,
          handle: c.handle || "",
          followers: c.followers ?? 0,
          engagement: c.engagement ?? 0,
        }))
    ).map((s: any) => ({
      platform: s.platform || s.platform_name || s,
      handle: s.handle || c.handle || "",
      followers: s.followers_count ?? s.followers ?? 0,
      engagement: s.engagement_rate ?? s.engagement ?? 0,
    })),
    portfolio: c.portfolio || [],
    audience: c.audience || {
      female: 50,
      male: 50,
      topAge: "18-24",
      topCities: [city, "Kochi"],
      authenticity: 92,
    },
    collaborations: c.collaborations || [],
    testimonials: c.testimonials || [],
    mediaKit: c.media_kit || "Media-Kit.pdf",
    geo: {
      lat: Number(c.location?.lat ?? c.latitude ?? 11.2758),
      lng: Number(c.location?.lng ?? c.longitude ?? 76.2263),
      city: city,
      region: c.location?.region || c.state || district || city,
      country: country,
      countryCode: (c.location?.countryCode || c.country_code || "IN").toUpperCase(),
    },
    currency: (c.currency || "INR") as any,
    serviceAreas: c.serviceLocations?.length
      ? c.serviceLocations
      : c.service_areas || [city, "Remote"],
    remote: Boolean(c.remote ?? true),
    travel: Boolean(c.travels ?? c.travel ?? false),
  };
}

// -----------------------------------------------------------------------------
// Authentication Services
// -----------------------------------------------------------------------------

export async function loginBusiness(email: string, password: string): Promise<any> {
  const response = await apiClient.post("/auth/token/", {
    email: email,
    username: email,
    password: password,
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("business_access_token", response.data.access);
    localStorage.setItem("business_refresh_token", response.data.refresh);
    localStorage.setItem("business_email", email);
  }
  return response.data;
}

export async function registerBusiness(payload: {
  email: string;
  password: string;
  company_name: string;
  business_type?: string;
  contact_name?: string;
  contact_phone?: string;
}): Promise<any> {
  const response = await apiClient.post("/business/register/", payload);
  if (typeof window !== "undefined" && response.data.tokens) {
    localStorage.setItem("business_access_token", response.data.tokens.access);
    localStorage.setItem("business_refresh_token", response.data.tokens.refresh);
    localStorage.setItem("business_email", payload.email);
  }
  return response.data;
}

export function logoutBusiness(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("business_access_token");
    localStorage.removeItem("business_refresh_token");
    localStorage.removeItem("business_email");
    localStorage.removeItem("cached_business_profile");
    window.location.href = "/login";
  }
}

// -----------------------------------------------------------------------------
// Business Profile Services
// -----------------------------------------------------------------------------

export async function getBusinessProfile(): Promise<BusinessProfileData> {
  const response = await apiClient.get<BusinessProfileData>("/business/profile/");
  if (typeof window !== "undefined") {
    localStorage.setItem("cached_business_profile", JSON.stringify(response.data));
  }
  return response.data;
}

export async function updateBusinessProfile(
  payload: Partial<BusinessProfileData>,
): Promise<BusinessProfileData> {
  const response = await apiClient.patch<BusinessProfileData>("/business/profile/", payload);
  if (typeof window !== "undefined") {
    localStorage.setItem("cached_business_profile", JSON.stringify(response.data));
  }
  return response.data;
}

// -----------------------------------------------------------------------------
// Creator Discovery & Profiles
// -----------------------------------------------------------------------------

export async function getDiscoverCreators(params?: {
  search?: string;
  category?: string;
  location?: string;
  min_followers?: number;
  max_followers?: number;
  platform?: string;
  page?: number;
}): Promise<{ count: number; results: CreatorSummary[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category && params.category !== "All") query.append("category", params.category);
  if (params?.location) query.append("location", params.location);
  if (params?.min_followers) query.append("min_followers", String(params.min_followers));
  if (params?.max_followers) query.append("max_followers", String(params.max_followers));
  if (params?.platform && params.platform !== "All") query.append("platform", params.platform);
  if (params?.page) query.append("page", String(params.page));

  const response = await apiClient.get(`/public/creators/?${query.toString()}`);
  return response.data;
}

export async function getCreatorDetail(idOrSlug: string): Promise<CreatorSummary> {
  const response = await apiClient.get<CreatorSummary>(`/public/creators/${idOrSlug}/`);
  return response.data;
}

// -----------------------------------------------------------------------------
// Taxonomies (Categories & Dynamic Geocoding Locations)
// -----------------------------------------------------------------------------

export async function getTaxonomyCategories(): Promise<TaxonomyCategory[]> {
  const response = await apiClient.get<TaxonomyCategory[]>("/public/taxonomies/categories/");
  return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
}

export async function searchTaxonomyLocations(query: string): Promise<TaxonomyLocation[]> {
  const response = await apiClient.get(
    `/public/taxonomies/locations/?search=${encodeURIComponent(query)}`,
  );
  return response.data.results || response.data || [];
}

// -----------------------------------------------------------------------------
// Campaigns Services
// -----------------------------------------------------------------------------

export async function getBusinessCampaigns(status?: string | any): Promise<CampaignData[]> {
  const statusStr =
    typeof status === "string" && status !== "All" && !status.startsWith("[object")
      ? status
      : undefined;
  const url = statusStr
    ? `/business/campaigns/?status=${encodeURIComponent(statusStr)}`
    : "/business/campaigns/";
  const response = await apiClient.get(url);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
}

export async function createBusinessCampaign(payload: {
  title: string;
  category?: string;
  budget?: number;
  currency?: string;
  brief?: string;
  deliverables_summary?: string;
  location_text?: string;
  creators_needed?: number;
  cover_image_url?: string;
  is_draft?: boolean;
}): Promise<CampaignData> {
  const response = await apiClient.post<CampaignData>("/business/campaigns/", payload);
  return response.data;
}

export async function updateBusinessCampaign(
  id: string,
  payload: Record<string, any>,
): Promise<CampaignData> {
  const response = await apiClient.patch<CampaignData>(`/business/campaigns/${id}/`, payload);
  return response.data;
}

export async function uploadBusinessMedia(
  file: File,
  fileType: "COVER" | "LOGO" = "COVER",
): Promise<{ id: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_type", fileType);
  const response = await apiClient.post("/business/media/upload/", formData);
  return response.data;
}

export async function getBusinessCampaignDetail(id: string): Promise<CampaignData> {
  const response = await apiClient.get<CampaignData>(`/business/campaigns/${id}/`);
  return response.data;
}

export interface CampaignApplicationBid {
  id: string;
  campaign: string;
  creator: string;
  creator_name: string;
  creator_handle: string;
  creator_photo?: string;
  name?: string;
  handle?: string;
  avatar?: string;
  proposed_fee_cents: number;
  fee: number;
  currency: string;
  pitch_text?: string;
  pitch?: string;
  status: "PENDING" | "SHORTLISTED" | "ACCEPTED" | "REJECTED";
  date?: string;
  created_at: string;
  inquiry_id?: string;
}

export async function getBusinessCampaignApplications(
  campaignId: string,
): Promise<CampaignApplicationBid[]> {
  const response = await apiClient.get<CampaignApplicationBid[]>(
    `/business/campaigns/${campaignId}/applications/`,
  );
  return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
}

export async function updateBusinessCampaignApplication(
  campaignId: string,
  bidId: string,
  status: "SHORTLISTED" | "ACCEPTED" | "REJECTED",
): Promise<CampaignApplicationBid> {
  const response = await apiClient.patch<CampaignApplicationBid>(
    `/business/campaigns/${campaignId}/applications/${bidId}/`,
    { status },
  );
  return response.data;
}

// -----------------------------------------------------------------------------
// Requirements Services
// -----------------------------------------------------------------------------

export async function getBusinessRequirements(): Promise<RequirementData[]> {
  const response = await apiClient.get("/business/requirements/");
  return Array.isArray(response.data) ? response.data : response.data.results || [];
}

export async function createBusinessRequirement(payload: {
  title: string;
  category?: string;
  min_budget?: number;
  max_budget?: number;
  currency?: string;
  creators_needed?: number;
  location_text?: string;
  description?: string;
}): Promise<RequirementData> {
  const response = await apiClient.post<RequirementData>("/business/requirements/", payload);
  return response.data;
}

export async function getBusinessRequirementDetail(id: string): Promise<RequirementData> {
  const response = await apiClient.get<RequirementData>(`/business/requirements/${id}/`);
  return response.data;
}

// -----------------------------------------------------------------------------
// Direct Collaboration Inquiries (Brand -> Creator)
// -----------------------------------------------------------------------------

export interface CollaborationInquiryPayload {
  creator_handle: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  company_name?: string;
  subject: string;
  message: string;
  budget?: number;
  currency?: string;
  service_id?: string;
}

export async function submitCollaborationInquiry(payload: CollaborationInquiryPayload): Promise<{
  id: string;
  status: string;
  creator: string;
  business: string;
  detail: string;
}> {
  const response = await apiClient.post("/public/inquiries/", payload);
  return response.data;
}

export interface BusinessInquiryItem {
  id: string;
  business: string;
  business_id: string;
  business_name: string;
  creator_id: string;
  creator_name: string;
  creator_handle: string;
  creator_avatar?: string;
  campaign: string;
  subject: string;
  message: string;
  budget: string;
  budget_cents?: number;
  currency: string;
  status: "NEW" | "RESPONDED" | "NEGOTIATING" | "ACCEPTED" | "DECLINED";
  is_read?: boolean;
  unread_count?: number;
  date: string;
  latest_message_at: string;
  messages_count: number;
  created_at: string;
}

export interface BusinessInquiryMessage {
  id: string;
  sender: string;
  sender_name: string;
  sender_email: string;
  body: string;
  offer_price_cents?: number;
  is_from_business: boolean;
  is_from_creator: boolean;
  created_at: string;
}

export interface BusinessDashboardStats {
  active_campaigns: number;
  total_inquiries: number;
  accepted_collaborations: number;
  connected_creators: number;
  total_budget: number;
  currency: string;
}

export async function getBusinessInquiries(): Promise<BusinessInquiryItem[]> {
  const res = await apiClient.get<BusinessInquiryItem[]>("/business/inquiries/");
  return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
}

export async function getBusinessInquiryMessages(id: string): Promise<BusinessInquiryMessage[]> {
  const res = await apiClient.get<BusinessInquiryMessage[]>(`/business/inquiries/${id}/messages/`);
  return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
}

export async function sendBusinessInquiryMessage(
  id: string,
  body: string,
): Promise<BusinessInquiryMessage> {
  const res = await apiClient.post<BusinessInquiryMessage>(`/business/inquiries/${id}/messages/`, {
    body,
  });
  return res.data;
}

export async function getBusinessInquiriesUnreadCount(): Promise<{ unread_count: number }> {
  const res = await apiClient.get<{ unread_count: number }>("/business/inquiries/unread-count/");
  return res.data;
}

export async function getBusinessDashboardStats(): Promise<BusinessDashboardStats> {
  const res = await apiClient.get<BusinessDashboardStats>("/business/dashboard/stats/");
  return res.data;
}

/* ---------------- Shortlists (Database Connected) ---------------- */

export interface ShortlistCreatorEntry {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_handle: string;
  creator_avatar: string;
  creator_category: string;
  creator_location: string;
  creator_bio: string;
  creator_verified: boolean;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface BusinessShortlist {
  id: string;
  name: string;
  description: string;
  color: string;
  is_archived: boolean;
  creators_count: number;
  creator_avatars: string[];
  entries?: ShortlistCreatorEntry[];
  created_at: string;
  updated_at: string;
}

export async function getBusinessShortlists(): Promise<BusinessShortlist[]> {
  const res = await apiClient.get<BusinessShortlist[]>("/business/shortlists/");
  return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
}

export async function createBusinessShortlist(payload: {
  name: string;
  description?: string;
  color?: string;
}): Promise<BusinessShortlist> {
  const res = await apiClient.post<BusinessShortlist>("/business/shortlists/", payload);
  return res.data;
}

export async function getBusinessShortlistDetail(id: string): Promise<BusinessShortlist> {
  const res = await apiClient.get<BusinessShortlist>(`/business/shortlists/${id}/`);
  return res.data;
}

export async function updateBusinessShortlist(
  id: string,
  payload: Partial<{ name: string; description: string; color: string }>,
): Promise<BusinessShortlist> {
  const res = await apiClient.patch<BusinessShortlist>(`/business/shortlists/${id}/`, payload);
  return res.data;
}

export async function deleteBusinessShortlist(id: string): Promise<void> {
  await apiClient.delete(`/business/shortlists/${id}/`);
}

export async function addCreatorToShortlist(
  shortlistId: string,
  creatorId: string,
  notes?: string,
): Promise<ShortlistCreatorEntry> {
  const res = await apiClient.post<ShortlistCreatorEntry>(
    `/business/shortlists/${shortlistId}/creators/`,
    { creator_id: creatorId, notes },
  );
  return res.data;
}

export async function removeCreatorFromShortlist(
  shortlistId: string,
  creatorId: string,
): Promise<void> {
  await apiClient.delete(`/business/shortlists/${shortlistId}/creators/${creatorId}/`);
}

export async function toggleCreatorShortlist(
  creatorId: string,
  shortlistId?: string,
): Promise<{ is_saved: boolean; shortlist_id: string; shortlist_name: string; detail: string }> {
  const res = await apiClient.post("/business/shortlists/toggle/", {
    creator_id: creatorId,
    shortlist_id: shortlistId,
  });
  return res.data;
}

/* ---------------- Saved Searches (Database Connected) ---------------- */

export interface SavedSearchData {
  id: string;
  name: string;
  filters: {
    categories?: string[];
    locations?: string[];
    languages?: string[];
    platforms?: string[];
    followers?: [number, number];
    budget?: [number, number];
    minEngagement?: number;
    [key: string]: any;
  };
  notify: boolean;
  notify_enabled: boolean;
  newMatches: number;
  new_matches_count: number;
  categories: string[];
  locations: string[];
  languages: string[];
  platforms: string[];
  followers: [number, number];
  budget: [number, number];
  minEngagement: number;
  created_at: string;
  updated_at: string;
}

export async function getBusinessSavedSearches(): Promise<SavedSearchData[]> {
  const res = await apiClient.get<SavedSearchData[]>("/business/saved-searches/");
  return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
}

export async function createBusinessSavedSearch(payload: {
  name: string;
  filters?: Record<string, any>;
  notify?: boolean;
}): Promise<SavedSearchData> {
  const res = await apiClient.post<SavedSearchData>("/business/saved-searches/", payload);
  return res.data;
}

export async function updateBusinessSavedSearch(
  id: string,
  payload: Partial<{ name: string; filters: Record<string, any>; notify: boolean }>,
): Promise<SavedSearchData> {
  const res = await apiClient.patch<SavedSearchData>(`/business/saved-searches/${id}/`, payload);
  return res.data;
}

export async function deleteBusinessSavedSearch(id: string): Promise<void> {
  await apiClient.delete(`/business/saved-searches/${id}/`);
}

export async function toggleSavedSearchNotify(
  id: string,
  notify?: boolean,
): Promise<{
  id: string;
  notify: boolean;
  notify_enabled: boolean;
  detail: string;
}> {
  const res = await apiClient.post(`/business/saved-searches/${id}/toggle-notify/`, { notify });
  return res.data;
}

/* ---------------- Analytics (Database Connected) ---------------- */

export interface BusinessAnalyticsData {
  total_spend: number;
  total_spend_cents: number;
  active_collaborations: number;
  response_rate: number;
  total_inquiries: number;
  analytics_stats: Array<{ label: string; value: string }>;
  campaign_activity: Array<{ month: string; campaigns: number; inquiries: number }>;
  response_rate_trend: Array<{ month: string; rate: number }>;
  campaign_performance: Array<{ name: string; reach: number; engagement: number }>;
  category_distribution: Array<{ name: string; value: number }>;
}

export async function getBusinessAnalytics(): Promise<BusinessAnalyticsData> {
  const res = await apiClient.get<BusinessAnalyticsData>("/business/analytics/");
  return res.data;
}

/* ---------------- Taxonomies & Location Services ---------------- */

export async function getTaxonomyLocations(search?: string): Promise<TaxonomyLocation[]> {
  const url = search
    ? `/public/taxonomies/locations/?search=${encodeURIComponent(search)}`
    : "/public/taxonomies/locations/";
  const res = await apiClient.get(url);
  return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
}

/* ---------------- Notifications & Event Feed ---------------- */

export interface BusinessNotificationItem {
  id: string;
  recipient?: string | null;
  title: string;
  message: string;
  kind: "SYSTEM" | "USER" | "CAMPAIGN" | "VERIFICATION" | string;
  audience?: string;
  scheduled_at?: string | null;
  status: string;
  is_read: boolean;
  created_at: string;
}

export async function getBusinessNotifications(): Promise<BusinessNotificationItem[]> {
  const res = await apiClient.get<BusinessNotificationItem[]>("/business/notifications/");
  return Array.isArray(res.data) ? res.data : [];
}

export async function markBusinessNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/business/notifications/${id}/read/`);
}
