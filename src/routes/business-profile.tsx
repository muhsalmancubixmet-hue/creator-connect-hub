import { createFileRoute } from "@tanstack/react-router";
import { Building2, Globe, Mail, MapPin, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currentBusiness } from "@/data/mock";
import { useAuth } from "@/lib/auth-context";
import { updateBusinessProfile } from "@/lib/business-api";

export const Route = createFileRoute("/business-profile")({
  head: () => ({
    meta: [
      { title: "Business Profile — Influencers.com Business" },
      {
        name: "description",
        content:
          "Manage the business profile creators see: logo, description, categories, contact and social accounts.",
      },
      { property: "og:title", content: "Business Profile — Influencers.com Business" },
      { property: "og:description", content: "The profile creators see when you reach out." },
    ],
  }),
  component: BusinessProfile,
});

function BusinessProfile() {
  const { business, refreshProfile } = useAuth();
  const [form, setForm] = useState({ ...currentBusiness });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business) {
      setForm((prev) => ({
        ...prev,
        name: business.company_name || prev.name,
        type: business.business_type || prev.type,
        description: business.about || prev.description,
        email: business.contact_email || prev.email,
        phone: business.contact_phone || prev.phone,
        contactPerson: business.contact_name || prev.contactPerson,
        logo: business.logo_url || prev.logo,
        location: business.hq_location?.name || prev.location,
      }));
    }
  }, [business]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusinessProfile({
        company_name: form.name,
        business_type: form.type,
        about: form.description,
        contact_name: form.contactPerson,
        contact_email: form.email,
        contact_phone: form.phone,
      });
      await refreshProfile();
      toast.success("Business profile updated successfully!");
    } catch (e: any) {
      toast.error("Failed to update profile: " + (e.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Business Profile"
        subtitle="This is what creators see when you contact them."
        actions={
          <Button disabled={saving} className="rounded-xl" onClick={handleSave}>
            <Save className="size-4" /> {saving ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card-elevated p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-4">
              <img
                src={form.logo}
                alt=""
                className="size-20 rounded-2xl object-cover shadow-soft"
              />
              <Button variant="outline" className="rounded-xl" onClick={() => toast("Upload logo")}>
                Change logo
              </Button>
            </div>
            <div>
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="type">Business type</Label>
              <Input
                id="type"
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="about">Description</Label>
              <Textarea
                id="about"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="web">Website</Label>
              <Input
                id="web"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="loc">Location</Label>
              <Input
                id="loc"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="contact">Contact person</Label>
              <Input
                id="contact"
                value={form.contactPerson}
                onChange={(e) => set("contactPerson", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Categories</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.categories.map((c) => (
                  <Badge key={c} className="rounded-full bg-primary/10 text-primary">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Social accounts</Label>
              <div className="mt-2 space-y-2">
                {form.socials.map((s) => (
                  <div
                    key={s.platform}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium">{s.platform}</span>
                    <span className="text-muted-foreground">{s.handle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card-elevated overflow-hidden">
          <div className="border-b border-border px-5 py-3 text-sm font-medium text-muted-foreground">
            Public business profile preview
          </div>
          <div className="gradient-hero p-6">
            <img
              src={form.logo}
              alt=""
              className="size-16 rounded-2xl border-4 border-card object-cover shadow-soft"
            />
            <h2 className="mt-3 font-display text-xl font-semibold">{form.name}</h2>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="size-4" /> {form.type}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{form.description}</p>
            <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" /> {form.location}
              </div>
              <div className="flex flex-wrap gap-1.5 pl-6">
                {form.operatingLocations.map((l) => (
                  <span key={l.label} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                    {l.label} · {l.radiusKm} km
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-4" /> {form.website}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4" /> {form.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4" /> {form.phone}
              </div>
            </dl>
            <Button className="mt-5 w-full rounded-xl" onClick={() => toast("Preview only")}>
              Contact this business
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
