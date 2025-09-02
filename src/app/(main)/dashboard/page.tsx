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
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { PageHeader } from "@/components/page-header"
import { promotions, salesData } from "@/lib/data"
import { ArrowUpRight, DollarSign, Megaphone, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const kpiData = [
    { title: "Active Promotions", value: "3", change: "+2 from last month", icon: Megaphone },
    { title: "Sales (YTD)", value: "₹2.1Cr", change: "+18.7% from last year", icon: DollarSign },
    { title: "Promotional Uplift", value: "+11.4%", change: "vs. non-promo period", icon: Percent },
]

export default function DashboardPage() {
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
              <CardTitle>Recent Promotions</CardTitle>
              <CardDescription>
                An overview of the most recent trade promotions.
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
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.slice(0, 5).map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <div className="font-medium">{promo.schemeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {promo.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Badge variant={promo.status === 'Active' ? 'default' : promo.status === 'Upcoming' ? 'secondary' : 'outline'} className={promo.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20' : ''}>
                        {promo.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
