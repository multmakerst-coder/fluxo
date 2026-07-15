"use client";

import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { DailyPoint, ChannelBreakdown } from "@/app/admin/mensagens/_data";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

export function MessagesVolumeChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="mensagensGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="mensagens" name="Mensagens" stroke="var(--chart-1)" fill="url(#mensagensGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const CHANNEL_COLORS = ["var(--chart-3)", "var(--chart-2)", "var(--chart-4)"];

export function ChannelBreakdownChart({ data }: { data: ChannelBreakdown[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((entry, i) => (
            <Cell key={entry.channel} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
