'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyTrend {
  month: string;
  total: number;
  count: number;
}

export function MonthlytrendChart({ trends }: { trends: MonthlyTrend[] }) {
  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">6-Month Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No trend data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.map((trend) => ({
    month: trend.month,
    spend: Math.round(trend.total * 100) / 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">6-Month Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="hsl(var(--primary))"
              dot={{ fill: 'hsl(var(--primary))' }}
              name="Total Spending"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
