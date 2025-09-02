
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { PageHeader } from "@/components/page-header"
import { promotions, salesData, orders } from "@/lib/data"
import { ArrowUpRight, DollarSign, Megaphone, Percent, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Promotion } from "@/types"

const kpiData = [
    { title: "Active Promotions", value: "3", change: "+2 from last month", icon: Megaphone },
    { title: "Sales (YTD)", value: "₹2.1Cr", change: "+18.7% from last year", icon: DollarSign },
    { title: "Promotional Uplift", value: "+11.4%", change: "vs. non-promo period", icon: Percent },
]

export default function DashboardPage() {
  const activePromotions = promotions.filter(p => p.status === 'Active');

  const promotionEffectiveness = activePromotions.map(promo => {
    const appliedCount = orders.filter(order => order.appliedPromotionId === promo.id).length;
    return {
      ...promo,
      appliedCount,
    }
  }).sort((a, b) => b.appliedCount - a.appliedCount);


  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back, here's a summary of your trade promotions." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {kpiData.map((kpi) => (
            <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance for the current year.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesData}>
                <XAxis
                  dataKey="month"
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
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Scheme Effectiveness</CardTitle>
              <CardDescription>
                Performance of active promotion schemes.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/promotions">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheme</TableHead>
                  <TableHead className="text-right">Applied Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotionEffectiveness.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No active promotions applied yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  promotionEffectiveness.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <Link href={`/promotions/${promo.id}/edit`} className="font-medium hover:underline text-primary">
                          {promo.schemeName}
                        </Link>
                        <div className="text-sm text-muted-foreground hidden md:block">
                          {promo.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-lg">{promo.appliedCount}</div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
