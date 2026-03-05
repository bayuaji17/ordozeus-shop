"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Orders",
    color: "hsl(142, 71%, 45%)",
  },
} satisfies ChartConfig;

interface OrdersChartProps {
  data: { date: string; revenue: number; count: number }[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
        No order data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart accessibilityLayer data={data}>
        <defs>
          <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-count)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-count)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
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
          allowDecimals={false}
          width={40}
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
                return `${num} order${num !== 1 ? "s" : ""}`;
              }}
            />
          }
        />
        <Area
          dataKey="count"
          type="monotone"
          fill="url(#fillCount)"
          stroke="var(--color-count)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
