import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { currentBusiness, formatMoney, plans } from "@/data/mock";
import { billingApi, type PlanItem } from "@/lib/billing-api";
import { loadRazorpayScript } from "@/lib/razorpay";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription — Influencers.com Business" },
      {
        name: "description",
        content:
          "Compare the Free, Business Pro and Agency plans for influencer discovery and campaign management.",
      },
      { property: "og:title", content: "Subscription — Influencers.com Business" },
      { property: "og:description", content: "Plans for brands and agencies." },
    ],
  }),
  component: Subscription,
});

function Subscription() {
  const { business } = useAuth();
  const [activePlan, setActivePlan] = useState<string>(business?.subscription_plan || "Free");
  const [renewDate, setRenewDate] = useState<string>("renews 28 Oct 2026");
  const [backendPlans, setBackendPlans] = useState<PlanItem[]>([]);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [sendingReceipt, setSendingReceipt] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadBillingData = async () => {
      try {
        const [plansRes, subRes] = await Promise.allSettled([
          billingApi.getPlans("BUSINESS"),
          billingApi.getCurrentSubscription(),
        ]);

        if (!mounted) return;

        if (plansRes.status === "fulfilled" && Array.isArray(plansRes.value)) {
          setBackendPlans(plansRes.value);
        }

        if (subRes.status === "fulfilled" && subRes.value?.status === "ACTIVE" && subRes.value.plan?.name) {
          setActivePlan(subRes.value.plan.name);
          if (subRes.value.current_period_end) {
            const d = new Date(subRes.value.current_period_end);
            setRenewDate(`renews ${d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`);
          }
        }
      } catch (err) {
        console.warn("Could not load billing data:", err);
      }
    };
    void loadBillingData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpgrade = async (p: (typeof plans)[0]) => {
    if (p.name === activePlan) return;

    if (p.price === 0) {
      toast.info("Free plan is already standard. Downgrades are handled at period end.");
      return;
    }

    const matched = backendPlans.find(
      (bp) => bp.name.toLowerCase() === p.name.toLowerCase()
    );

    if (!matched) {
      toast.error("Selected plan is currently unavailable on server.");
      return;
    }

    try {
      setLoadingPlan(p.name);
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        toast.error("Failed to load Razorpay payment gateway SDK.");
        return;
      }

      const order = await billingApi.createCheckoutOrder(matched.id);

      const options = {
        key: order.key_id,
        amount: order.amount_cents,
        currency: order.currency,
        name: "Influencers.com",
        description: `${matched.name} Subscription`,
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await billingApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: matched.id,
            });

            setActivePlan(matched.name);
            if (verifyRes.current_period_end) {
              const d = new Date(verifyRes.current_period_end);
              setRenewDate(
                `renews ${d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`
              );
            }
            toast.success("Payment Successful!", {
              description: `You are now subscribed to ${matched.name}.`,
            });
          } catch (err: any) {
            const msg =
              err?.response?.data?.detail || "Payment verification failed on server.";
            toast.error("Verification Error", { description: msg });
          }
        },
        prefill: {
          name: business?.contact_name || business?.company_name || currentBusiness.name,
          email: business?.contact_email || currentBusiness.email,
          contact: business?.contact_phone || currentBusiness.phone,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err.message || "Could not initiate checkout.";
      toast.error("Checkout Failed", { description: msg });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSendReceipt = async () => {
    setSendingReceipt(true);
    try {
      const res = await billingApi.sendReceipt();
      toast.success("Tax Invoice Dispatched", {
        description: res.detail || `Official receipt emailed to ${res.email}`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Could not dispatch invoice receipt.";
      toast.error("Billing Notice", { description: msg });
    } finally {
      setSendingReceipt(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Subscription"
        subtitle={`You're on ${activePlan}. Upgrade any time.`}
      />

      <div className="card-elevated mb-8 flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <p className="inline-flex items-center gap-2 font-display text-base font-semibold">
            <Sparkles className="size-4 text-primary" /> {activePlan} · {renewDate}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">352 of 500 inquiries used this month</p>
          <Progress value={70} className="mt-3 h-1.5 max-w-md" />
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          disabled={sendingReceipt}
          onClick={handleSendReceipt}
        >
          {sendingReceipt ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Emailing Invoice...
            </span>
          ) : (
            "Manage billing"
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.name === activePlan;
          const isLoading = loadingPlan === p.name;
          const matchedBackend = backendPlans.find(
            (bp) => bp.name.toLowerCase() === p.name.toLowerCase()
          );
          const displayPrice = matchedBackend ? matchedBackend.price_cents / 100 : p.price;
          const displayCurrency = (matchedBackend?.currency as any) || p.currency || "INR";
          return (
            <div
              key={p.name}
              className={cn(
                "card-elevated relative flex flex-col p-6",
                p.highlighted && "border-primary shadow-lift",
              )}
            >
              {p.highlighted && (
                <Badge className="absolute -top-3 left-6 rounded-full gradient-primary text-primary-foreground">
                  Most popular
                </Badge>
              )}
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-5 font-display text-3xl font-semibold">
                {formatMoney(displayPrice, displayCurrency)}
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">{p.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full rounded-xl"
                variant={p.highlighted ? "default" : "outline"}
                disabled={isCurrent || isLoading}
                onClick={() => void handleUpgrade(p)}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" /> Processing...
                  </span>
                ) : isCurrent ? (
                  "Current plan"
                ) : (
                  p.cta
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 inline-flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground w-full">
        <ShieldCheck className="size-4 text-primary" /> Secured by Razorpay. Test mode active.
      </p>
    </AppShell>
  );
}
