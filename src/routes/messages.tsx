import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useInquirySocket } from "@/lib/use-inquiry-socket";
import { detectContactLeakage } from "@/lib/contact-guard";
import {
  getBusinessInquiries,
  getBusinessInquiryMessages,
  sendBusinessInquiryMessage,
  type BusinessInquiryItem,
  type BusinessInquiryMessage,
} from "@/lib/business-api";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Influencers.com Business" },
      {
        name: "description",
        content: "Chat directly with creators with real-time brief context and status tracking.",
      },
      { property: "og:title", content: "Messages — Influencers.com Business" },
      {
        property: "og:description",
        content: "Your live creator conversations and negotiation threads.",
      },
    ],
  }),
  component: Messages,
});

const QUICK_TEMPLATES = [
  {
    label: "Brief confirmation",
    text: "Hi! We wanted to confirm the deliverables and schedule for this campaign.",
  },
  {
    label: "Content review",
    text: "Thank you! Our creative team has reviewed the initial draft and we love the direction.",
  },
  { label: "Timeline check", text: "Could you share an estimated date for the next draft upload?" },
  {
    label: "Payment terms",
    text: "The milestone payment has been scheduled in line with our agreed terms.",
  },
];

function Messages() {
  const { business } = useAuth();
  const queryClient = useQueryClient();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: inquiries = [], isLoading: loadingInquiries } = useQuery({
    queryKey: ["business-inquiries"],
    queryFn: getBusinessInquiries,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (inquiries.length > 0 && !activeId && inquiries[0]) {
      setActiveId(inquiries[0].id);
    }
  }, [inquiries, activeId]);

  const activeInquiry = inquiries.find((i) => i.id === activeId) || inquiries[0] || null;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("business_access_token") : null;

  const {
    isConnected,
    sendMessage: sendWsMessage,
    markRead,
  } = useInquirySocket({
    inquiryId: activeInquiry ? activeInquiry.id : null,
    token,
    onNewMessage: (newMsg) => {
      queryClient.setQueryData(
        ["business-inquiry-messages", activeInquiry?.id],
        (old: any = []) => {
          if (old.some((m: any) => m.id === newMsg.id)) return old;
          return [
            ...old,
            {
              id: newMsg.id,
              sender: newMsg.sender_name,
              sender_name: newMsg.sender_name,
              body: newMsg.body,
              created_at: newMsg.created_at,
              is_from_business: newMsg.sender_role === "business",
              is_from_creator: newMsg.sender_role === "creator",
              is_me: newMsg.sender_role === "business",
              is_read: false,
            },
          ];
        },
      );
      queryClient.invalidateQueries({ queryKey: ["business-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["business-unread-count"] });
    },
    onMessagesRead: () => {
      queryClient.invalidateQueries({ queryKey: ["business-unread-count"] });
    },
    onError: (err) => {
      toast.error(err.detail);
    },
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["business-inquiry-messages", activeInquiry?.id],
    queryFn: async () => {
      if (!activeInquiry) return [];
      const data = await getBusinessInquiryMessages(activeInquiry.id);
      // Backend automatically marks unread messages from creator as read
      queryClient.invalidateQueries({ queryKey: ["business-unread-count"] });
      return data;
    },
    enabled: Boolean(activeInquiry?.id),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (activeInquiry?.id) {
      markRead();
      queryClient.invalidateQueries({ queryKey: ["business-unread-count"] });
    }
  }, [activeInquiry?.id]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (text: string) => {
      if (!activeInquiry) throw new Error("No conversation selected");
      return sendBusinessInquiryMessage(activeInquiry.id, text);
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["business-inquiry-messages", activeInquiry?.id] });
      queryClient.invalidateQueries({ queryKey: ["business-inquiries"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to deliver message");
    },
  });

  const contactGuard = useMemo(() => detectContactLeakage(draft), [draft]);

  const handleSend = () => {
    if (!draft.trim() || sendMutation.isPending) return;
    if (contactGuard.isBlocked) {
      toast.error(contactGuard.reason);
      return;
    }
    const text = draft.trim();
    setDraft("");

    // 1. Dispatch over low-latency WebSocket
    const sentOverWs = sendWsMessage(text);
    if (!sentOverWs) {
      // 2. Fallback to REST mutation
      sendMutation.mutate(text);
    } else {
      queryClient.invalidateQueries({ queryKey: ["business-inquiries"] });
    }
  };

  const filteredInquiries = inquiries.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.creator_name.toLowerCase().includes(q) ||
      i.creator_handle.toLowerCase().includes(q) ||
      i.campaign.toLowerCase().includes(q) ||
      i.subject.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell>
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Messages</h1>
          <p className="text-xs text-muted-foreground">
            Direct collaboration threads with creators on Influencers.com
          </p>
        </div>
        {inquiries.length > 0 && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live sync active
          </span>
        )}
      </div>

      <div className="card-elevated grid h-[calc(100vh-14rem)] min-h-[520px] grid-cols-1 overflow-hidden lg:grid-cols-[320px_1fr]">
        {/* Left Sidebar: Conversations List */}
        <div
          className={cn(
            "flex flex-col h-full min-h-0 overflow-hidden border-r border-border bg-card/50",
            mobileOpen && "hidden lg:flex",
          )}
        >
          <div className="border-b border-border p-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="h-10 rounded-xl pl-9 text-xs"
              />
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loadingInquiries && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Loading conversations...
              </div>
            )}

            {!loadingInquiries && filteredInquiries.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  No conversations yet
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  Send a collaboration request to a creator to start chatting.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4 rounded-xl text-xs">
                  <Link to="/discover">Discover Creators</Link>
                </Button>
              </div>
            )}

            {!loadingInquiries &&
              filteredInquiries.map((cv) => {
                const isSelected = cv.id === activeInquiry?.id;
                const avatar =
                  cv.creator_avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(cv.creator_name)}&background=E0F2FE&color=0369A1&bold=true`;

                const isAccepted = cv.status === "ACCEPTED";
                const isUnread =
                  cv.is_read === false || (cv.unread_count !== undefined && cv.unread_count > 0);

                return (
                  <button
                    key={cv.id}
                    onClick={() => {
                      setActiveId(cv.id);
                      setMobileOpen(true);
                    }}
                    className={cn(
                      "flex w-full gap-3 border-b border-border px-4 py-3.5 text-left transition-colors hover:bg-secondary/60",
                      isSelected && "bg-primary-soft/50",
                    )}
                  >
                    <div className="relative shrink-0">
                      <img src={avatar} alt="" className="size-11 rounded-xl object-cover" />
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            isUnread ? "font-bold text-foreground" : "font-medium",
                          )}
                        >
                          {cv.creator_name}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {cv.date}
                        </span>
                      </div>
                      <p className="truncate text-[11px] font-medium text-primary">{cv.campaign}</p>
                      <p className="truncate text-xs text-muted-foreground">{cv.message}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] uppercase font-semibold",
                          isAccepted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {cv.status}
                      </Badge>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Pane: Active Thread */}
        <div
          className={cn(
            "flex flex-col h-full min-h-0 overflow-hidden bg-background/50",
            !mobileOpen && "hidden lg:flex",
          )}
        >
          {!activeInquiry ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="mx-auto size-10 text-muted-foreground/40" />
                <h3 className="mt-3 font-display text-base font-semibold">Select a conversation</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Choose a creator thread from the left to review messages and collaborate.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-card/40">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl lg:hidden"
                  onClick={() => setMobileOpen(false)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <img
                  src={
                    activeInquiry.creator_avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(activeInquiry.creator_name)}&background=E0F2FE&color=0369A1&bold=true`
                  }
                  alt=""
                  className="size-10 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/creators/$creatorId"
                    params={{ creatorId: activeInquiry.creator_id }}
                    className="inline-flex items-center gap-1 text-sm font-semibold hover:text-primary"
                  >
                    {activeInquiry.creator_name}
                    <BadgeCheck className="size-3.5 text-primary" />
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    @{activeInquiry.creator_handle} · Budget: {activeInquiry.budget}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-xs font-semibold",
                      activeInquiry.status === "ACCEPTED"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-primary/20 bg-primary/10 text-primary",
                    )}
                  >
                    {activeInquiry.status === "ACCEPTED"
                      ? "✓ Proposal Accepted"
                      : activeInquiry.status}
                  </Badge>
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                    <Link
                      to="/creators/$creatorId"
                      params={{ creatorId: activeInquiry.creator_id }}
                    >
                      View Profile
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Messages Body */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 space-y-4 overflow-y-auto px-4 py-5 bg-background/30"
              >
                {/* System Initial Card */}
                <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card/60 p-4 text-center">
                  <Sparkles className="mx-auto size-5 text-primary" />
                  <h4 className="mt-1 font-display text-xs font-semibold">
                    {activeInquiry.campaign}
                  </h4>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Collaboration thread initiated with {activeInquiry.creator_name} on{" "}
                    {activeInquiry.date}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">{activeInquiry.budget}</p>
                </div>

                {loadingMessages && (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Loading message history...
                  </div>
                )}

                {!loadingMessages &&
                  messages.map((m) => {
                    const isMe = (m as any).is_me ?? m.is_from_business ?? !m.is_from_creator;
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-xs",
                          isMe
                            ? "ml-auto rounded-br-xs bg-primary text-primary-foreground"
                            : "mr-auto rounded-bl-xs border border-border bg-card text-foreground",
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-3 text-[10px] opacity-75">
                          <span className="font-semibold">
                            {isMe ? business?.company_name || "You" : m.sender_name}
                          </span>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.body}</p>
                      </div>
                    );
                  })}
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-3 bg-card/30">
                {contactGuard.isBlocked && (
                  <div className="mb-2 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] font-medium text-destructive">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Contact Sharing Blocked</p>
                      <p className="opacity-90">{contactGuard.reason}</p>
                    </div>
                  </div>
                )}
                <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    Escrow Protected Chat · Phone numbers, emails & UPI links are disabled
                  </span>
                </div>
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {QUICK_TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setDraft(t.text)}
                      className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-end gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Reply to ${activeInquiry.creator_name}…`}
                    className={cn(
                      "h-11 rounded-xl text-xs",
                      contactGuard.isBlocked && "border-destructive focus-visible:ring-destructive",
                    )}
                    disabled={sendMutation.isPending}
                  />
                  <Button
                    className="rounded-xl"
                    onClick={handleSend}
                    disabled={!draft.trim() || sendMutation.isPending || contactGuard.isBlocked}
                  >
                    <Send className="size-4" />
                    <span className="hidden sm:inline">
                      {sendMutation.isPending ? "Sending..." : "Send"}
                    </span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
