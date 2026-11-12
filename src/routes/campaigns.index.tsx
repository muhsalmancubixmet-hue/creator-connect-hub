import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ImagePlus, Plus, Upload, Users, Sparkles, MessageSquare } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { CampaignStatusBadge } from "@/components/business/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CAMPAIGN_STATUSES, formatMoney } from "@/data/mock";
import {
  getBusinessCampaigns,
  getBusinessInquiries,
  createBusinessCampaign,
  getTaxonomyCategories,
  getTaxonomyLocations,
  uploadBusinessMedia,
  type CampaignData,
  type BusinessInquiryItem,
} from "@/lib/business-api";

export const Route = createFileRoute("/campaigns/")({
  head: () => ({
    meta: [
      { title: "Campaigns — Influencers.com Business" },
      {
        name: "description",
        content:
          "Manage influencer campaigns and direct creator collaborations from brief to completion.",
      },
      { property: "og:title", content: "Campaigns — Influencers.com Business" },
      { property: "og:description", content: "Your influencer campaign workspace." },
    ],
  }),
  component: Campaigns,
});

function Campaigns() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // New campaign modal form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Fashion");
  const [newBudget, setNewBudget] = useState(50000);
  const [newBrief, setNewBrief] = useState("");
  const [newLocation, setNewLocation] = useState("Kochi, Kerala");
  const [newCreatorsNeeded, setNewCreatorsNeeded] = useState(3);
  const [newCoverImage, setNewCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadBusinessMedia(file, "COVER");
      setNewCoverImage(res.url);
      toast.success("Campaign cover image uploaded!");
    } catch (err: any) {
      toast.error("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const { data: apiCampaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["business-campaigns"],
    queryFn: () => getBusinessCampaigns(),
  });

  const { data: inquiries = [], isLoading: loadingInquiries } = useQuery({
    queryKey: ["business-inquiries"],
    queryFn: () => getBusinessInquiries(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["taxonomy-categories"],
    queryFn: getTaxonomyCategories,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["taxonomy-locations"],
    queryFn: () => getTaxonomyLocations(),
  });

  // Synthesize formal campaigns and direct creator engagements into a unified roster
  const campaignCards = [
    ...apiCampaigns.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category || c.category_name || "Campaign",
      status: c.status || "Published",
      budget: (c.total_budget_cents || 0) / 100,
      brief: c.objective || c.brief || "Brand collaboration campaign.",
      creatorCount: c.creators_needed || 1,
      coverImageUrl: c.cover_image_url || "",
      progress: 35,
      dateText: "Active",
      isDirectCollab: false,
    })),
    ...inquiries.map((inq) => {
      // Map inquiry status to campaign status tabs
      let mappedStatus = "Applications";
      if (inq.status === "ACCEPTED") mappedStatus = "Accepted";
      else if (inq.status === "DECLINED") mappedStatus = "Cancelled";
      else if (inq.status === "NEGOTIATING") mappedStatus = "In Progress";
      else if (inq.status === "NEW") mappedStatus = "Invited";

      return {
        id: inq.id,
        title: inq.campaign || inq.subject || "Creator Collaboration",
        category: `Direct Partner · @${inq.creator_handle}`,
        status: mappedStatus,
        budget: inq.budget_cents ? inq.budget_cents / 100 : 0,
        brief: inq.message || `Direct partnership with ${inq.creator_name}`,
        creatorCount: 1,
        progress: inq.status === "ACCEPTED" ? 50 : 20,
        dateText: inq.date || "Recent",
        isDirectCollab: true,
        creatorName: inq.creator_name,
        creatorAvatar: inq.creator_avatar,
      };
    }),
  ];

  const list =
    filter === "All"
      ? campaignCards
      : campaignCards.filter((c) => c.status.toLowerCase() === filter.toLowerCase());

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a campaign title.");
      return;
    }

    setCreating(true);
    try {
      await createBusinessCampaign({
        title: newTitle.trim(),
        category: newCategory,
        budget: newBudget,
        currency: "INR",
        brief: newBrief.trim(),
        location_text: newLocation.trim(),
        creators_needed: newCreatorsNeeded,
        cover_image_url: newCoverImage.trim() || undefined,
      });

      toast.success("Campaign created successfully!");
      setDialogOpen(false);
      setNewTitle("");
      setNewBrief("");
      setNewCoverImage("");
      queryClient.invalidateQueries({ queryKey: ["business-campaigns"] });
    } catch (err: any) {
      toast.error("Failed to create campaign: " + (err.response?.data?.detail || err.message));
    } finally {
      setCreating(false);
    }
  };

  const isLoading = loadingCampaigns && loadingInquiries;

  return (
    <AppShell>
      <PageHeader
        title="Campaigns"
        subtitle="Every collaboration, from brief to final report."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="size-4" /> Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleCreateCampaign}>
                <DialogHeader>
                  <DialogTitle>Launch New Campaign</DialogTitle>
                  <DialogDescription>
                    Create a marketing campaign to hire and coordinate creators.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="campTitle" className="text-xs font-medium">
                      Campaign Title
                    </Label>
                    <Input
                      id="campTitle"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Monsoon Flavours Promotion"
                      className="mt-1 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="campCat" className="text-xs font-medium">
                        Category Vertical
                      </Label>
                      <Input
                        id="campCat"
                        list="camp-cat-list"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Food, Travel, Fashion"
                        className="mt-1 rounded-xl"
                      />
                      <datalist id="camp-cat-list">
                        {categories.map((c) => (
                          <option key={c.id || c.name} value={c.name} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <Label htmlFor="campBudget" className="text-xs font-medium">
                        Budget (₹)
                      </Label>
                      <Input
                        id="campBudget"
                        type="number"
                        min={1000}
                        value={newBudget}
                        onChange={(e) => setNewBudget(Number(e.target.value))}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="campLoc" className="text-xs font-medium">
                        Location Scope
                      </Label>
                      <Input
                        id="campLoc"
                        list="camp-loc-list"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g. Ernakulam, Wayanad"
                        className="mt-1 rounded-xl"
                      />
                      <datalist id="camp-loc-list">
                        {locations.map((loc, i) => (
                          <option key={`${loc.name}-${i}`} value={loc.name}>
                            {loc.full_path || loc.name}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <Label htmlFor="campSlots" className="text-xs font-medium">
                        Creator Slots
                      </Label>
                      <Input
                        id="campSlots"
                        type="number"
                        min={1}
                        value={newCreatorsNeeded}
                        onChange={(e) => setNewCreatorsNeeded(Number(e.target.value))}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="campBrief" className="text-xs font-medium">
                      Creative Brief & Objective
                    </Label>
                    <Textarea
                      id="campBrief"
                      rows={3}
                      value={newBrief}
                      onChange={(e) => setNewBrief(e.target.value)}
                      placeholder="Deliverables, target audience and campaign goals..."
                      className="mt-1 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Campaign Cover Banner</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Input
                        value={newCoverImage}
                        onChange={(e) => setNewCoverImage(e.target.value)}
                        placeholder="https://... or upload image file"
                        className="rounded-xl text-xs flex-1"
                      />
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleUploadCoverFile}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingCover}
                        onClick={() => coverInputRef.current?.click()}
                        className="rounded-xl shrink-0"
                      >
                        <Upload className="size-3.5 mr-1.5" />
                        {uploadingCover ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                    {newCoverImage && (
                      <div className="mt-2 relative h-24 w-full overflow-hidden rounded-xl border bg-muted">
                        <img src={newCoverImage} alt="Cover preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="rounded-xl">
                    {creating ? "Launching..." : "Launch Campaign"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["All", ...CAMPAIGN_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center">
            <Sparkles className="mx-auto size-8 text-muted-foreground/40" />
            <h3 className="mt-3 font-display text-base font-semibold">No engagements in "{filter}"</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Launch a new campaign or reach out to creators directly to start active collaborations.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button size="sm" onClick={() => setDialogOpen(true)} className="rounded-xl text-xs">
                <Plus className="size-3.5" /> Launch Campaign
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                <Link to="/discover">Discover Creators</Link>
              </Button>
            </div>
          </div>
        ) : (
          list.map((c: any) => {
            const title = c.title || c.name;
            const category = c.category || c.category_name || "General";
            const budget = c.budget ?? ((c.total_budget_cents || 0) / 100);
            const brief = c.brief || c.objective || "Brand collaboration campaign.";
            const creatorCount = c.creatorCount || 1;
            const progress = c.progress ?? 35;
            const dateText = c.dateText || "Active";

            const cardContent = (
              <>
                {c.coverImageUrl && (
                  <div className="relative -mx-5 -mt-5 mb-4 h-36 overflow-hidden rounded-t-2xl bg-muted">
                    <img
                      src={c.coverImageUrl}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-semibold">{title}</h3>
                    <Badge variant="secondary" className="mt-1.5 rounded-full font-normal">
                      {category}
                    </Badge>
                  </div>
                  <CampaignStatusBadge status={c.status} />
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{brief}</p>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-display font-semibold">{formatMoney(budget, "INR")}</span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4" /> {creatorCount} {creatorCount === 1 ? "creator" : "creators"}
                  </span>
                </div>

                <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" /> {dateText}
                </p>

                <div className="mt-3">
                  <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                    <span>Production Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              </>
            );

            if (c.isDirectCollab) {
              return (
                <Link
                  key={c.id}
                  to="/messages"
                  className="card-elevated hover-lift flex flex-col p-5 border-l-4 border-l-emerald-500"
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <Link
                key={c.id}
                to="/campaigns/$campaignId"
                params={{ campaignId: c.id }}
                className="card-elevated hover-lift flex flex-col p-5"
              >
                {cardContent}
              </Link>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
