import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  ImagePlus,
  MessageSquare,
  Paperclip,
  Pencil,
  RefreshCcw,
  Send,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { CampaignStatusBadge } from "@/components/business/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  campaignById,
  conversations,
  creatorById,
  currentBusiness,
  formatFollowers,
  formatMoney,
  submissions,
  type CampaignCreator,
  type CampaignStatus,
} from "@/data/mock";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBusinessCampaignDetail,
  getBusinessCampaignApplications,
  updateBusinessCampaignApplication,
  updateBusinessCampaign,
  uploadBusinessMedia,
  type CampaignApplicationBid,
} from "@/lib/business-api";

export const Route = createFileRoute("/campaigns/$campaignId")({
  loader: async ({ params }) => {
    try {
      const data = await getBusinessCampaignDetail(params.campaignId);
      if (data && data.id) {
        return {
          campaign: {
            id: data.id,
            name: data.title,
            category: data.category_name || "General",
            status: (data.status as any) || "In Progress",
            budget: (data.total_budget_cents || 0) / 100,
            spent: 0,
            startDate: data.created_at ? data.created_at.split("T")[0] : "2026-11-01",
            endDate: data.deadline ? data.deadline.split("T")[0] : "2026-11-30",
            brief: data.brief || data.objective || "Brand collaboration brief.",
            deliverablesSpec: data.deliverables_spec || "",
            locationText: data.location_text || data.location || "Kerala, India",
            coverImageUrl: data.cover_image_url || "",
            creatorCount: data.creators_needed || 1,
            invitedCount: 0,
            appliedCount: data.applications_count || 0,
            acceptedCount: 0,
            progress: 35,
            creatorIds: [] as string[],
            deliverables: [] as any[],
            creators: [] as CampaignCreator[],
            weekly: [
              { week: "W1", reach: 12000, engagement: 850 },
              { week: "W2", reach: 24000, engagement: 1900 },
              { week: "W3", reach: 38000, engagement: 2800 },
              { week: "W4", reach: 52000, engagement: 4100 },
            ],
            metrics: { reach: 0, impressions: 0, engagements: 0, clicks: 0, cpe: 0 },
            kpis: { views: 0, engagement: 0, clicks: 0, conversions: 0 },
          },
        };
      }
    } catch {
      // Fallback to mock if valid
    }
    const campaign = campaignById(params.campaignId);
    if (!campaign) throw notFound();
    return { campaign };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Campaign not found" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.campaign;
    return {
      meta: [
        { title: `${c.name} — Campaign workspace` },
        { name: "description", content: c.brief },
        { property: "og:title", content: `${c.name} — Campaign workspace` },
        { property: "og:description", content: c.brief },
      ],
    };
  },
  component: CampaignDetail,
});

function ContentReviewCard({ id }: { id: string }) {
  const s = submissions.find((x) => x.id === id)!;
  const creator = creatorById(s.creatorId);
  const [comment, setComment] = useState("");
  return (
    <div className="card-elevated overflow-hidden">
      <div className="relative aspect-[4/3]">
        <img src={s.preview} alt="" className="size-full object-cover" />
        <Badge className="absolute left-3 top-3 rounded-full bg-card/90 text-foreground backdrop-blur">
          {s.type}
        </Badge>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2.5">
          {creator && (
            <img src={creator.avatar} alt="" className="size-8 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{creator?.name}</p>
            <p className="text-xs text-muted-foreground">Submitted {s.submitted}</p>
          </div>
          <Badge
            variant="secondary"
            className="ml-auto shrink-0 rounded-full text-[11px] font-normal"
          >
            {s.status}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{s.caption}</p>
        <Textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment for revision requests…"
          className="mt-3 rounded-xl"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            className="rounded-xl"
            onClick={() => toast.success(`Approved ${creator?.name}'s ${s.type.toLowerCase()}`)}
          >
            <Check className="size-4" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={() => toast("Change request sent")}
          >
            <RefreshCcw className="size-4" /> Request Changes
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-xl text-destructive hover:text-destructive"
            onClick={() => toast("Submission rejected")}
          >
            <X className="size-4" /> Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

function CampaignDetail() {
  const { campaign: initialCampaign } = Route.useLoaderData();
  const [c, setC] = useState<any>(initialCampaign);
  const router = useRouter();
  const queryClient = useQueryClient();
  const subs = submissions.filter((s) => s.campaignId === c.id);
  const convos = conversations.filter((cv) => cv.campaign === c.name);
  const [draft, setDraft] = useState("");

  // Edit campaign dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(c.name || "");
  const [editBrief, setEditBrief] = useState(c.brief || "");
  const [editDeliverables, setEditDeliverables] = useState(c.deliverablesSpec || "");
  const [editBudget, setEditBudget] = useState(c.budget || 0);
  const [editCreatorsNeeded, setEditCreatorsNeeded] = useState(c.creatorCount || 1);
  const [editLocation, setEditLocation] = useState(c.locationText || "Kerala, India");
  const [editDeadline, setEditDeadline] = useState(c.endDate || "");
  const [editCoverImage, setEditCoverImage] = useState(c.coverImageUrl || "");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const openEditDialog = () => {
    setEditTitle(c.name || "");
    setEditBrief(c.brief || "");
    setEditDeliverables(c.deliverablesSpec || "");
    setEditBudget(c.budget || 0);
    setEditCreatorsNeeded(c.creatorCount || 1);
    setEditLocation(c.locationText || "Kerala, India");
    setEditDeadline(c.endDate || "");
    setEditCoverImage(c.coverImageUrl || "");
    setEditOpen(true);
  };

  const handleUploadEditCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadBusinessMedia(file, "COVER");
      setEditCoverImage(res.url);
      toast.success("New cover banner uploaded!");
    } catch (err: any) {
      toast.error("Failed to upload image: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error("Campaign title is required.");
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await updateBusinessCampaign(c.id, {
        title: editTitle.trim(),
        brief: editBrief.trim(),
        deliverables_spec: editDeliverables.trim(),
        budget: Number(editBudget) || 0,
        creators_needed: Number(editCreatorsNeeded) || 1,
        location_text: editLocation.trim(),
        deadline: editDeadline || null,
        cover_image_url: editCoverImage.trim(),
      });
      setC((prev: any) => ({
        ...prev,
        name: updated.title || editTitle.trim(),
        brief: updated.objective || editBrief.trim(),
        deliverablesSpec: updated.deliverables_spec || editDeliverables.trim(),
        budget: (updated.total_budget_cents || 0) / 100,
        creatorCount: updated.creators_needed || Number(editCreatorsNeeded),
        locationText: updated.location_text || editLocation.trim(),
        endDate: updated.deadline ? updated.deadline.split("T")[0] : editDeadline,
        coverImageUrl: updated.cover_image_url ?? editCoverImage.trim(),
      }));
      queryClient.invalidateQueries({ queryKey: ["business-campaigns"] });
      void router.invalidate();
      toast.success("Campaign updated successfully!");
      setEditOpen(false);
    } catch (err: any) {
      toast.error("Update failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setSavingEdit(false);
    }
  };

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ["campaign-applications", c.id],
    queryFn: () => getBusinessCampaignApplications(c.id),
    refetchInterval: 5000,
  });

  const updateBidMutation = useMutation({
    mutationFn: ({ bidId, status }: { bidId: string; status: 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' }) =>
      updateBusinessCampaignApplication(c.id, bidId, status),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-applications", c.id] });
      queryClient.invalidateQueries({ queryKey: ["business-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["business-inquiries"] });
      if (vars.status === 'ACCEPTED') {
        toast.success("Application accepted! Direct collaboration workspace initialized.");
      } else if (vars.status === 'SHORTLISTED') {
        toast.info("Creator bid added to shortlist.");
      } else {
        toast.warning("Application declined.");
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to update application status.");
    },
  });

  return (
    <AppShell>
      <PageHeader
        title={c.name}
        subtitle={`${currentBusiness.name} · ${c.category}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/campaigns">All campaigns</Link>
            </Button>
            <Button className="rounded-xl" onClick={openEditDialog}>
              <Pencil className="size-3.5 mr-1.5" /> Edit campaign
            </Button>
          </>
        }
      />

      {/* Campaign Cover Banner */}
      <div className="mb-6 relative overflow-hidden rounded-2xl border bg-muted h-44 sm:h-56">
        {c.coverImageUrl ? (
          <img src={c.coverImageUrl} alt={c.name} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-primary/10 via-muted to-secondary/30 text-muted-foreground">
            <div className="text-center">
              <ImagePlus className="mx-auto size-8 opacity-40" />
              <p className="mt-2 text-xs font-medium">No campaign cover banner set</p>
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
          <div className="text-white">
            <p className="text-xs font-medium opacity-90">{c.locationText || "Kerala, India"}</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-xl h-8 text-xs font-medium"
            onClick={openEditDialog}
          >
            <Upload className="size-3.5 mr-1.5" /> Change cover image
          </Button>
        </div>
      </div>

      {/* Edit Campaign Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveCampaign}>
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>
                Update your campaign cover banner, budget, deliverables, or brief details.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-xs font-medium">Campaign Title</Label>
                <Input
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Cover Banner Image</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    placeholder="https://... or upload image"
                    className="rounded-xl text-xs flex-1"
                  />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleUploadEditCover}
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
                    {uploadingCover ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>
                {editCoverImage && (
                  <div className="mt-2 relative h-28 w-full overflow-hidden rounded-xl border bg-muted">
                    <img src={editCoverImage} alt="Preview" className="size-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Budget (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Creator Slots</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editCreatorsNeeded}
                    onChange={(e) => setEditCreatorsNeeded(Number(e.target.value))}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Location</Label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Deadline</Label>
                  <Input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Deliverables</Label>
                <Input
                  value={editDeliverables}
                  onChange={(e) => setEditDeliverables(e.target.value)}
                  placeholder="e.g. 2 Reels + 3 Stories"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Creative Brief & Objective</Label>
                <Textarea
                  rows={3}
                  value={editBrief}
                  onChange={(e) => setEditBrief(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit} className="rounded-xl">
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="card-elevated grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <div className="mt-1.5">
            <CampaignStatusBadge status={c.status} />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
          <p className="mt-1 font-display text-lg font-semibold">{formatMoney(c.budget)}</p>
          <p className="text-xs text-muted-foreground">{formatMoney(c.spent)} committed</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Dates</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" /> {c.startDate} → {c.endDate}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Progress</p>
          <Progress value={c.progress} className="mt-3 h-1.5" />
          <p className="mt-1 text-xs text-muted-foreground">{c.progress}% complete</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="h-11 overflow-x-auto rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="creators" className="rounded-lg">
            Creators
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="rounded-lg">
            Deliverables
          </TabsTrigger>
          <TabsTrigger value="content" className="rounded-lg">
            Content approval
          </TabsTrigger>
          <TabsTrigger value="messages" className="rounded-lg">
            Messages
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="card-elevated p-6">
              <h3 className="font-display text-base font-semibold">Campaign brief</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.brief}</p>
              <h3 className="mt-6 font-display text-base font-semibold">Deliverables summary</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {c.deliverables.length ? (
                  c.deliverables.map((d) => (
                    <li key={d.id} className="flex items-center justify-between">
                      <span>
                        {creatorById(d.creatorId)?.name} · {d.type}
                      </span>
                      <span>
                        {d.submitted}/{d.required} · {d.approval}
                      </span>
                    </li>
                  ))
                ) : (
                  <li>No deliverables set up yet.</li>
                )}
              </ul>
            </div>
            <div className="card-elevated p-6">
              <h3 className="font-display text-base font-semibold">Performance snapshot</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Reach", c.metrics.reach.toLocaleString()],
                  ["Impressions", c.metrics.impressions.toLocaleString()],
                  ["Engagements", c.metrics.engagements.toLocaleString()],
                  ["Link clicks", c.metrics.clicks.toLocaleString()],
                  ["Cost per engagement", formatMoney(c.metrics.cpe)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-display font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="creators" className="mt-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Creator Proposals & Applications</h3>
              <p className="text-xs text-muted-foreground">
                {applications.length > 0
                  ? `${applications.length} real proposals submitted from Marketplace Opportunities`
                  : "Review applications submitted by creators from the marketplace."}
              </p>
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {applications.map((app) => (
                <div key={app.id} className="card-elevated p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      {app.creator_photo || app.avatar ? (
                        <img
                          src={app.creator_photo || app.avatar}
                          alt=""
                          className="size-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {(app.creator_name || app.name || "C")[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/creators/$creatorId"
                          params={{ creatorId: app.creator }}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {app.creator_name || app.name || "Creator"}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          @{app.creator_handle || app.handle || "creator"} · Submitted {app.date || "recently"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'ACCEPTED'
                            ? 'default'
                            : app.status === 'SHORTLISTED'
                            ? 'secondary'
                            : app.status === 'REJECTED'
                            ? 'destructive'
                            : 'outline'
                        }
                        className="rounded-full text-xs capitalize"
                      >
                        {app.status.toLowerCase()}
                      </Badge>
                    </div>

                    <div className="mt-3.5 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                      <p className="font-semibold text-foreground text-[11px] uppercase tracking-wide mb-1">
                        Creator Pitch
                      </p>
                      <p className="whitespace-pre-wrap">{app.pitch_text || app.pitch || "No pitch notes included."}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Proposed Budget / Fee:</span>
                      <span className="font-display font-semibold text-sm text-foreground">
                        {formatMoney((app.proposed_fee_cents || 0) / 100 || app.fee || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Review Action Controls */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 justify-end">
                    {app.status === 'ACCEPTED' ? (
                      <Button asChild size="sm" variant="default" className="rounded-xl text-xs gap-1.5">
                        <Link to="/messages">
                          <MessageSquare className="size-3.5" /> Open Collaboration Workspace
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updateBidMutation.isPending}
                          className="rounded-xl text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => updateBidMutation.mutate({ bidId: app.id, status: 'REJECTED' })}
                        >
                          <X className="size-3.5 mr-1" /> Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={updateBidMutation.isPending}
                          className="rounded-xl text-xs"
                          onClick={() => updateBidMutation.mutate({ bidId: app.id, status: 'SHORTLISTED' })}
                        >
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={updateBidMutation.isPending}
                          className="rounded-xl text-xs gap-1"
                          onClick={() => updateBidMutation.mutate({ bidId: app.id, status: 'ACCEPTED' })}
                        >
                          <Check className="size-3.5 mr-1" /> Accept Proposal
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : c.creators && c.creators.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {c.creators.map((cc) => {
                const cr = creatorById(cc.creatorId);
                if (!cr) return null;
                return (
                  <div key={cc.creatorId} className="card-elevated p-5">
                    <div className="flex items-center gap-3">
                      <img src={cr.avatar} alt="" className="size-12 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/creators/$creatorId"
                          params={{ creatorId: cr.id }}
                          className="text-sm font-medium hover:text-primary"
                        >
                          {cr.name}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatFollowers(cr.followers)} followers · {cr.location}
                        </p>
                      </div>
                      <CampaignStatusBadge status={cc.status as any} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-secondary/60 p-3 text-center text-xs">
                      <div>
                        <p className="font-display text-sm font-semibold">{cc.deliverables.length}</p>
                        <p className="text-muted-foreground">Deliverables</p>
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold">{formatMoney(cc.budget)}</p>
                        <p className="text-muted-foreground">Budget</p>
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold">{cc.payment}</p>
                        <p className="text-muted-foreground">Payment</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-display text-base font-semibold">No applications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Creators browsing Opportunities in Creator Hub will submit bids and proposals here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="deliverables" className="mt-5">
          <div className="card-elevated overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Creator</th>
                  <th className="px-5 py-3">Content</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Approval</th>
                  <th className="px-5 py-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {c.deliverables.map((d) => (
                  <tr key={d.id}>
                    <td className="px-5 py-3.5">{creatorById(d.creatorId)?.name}</td>
                    <td className="px-5 py-3.5">
                      {d.type} × {d.required}
                    </td>
                    <td className="px-5 py-3.5">
                      {d.submitted}/{d.required}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="rounded-full font-normal">
                        {d.approval}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.deadline}</td>
                  </tr>
                ))}
                {!c.deliverables.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                      No deliverables yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-5">
          {subs.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {subs.map((s) => (
                <ContentReviewCard key={s.id} id={s.id} />
              ))}
            </div>
          ) : (
            <p className="card-elevated p-8 text-center text-sm text-muted-foreground">
              No content submitted for this campaign yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-5">
          <div className="card-elevated p-5">
            <div className="space-y-5">
              {convos.flatMap((cv) =>
                cv.messages.map((m) => {
                  const cr = creatorById(cv.creatorId);
                  return (
                    <div
                      key={m.id}
                      className={
                        m.from === "business"
                          ? "ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground"
                          : "max-w-[75%] rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm"
                      }
                    >
                      <p className="mb-1 text-[11px] opacity-70">
                        {m.from === "business" ? currentBusiness.name : cr?.name} · {m.time}
                      </p>
                      {m.text}
                    </div>
                  );
                }),
              )}
              {!convos.length && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No campaign messages yet.
                </p>
              )}
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Paperclip className="size-4" />
              </Button>
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message the campaign creators…"
                className="h-11 rounded-xl"
              />
              <Button
                className="rounded-xl"
                onClick={() => {
                  if (draft) toast.success("Message sent");
                  setDraft("");
                }}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card-elevated p-5">
              <h3 className="font-display text-base font-semibold">Weekly reach</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={c.weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                      }}
                    />
                    <Bar dataKey="reach" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-elevated p-5">
              <h3 className="font-display text-base font-semibold">Weekly engagement</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={c.weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="var(--chart-2)"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/messages">
            <MessageSquare className="size-4" /> Open messages
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
