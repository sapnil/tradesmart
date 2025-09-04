
"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { orders, promotions } from "@/lib/data";
import { type Promotion } from "@/types";
import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface PromotionPerformanceData extends Promotion {
  appliedOrdersCount: number;
  totalSalesValue: number;
}

export function PromotionPerformanceReport() {
  const performanceData = useMemo<PromotionPerformanceData[]>(() => {
    return promotions.map(promo => {
      const appliedOrders = orders.filter(order => order.appliedPromotionId === promo.id);
      const appliedOrdersCount = appliedOrders.length;
      const totalSalesValue = appliedOrders.reduce((sum, order) => sum + order.amount, 0);

      return {
        ...promo,
        appliedOrdersCount,
        totalSalesValue,
      };
    });
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const UpliftIndicator = ({ uplift }: { uplift: number }) => {
    let colorClass = "text-muted-foreground";
    let Icon = Minus;

    if (uplift > 0) {
      colorClass = "text-green-600";
      Icon = ArrowUp;
    } else if (uplift < 0) {
      colorClass = "text-red-600";
      Icon = ArrowDown;
    }

    return (
      <div className={`flex items-center gap-1 font-medium ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span>{uplift.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>
          A detailed breakdown of each promotion's performance metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheme Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Applied Orders</TableHead>
              <TableHead className="text-right">Total Sales Value</TableHead>
              <TableHead className="text-right">Predicted Uplift</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {performanceData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No promotion data available.
                </TableCell>
              </TableRow>
            ) : (
              performanceData.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">
                     <Link href={`/promotions/${promo.id}/edit`} className="hover:underline text-primary">
                        {promo.schemeName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.status === 'Active' ? 'default' : promo.status === 'Upcoming' ? 'secondary' : 'outline'} className={promo.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30' : ''}>
                        {promo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{promo.type}</TableCell>
                  <TableCell className="text-right font-mono">{promo.appliedOrdersCount}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(promo.totalSalesValue)}</TableCell>
                  <TableCell className="text-right">
                    <UpliftIndicator uplift={promo.uplift} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
