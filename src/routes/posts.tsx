import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AtSign,
  BadgeCheck,
  Bookmark,
  Check,
  ExternalLink,
  Film,
  ImagePlus,
  Loader2,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import {
  socialFeedApi,
  type ActorCard,
  type CollabInboxEntry,
  type PostType,
  type SocialPostData,
  type UploadedFeedMedia,
} from "@/lib/social-feed-api";

export const Route = createFileRoute("/posts")({
  head: () => ({
    meta: [{ title: "Posts & Collabs — Influencers.com Business" }],
  }),
  component: BrandPostsPage,
});

const PUBLIC_SITE_URL = (
  (import.meta.env["VITE_SITE_URL"] as string) || "http://localhost:8082"
).replace(/\/+$/, "");

function BrandPostsPage() {
  const { business } = useAuth();
  const [subTab, setSubTab] = useState<"posts" | "requests" | "saved">("posts");
  const [posts, setPosts] = useState<SocialPostData[]>([]);
  const [requests, setRequests] = useState<CollabInboxEntry[]>([]);
  const [savedPosts, setSavedPosts] = useState<SocialPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);

  const [postType, setPostType] = useState<PostType>("REEL");
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [uploadedSlides, setUploadedSlides] = useState<UploadedFeedMedia[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<ActorCard[]>([]);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const [collabSearch, setCollabSearch] = useState("");
  const [collabCandidates, setCollabCandidates] = useState<ActorCard[]>([]);
  const [selectedCollabs, setSelectedCollabs] = useState<ActorCard[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [myRes, reqRes, savedRes] = await Promise.all([
        socialFeedApi.listMyPosts(),
        socialFeedApi.listCollabRequests(),
        socialFeedApi.listSavedPosts(),
      ]);
      setPosts(myRes.results || []);
      setRequests(reqRes.results || []);
      setSavedPosts(savedRes.results || []);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (mentionQuery === null) {
      setMentionSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      void socialFeedApi
        .searchMentions(mentionQuery)
        .then(setMentionSuggestions)
        .catch(() => setMentionSuggestions([]));
    }, 180);
    return () => clearTimeout(timer);
  }, [mentionQuery]);

  useEffect(() => {
    if (!composerOpen) return;
    const timer = setTimeout(() => {
      void socialFeedApi
        .searchMentions(collabSearch)
        .then(setCollabCandidates)
        .catch(() => setCollabCandidates([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [collabSearch, composerOpen]);

  const handleCaptionChange = (val: string) => {
    setCaption(val);
    const cursorPos = captionRef.current?.selectionStart ?? val.length;
    const match = val.slice(0, cursorPos).match(/@([a-zA-Z0-9._-]{0,40})$/);
    setMentionQuery(match ? (match[1] ?? "") : null);
  };

  const insertMentionHandle = (actor: ActorCard) => {
    const cursorPos = captionRef.current?.selectionStart ?? caption.length;
    const replaced = caption
      .slice(0, cursorPos)
      .replace(/@([a-zA-Z0-9._-]{0,40})$/, `@${actor.handle} `);
    setCaption(`${replaced}${caption.slice(cursorPos)}`);
    setMentionQuery(null);
    captionRef.current?.focus();
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        setUploadProgress(5);
        const uploaded = await socialFeedApi.uploadMedia(file, (pct) => setUploadProgress(pct));
        setUploadedSlides((prev) => {
          const next = [...prev, uploaded];
          if (next.length > 1) setPostType("CAROUSEL");
          else if (uploaded.media_type === "VIDEO") setPostType("REEL");
          else setPostType("IMAGE");
          return next;
        });
        toast.success(`Uploaded ${file.name}`);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data
            ?.detail ||
          (err as { message?: string })?.message ||
          `Failed to upload ${file.name}`;
        toast.error(msg);
      } finally {
        setUploadProgress(null);
      }
    }
  };

  const handlePublish = async () => {
    if (uploadedSlides.length === 0) {
      toast.error("Please upload at least one image or video (up to 150 MB).");
      return;
    }
    setPublishing(true);
    try {
      await socialFeedApi.createPost({
        post_type: uploadedSlides.length > 1 ? "CAROUSEL" : postType,
        caption,
        is_public: isPublic,
        media_items: uploadedSlides.map((s) => ({
          media_asset_id: s.media_asset_id,
          media_type: s.media_type,
          media_url: s.url,
          aspect_ratio: postType === "REEL" ? "9:16" : "4:5",
          file_size_bytes: s.file_size_bytes,
        })),
        collaborator_user_ids: selectedCollabs.map((c) => c.user_id),
      });
      toast.success("Brand showcase post published!");
      setComposerOpen(false);
      setCaption("");
      setUploadedSlides([]);
      setSelectedCollabs([]);
      await loadAll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to publish post.";
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  const handleCollabRespond = async (postId: string, action: "ACCEPT" | "DECLINE" | "REMOVE") => {
    try {
      await socialFeedApi.respondCollab(postId, action);
      toast.success(
        action === "ACCEPT"
          ? "Collab accepted! Post is now live on your Brand showcase page."
          : "Collab invitation updated.",
      );
      await loadAll();
    } catch {
      toast.error("Could not update collaboration request.");
    }
  };

  const handleToggleSave = async (postId: string) => {
    try {
      const res = await socialFeedApi.toggleSave(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_saved: res.is_saved, saves_count: res.saves_count } : p,
        ),
      );
      const savedList = await socialFeedApi.listSavedPosts();
      setSavedPosts(savedList.results || []);
    } catch {
      toast.error("Could not save post.");
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await socialFeedApi.deletePost(postId);
      toast.success("Post deleted.");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      toast.error("Could not delete post.");
    }
  };

  const pendingCount = requests.filter(
    (r) => r.relation_type === "COLLAB_INVITE" && r.invite_status === "PENDING",
  ).length;

  const activeList = subTab === "posts" ? posts : savedPosts;

  return (
    <AppShell>
      <PageHeader
        title="Brand Posts & Creator Collabs"
        subtitle="Publish campaign reels/photos (up to 150 MB), @mention creators, and approve Creator × Brand collab tags."
        actions={
          <div className="flex flex-wrap gap-2">
            {business?.handle && (
              <Button variant="outline" className="rounded-xl" asChild>
                <a
                  href={`${PUBLIC_SITE_URL}/business/${business.handle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4" /> Public Brand Feed
                </a>
              </Button>
            )}
            <Button className="rounded-xl" onClick={() => setComposerOpen(true)}>
              <Plus className="size-4" /> Create Post / Reel
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={subTab === "posts" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setSubTab("posts")}
        >
          <Film className="size-4" /> Brand Grid & Collabs ({posts.length})
        </Button>
        <Button
          size="sm"
          variant={subTab === "requests" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setSubTab("requests")}
        >
          <Users className="size-4" /> Collab Invites & Tags
          {pendingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {pendingCount}
            </span>
          )}
        </Button>
        <Button
          size="sm"
          variant={subTab === "saved" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setSubTab("saved")}
        >
          <Bookmark className="size-4" /> Saved ({savedPosts.length})
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : subTab === "requests" ? (
        requests.length === 0 ? (
          <div className="card-elevated p-10 text-center text-sm text-muted-foreground">
            When creators @mention your brand or invite you to co-author a post, their requests
            appear here for approval.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((entry) => (
              <div
                key={entry.id}
                className="card-elevated flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  {entry.post.media_items[0]?.media_url ? (
                    <img
                      src={entry.post.media_items[0].media_url}
                      alt=""
                      className="size-16 rounded-xl object-cover bg-muted"
                    />
                  ) : (
                    <div className="grid size-16 place-items-center rounded-xl bg-muted">
                      <Video className="size-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      @{entry.post.author.handle || entry.post.author.display_name}{" "}
                      <span className="font-normal text-muted-foreground">
                        (
                        {entry.relation_type === "COLLAB_INVITE"
                          ? "Invited your brand to Collab"
                          : "@Mentioned your brand"}
                        )
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {entry.post.caption}
                    </p>
                    <span className="mt-1.5 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium">
                      {entry.invite_status}
                    </span>
                  </div>
                </div>

                {entry.relation_type === "COLLAB_INVITE" && (
                  <div className="flex flex-wrap gap-2">
                    {entry.invite_status !== "ACCEPTED" && (
                      <Button
                        size="sm"
                        className="rounded-xl"
                        onClick={() => void handleCollabRespond(entry.post.id, "ACCEPT")}
                      >
                        <Check className="size-4" /> Accept & Mirror on Brand Page
                      </Button>
                    )}
                    {entry.invite_status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => void handleCollabRespond(entry.post.id, "DECLINE")}
                      >
                        <X className="size-4" /> Decline
                      </Button>
                    )}
                    {entry.invite_status === "ACCEPTED" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => void handleCollabRespond(entry.post.id, "REMOVE")}
                      >
                        Remove Collab
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : activeList.length === 0 ? (
        <div className="card-elevated p-10 text-center">
          <Sparkles className="mx-auto size-8 text-primary" />
          <h3 className="mt-3 font-display text-lg font-semibold">
            {subTab === "posts" ? "No brand showcase posts yet" : "No saved posts yet"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            {subTab === "posts"
              ? "Share campaign reels (up to 150 MB) or product launch photos and invite creators to collaborate."
              : "Bookmark creator reels & campaigns to build your moodboard."}
          </p>
          {subTab === "posts" && (
            <Button className="mt-4 rounded-xl" onClick={() => setComposerOpen(true)}>
              <Plus className="size-4" /> Create Post
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeList.map((post) => {
            const media = post.media_items[0];
            return (
              <div key={post.id} className="card-elevated overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/60 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">
                      @{post.author.handle || post.author.display_name}
                      {post.accepted_collaborators.length > 0 && (
                        <span className="text-primary">
                          {" "}
                          ×{" "}
                          {post.accepted_collaborators
                            .map((c) => `@${c.handle || c.display_name}`)
                            .join(", ")}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {post.post_type} · {post.is_public ? "Public" : "Private"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`${PUBLIC_SITE_URL}/post/${post.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                    {subTab === "posts" && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(post.id)}
                        className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="aspect-[4/5] bg-black">
                  {media ? (
                    media.media_type === "VIDEO" ? (
                      <video
                        src={media.media_url}
                        controls
                        playsInline
                        muted
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={media.media_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : null}
                </div>
                <div className="space-y-2 p-3.5">
                  <p className="line-clamp-2 text-xs">{post.caption || "No caption"}</p>
                  <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <span>{post.views_count} views</span>
                    <button
                      type="button"
                      onClick={() => void handleToggleSave(post.id)}
                      className="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
                    >
                      <Bookmark
                        className={`size-3.5 ${post.is_saved ? "fill-primary text-primary" : ""}`}
                      />
                      {post.saves_count} saved
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Create Brand Showcase Post
            </DialogTitle>
            <DialogDescription>
              Upload product videos (up to 150 MB, unrestricted duration) or photos (up to 10 MB),{" "}
              <code>@mention</code> creators, and invite Co-Authors.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  MP4 / MOV / WebM (max <strong>150 MB</strong>) · JPG / PNG / WebP (max 10 MB)
                </span>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  <ImagePlus className="size-3.5" /> Add Photo / Video
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                    className="hidden"
                    onChange={(e) => void handleFilesSelected(e.target.files)}
                  />
                </label>
              </div>
              {uploadProgress !== null && (
                <div className="mt-3 space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-[11px] text-muted-foreground">Uploading... {uploadProgress}%</p>
                </div>
              )}
              {uploadedSlides.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {uploadedSlides.map((s, idx) => (
                    <div
                      key={s.id}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border bg-black"
                    >
                      {s.media_type === "VIDEO" ? (
                        <video src={s.url} muted className="h-full w-full object-cover" />
                      ) : (
                        <img src={s.url} alt="" className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setUploadedSlides((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/70 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadedSlides.length <= 1 && (
              <div className="flex gap-2">
                {(["REEL", "VIDEO", "IMAGE"] as PostType[]).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={postType === t ? "default" : "outline"}
                    onClick={() => setPostType(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">
                Caption (type <code>@</code> to mention creators or partner brands)
              </label>
              <Textarea
                ref={captionRef}
                rows={3}
                placeholder="New Monsoon collection film starring @arjun.vlogs #kerala #brandcollab"
                value={caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
              />
              {mentionQuery !== null && mentionSuggestions.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                  {mentionSuggestions.map((actor) => (
                    <button
                      key={`${actor.role}-${actor.user_id}`}
                      type="button"
                      onClick={() => insertMentionHandle(actor)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-muted"
                    >
                      <AtSign className="size-3.5 text-primary" />
                      <span className="font-semibold">@{actor.handle}</span>
                      <span className="truncate text-muted-foreground">{actor.display_name}</span>
                      <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px]">
                        {actor.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-border p-3">
              <label className="text-xs font-semibold">
                Invite Creator Collaborators (Co-Authors)
              </label>
              <Input
                placeholder="Search creator @handle..."
                value={collabSearch}
                onChange={(e) => setCollabSearch(e.target.value)}
                className="h-8 text-xs"
              />
              {selectedCollabs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedCollabs.map((c) => (
                    <span
                      key={c.user_id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      @{c.handle || c.display_name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCollabs((prev) =>
                            prev.filter((item) => item.user_id !== c.user_id),
                          )
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pt-1">
                {collabCandidates
                  .filter((c) => !selectedCollabs.some((s) => s.user_id === c.user_id))
                  .slice(0, 8)
                  .map((actor) => (
                    <button
                      key={actor.user_id}
                      type="button"
                      onClick={() => setSelectedCollabs((prev) => [...prev, actor])}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:border-primary"
                    >
                      <Plus className="size-3" />
                      @{actor.handle || actor.display_name}
                      {actor.verified && <BadgeCheck className="size-3 text-primary" />}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5">
              <div>
                <p className="text-xs font-semibold">Publish to Public Explore Feed</p>
                <p className="text-[11px] text-muted-foreground">
                  Surface this post on Kerala Creator Collab (/feed & /business/@handle)
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setComposerOpen(false)} disabled={publishing}>
              Cancel
            </Button>
            <Button onClick={() => void handlePublish()} disabled={publishing || uploadProgress !== null}>
              {publishing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Publish Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
