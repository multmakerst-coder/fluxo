"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { ResponseTimePoint } from "@/app/admin/sistema/_data";

export function ResponseTimeChart({ data }: { data: ResponseTimePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} unit="ms" />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="whatsapp" name="WhatsApp" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="instagram" name="Instagram" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="email" name="Email" stroke="var(--chart-4)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
