import React, { useState, useEffect } from "react";
import { Send, DollarSign, Briefcase, Mail, Building, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { submitCollaborationInquiry } from "@/lib/business-api";
import type { Creator } from "@/data/mock";

interface CollaborationDialogProps {
  creator: Creator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: { id?: string; name: string; price?: number; turnaround?: string } | null;
}

export function CollaborationDialog({
  creator,
  open,
  onOpenChange,
  service,
}: CollaborationDialogProps) {
  const { business } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState<number>(20000);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const storedEmail =
        typeof window !== "undefined" ? localStorage.getItem("business_email") || "" : "";
      const defaultCompany = business?.company_name || "Nila Foods";
      const defaultContact = business?.contact_name || "Brand Manager";
      const defaultEmail = business?.contact_email || storedEmail || "contact@nilafoods.com";

      setCompanyName(defaultCompany);
      setClientName(defaultContact);
      setClientEmail(defaultEmail);

      if (service) {
        setSubject(`Service Booking: ${service.name}`);
        setMessage(
          `Hi ${creator.name},\n\nWe would like to book your "${service.name}" package for our upcoming brand initiative. Please review and confirm your availability.\n\nBest regards,\n${defaultCompany}`,
        );
        if (service.price && service.price > 0) {
          setBudget(service.price);
        }
      } else {
        setSubject(`Brand Collaboration Proposal - ${defaultCompany}`);
        setMessage(
          `Hi ${creator.name},\n\nWe love your content and believe your audience aligns perfectly with our brand. We would like to discuss a sponsored collaboration featuring our products.\n\nKey Deliverables:\n• 1 Instagram Reel\n• 2 Stories with link stickers\n\nLooking forward to working together!\n\nBest regards,\n${defaultCompany}`,
        );
      }
    }
  }, [open, service, business, creator.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCollaborationInquiry({
        creator_handle: creator.handle.replace(/^@/, ""),
        client_name: clientName.trim() || companyName.trim() || "Brand Partner",
        client_email: clientEmail.trim(),
        company_name: companyName.trim() || "Brand Partner",
        subject: subject.trim(),
        message: message.trim(),
        budget: Number(budget) || 0,
        currency: creator.currency || "INR",
        ...(service?.id ? { service_id: service.id } : {}),
      });

      toast.success(
        res?.detail ||
          `Collaboration proposal sent to ${creator.name}! They can review it immediately in Creator Hub.`,
      );
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to dispatch collaboration inquiry:", err);
      const detail =
        err?.response?.data?.detail || "Failed to submit collaboration request. Please try again.";
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6 sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="size-11 rounded-full border border-border object-cover"
            />
            <div>
              <DialogTitle className="font-display text-lg font-bold">
                Request Collaboration with {creator.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {creator.handle} · {creator.location}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                <Building className="mr-1 inline size-3.5" /> Company / Brand Name
              </Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Nila Foods"
                className="mt-1 h-9 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                <Mail className="mr-1 inline size-3.5" /> Contact Email
              </Label>
              <Input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="contact@brand.com"
                className="mt-1 h-9 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground">
              <Briefcase className="mr-1 inline size-3.5" /> Campaign / Project Subject
            </Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. New Product Launch Showcase"
              className="mt-1 h-9 rounded-xl text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                <DollarSign className="mr-1 inline size-3.5" /> Proposed Budget (
                {creator.currency || "INR"})
              </Label>
              <Input
                type="number"
                min="0"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-1 h-9 rounded-xl text-sm font-semibold"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground">
                Your Contact Name
              </Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Marketing Lead"
                className="mt-1 h-9 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground">
              Collaboration Brief & Deliverables
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe deliverables, guidelines, target timeline, etc."
              rows={4}
              className="mt-1 rounded-xl text-sm leading-relaxed"
              required
            />
          </div>

          <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-xs"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl text-xs font-medium" disabled={submitting}>
              <Send className="mr-1.5 size-3.5" />
              {submitting ? "Dispatching..." : "Send Proposal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
