import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { getBusinessAnalytics } from "@/lib/business-api";
import { formatMoney } from "@/lib/currency";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Influencers.com Business" },
      {
        name: "description",
        content:
          "Track discovery, outreach, campaign performance and spend across your influencer marketing programme.",
      },
      { property: "og:title", content: "Analytics — Influencers.com Business" },
      { property: "og:description", content: "Discovery, outreach and campaign performance." },
    ],
  }),
  component: Analytics,
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
} as const;

const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="card-elevated p-5">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 h-72">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            {children as React.ReactElement}
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse rounded-xl bg-muted/40" />
        )}
      </div>
    </div>
  );
}

function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["business-analytics"],
    queryFn: getBusinessAnalytics,
  });

  const stats = analytics?.analytics_stats || [
    { label: "Influencers discovered", value: "—" },
    { label: "Profiles shortlisted", value: "—" },
    { label: "Collaboration response rate", value: "—" },
    {
      label: "Total programme spend",
      value: analytics ? formatMoney(analytics.total_spend || 0, "INR") : "—",
    },
  ];

  // Dynamic series from real backend data
  const activityData = analytics?.campaign_activity || [];
  const responseData = analytics?.response_rate_trend || [];
  const performanceData = analytics?.campaign_performance || [];
  const categoryData = analytics?.category_distribution || [];

  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        subtitle="How your influencer programme is performing in real-time."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, idx) => {
          // If this is the spend card, format using user-selected currency
          const displayVal =
            idx === 3 && analytics ? formatMoney(analytics.total_spend || 0, "INR") : s.value;

          return (
            <div key={s.label} className="card-elevated p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold">{displayVal}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <ChartCard title="Campaign activity" subtitle="Campaigns launched vs inquiries sent">
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="fillInq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area
              type="monotone"
              dataKey="inquiries"
              stroke="var(--chart-1)"
              strokeWidth={3}
              fill="url(#fillInq)"
            />
            <Area
              type="monotone"
              dataKey="campaigns"
              stroke="var(--chart-2)"
              strokeWidth={3}
              fill="transparent"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Influencer response rate" subtitle="Share of creators replying, %">
          <LineChart data={responseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--chart-2)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="Campaign performance" subtitle="Reach and engagement in thousands">
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="reach" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="engagement" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Creator category distribution" subtitle="Share of creators worked with">
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
            >
              {categoryData.map((_, i) => (
                <Cell key={i} fill={pieColors[i % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartCard>
      </div>
    </AppShell>
  );
}
