import { apiClient } from "@/lib/api-client";

export interface PlanItem {
  id: string;
  name: string;
  audience: string;
  price_cents: number;
  currency: string;
  interval: string;
  features_list: string[];
  is_active: boolean;
}

export interface CheckoutOrderResponse {
  order_id: string;
  amount_cents: number;
  currency: string;
  key_id: string;
  plan_id: string;
  plan_name: string;
  payment_id: string;
}

export interface CheckoutVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan_id: string;
}

export interface UserSubscriptionResponse {
  id?: string;
  plan?: PlanItem | null;
  plan_name?: string;
  status: string;
  start_date?: string;
  current_period_end?: string;
}

export const billingApi = {
  async getPlans(audience = "BUSINESS"): Promise<PlanItem[]> {
    const res = await apiClient.get<PlanItem[]>("/billing/plans/", {
      params: { audience },
    });
    return res.data;
  },

  async getCurrentSubscription(): Promise<UserSubscriptionResponse> {
    const res = await apiClient.get<UserSubscriptionResponse>("/billing/subscription/");
    return res.data;
  },

  async createCheckoutOrder(planId: string): Promise<CheckoutOrderResponse> {
    const res = await apiClient.post<CheckoutOrderResponse>("/billing/checkout/order/", {
      plan_id: planId,
    });
    return res.data;
  },

  async verifyPayment(payload: CheckoutVerifyPayload): Promise<{
    status: string;
    subscription_id: string;
    plan_name: string;
    current_period_end: string;
  }> {
    const res = await apiClient.post("/billing/checkout/verify/", payload);
    return res.data;
  },

  async sendReceipt(): Promise<{
    detail: string;
    email: string;
    payment_id: string;
  }> {
    const res = await apiClient.post<{
      detail: string;
      email: string;
      payment_id: string;
    }>("/billing/subscription/send-receipt/", {});
    return res.data;
  },
};

