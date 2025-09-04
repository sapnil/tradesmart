
"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"

import { initialBudgets } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function BudgetConsumptionReport() {

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Budget Consumption Chart</CardTitle>
                <CardDescription>
                    A visual comparison of total vs. spent amounts for each budget.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                <BarChart data={initialBudgets}>
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip
                        cursor={{ fill: "hsl(var(--secondary))" }}
                        contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Total Budget" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spentAmount" name="Spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="allocatedAmount" name="Allocated" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Budget Details</CardTitle>
                <CardDescription>
                    A detailed breakdown of each budget's consumption.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Budget Name</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead className="text-right">Allocated</TableHead>
                            <TableHead className="text-right">Spent</TableHead>
                            <TableHead className="text-right">Consumption</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialBudgets.map(budget => {
                            const consumption = budget.totalAmount > 0 ? (budget.spentAmount / budget.totalAmount) * 100 : 0;
                            return (
                                <TableRow key={budget.id}>
                                    <TableCell className="font-medium">{budget.name}</TableCell>
                                    <TableCell><Badge variant="outline">{budget.period}</Badge></TableCell>
                                    <TableCell className="text-right">{formatCurrency(budget.totalAmount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(budget.allocatedAmount)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(budget.spentAmount)}</TableCell>
                                    <TableCell className="text-right font-medium">{consumption.toFixed(2)}%</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
