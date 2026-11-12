import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, LogOut, Save, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { getBusinessProfile, updateBusinessProfile } from "@/lib/business-api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — Influencers.com Business" },
      {
        name: "description",
        content: "Manage your account details, team access, notification preferences and billing.",
      },
      { property: "og:title", content: "Account Settings — Influencers.com Business" },
      { property: "og:description", content: "Account, team and notification preferences." },
    ],
  }),
  component: Settings,
});

const defaultNotificationItems = [
  { key: "applications", label: "New creator applications", defaultVal: true },
  { key: "messages", label: "Creator messages", defaultVal: true },
  { key: "content_approval", label: "Content submitted for approval", defaultVal: true },
  { key: "deadlines", label: "Campaign deadlines", defaultVal: true },
  { key: "saved_searches", label: "New matching creators from saved searches", defaultVal: true },
  { key: "product_tips", label: "Product updates and tips", defaultVal: false },
] as const;

function Settings() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { business, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["business-profile"],
    queryFn: getBusinessProfile,
  });

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    applications: true,
    messages: true,
    content_approval: true,
    deadlines: true,
    saved_searches: true,
    product_tips: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (profile) {
      setContactName(profile.contact_name || business?.contact_name || "");
      setContactEmail(profile.contact_email || business?.contact_email || "");
      setContactPhone(profile.contact_phone || business?.contact_phone || "");
      setCompanyName(profile.company_name || business?.company_name || "");
      if (profile.notification_preferences && typeof profile.notification_preferences === "object") {
        setPrefs((prev) => ({ ...prev, ...profile.notification_preferences }));
      }
    } else if (business) {
      setContactName(business.contact_name || "");
      setContactEmail(business.contact_email || "");
      setContactPhone(business.contact_phone || "");
      setCompanyName(business.company_name || "");
    }
  }, [profile, business]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await updateBusinessProfile({
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        company_name: companyName.trim(),
        notification_preferences: prefs,
      });
    },
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["business-profile"] });
      queryClient.invalidateQueries({ queryKey: ["business-self-profile"] });
    },
    onError: (err: any) => {
      toast.error("Failed to save settings: " + (err.response?.data?.detail || err.message));
    },
  });

  const handleTogglePref = (key: string, val: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: val }));
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  return (
    <AppShell>
      <PageHeader
        title="Account Settings"
        subtitle="Account details, team and notification preferences."
        actions={
          <Button
            className="rounded-xl"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            <Save className="size-4" /> {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-6">
          <h2 className="font-display text-base font-semibold">Account Profile</h2>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company / Brand Name</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="person">Contact person</Label>
              <Input
                id="person"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input
                id="phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <h2 className="font-display text-base font-semibold">Notifications</h2>
          <Separator className="my-4" />
          <div className="space-y-4">
            {defaultNotificationItems.map(({ key, label, defaultVal }) => {
              const checked = prefs[key] !== undefined ? prefs[key] : defaultVal;
              return (
                <div key={key} className="flex items-center justify-between gap-4">
                  <Label htmlFor={`pref-${key}`} className="text-sm font-normal text-muted-foreground cursor-pointer">
                    {label}
                  </Label>
                  {mounted ? (
                    <Switch
                      id={`pref-${key}`}
                      checked={checked}
                      onCheckedChange={(val) => handleTogglePref(key, val)}
                    />
                  ) : (
                    <div className="h-5 w-9 rounded-full bg-input" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-elevated p-6">
          <h2 className="font-display text-base font-semibold">Team & Organization</h2>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Current subscription tier:{" "}
            <span className="font-semibold text-foreground">
              {profile?.verification_status === "VERIFIED" ? "Verified Business Workspace" : "Standard Brand Account"}
            </span>
          </p>
          <div className="mt-4 space-y-2">
            {[
              [contactName || business?.contact_name || "Workspace Admin", "Owner (Primary)"],
              ["Kalyan Marketing Team", "Campaign Manager"],
              ["Operations Desk", "Content Reviewer"],
            ].map(([n, role], i) => (
              <div
                key={`${n}-${i}`}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm"
              >
                <span className="font-medium">{n}</span>
                <span className="text-muted-foreground text-xs">{role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated p-6">
          <h2 className="font-display text-base font-semibold">Plan & Session</h2>
          <Separator className="my-4" />
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/subscription">
                <CreditCard className="size-4" /> Manage subscription
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/business-profile">
                <ShieldCheck className="size-4" /> View Public Profile
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="size-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
