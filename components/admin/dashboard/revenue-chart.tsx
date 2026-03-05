"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig;

interface RevenueChartProps {
  data: { date: string; revenue: number; count: number }[];
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0 || data.every((d) => d.revenue === 0)) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tickFormatter={(value: string) => {
            const d = new Date(value);
            return d.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
          }}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `Rp ${formatCompact(value)}`}
          width={80}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value: string) => {
                const d = new Date(value);
                return d.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              }}
              formatter={(value) => {
                const num =
                  typeof value === "string" ? parseInt(value) : Number(value);
                return `Rp ${num.toLocaleString("id-ID")}`;
              }}
            />
          }
        />
        <Bar
          dataKey="revenue"
          fill="var(--color-revenue)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
