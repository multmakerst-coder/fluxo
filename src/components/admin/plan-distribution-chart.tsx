"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { PlanDistribution } from "@/app/admin/_data";

const COLORS = ["var(--chart-4)", "var(--chart-1)", "var(--chart-2)"];

export function PlanDistributionChart({ data }: { data: PlanDistribution[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((entry, i) => (
            <Cell key={entry.plan} fill={COLORS[i % COLORS.length]} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}
