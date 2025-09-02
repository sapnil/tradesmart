
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  orders,
  promotions,
  organizationHierarchy,
} from "@/lib/data";
import Link from "next/link";
import { type Promotion } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type ParticipationInfo = {
    promotion: Promotion;
    totalValue: number;
}

export default function ParticipationReportPage() {
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);

  const activePromotions = promotions.filter((p) => p.status === "Active");
  const distributors = organizationHierarchy.filter(h => h.level === 'Distributor');
  const retailers = organizationHierarchy.filter(h => h.level === 'Retailer');

  const getRetailerParent = (retailerId: string) => {
    return organizationHierarchy.find(h => h.id === retailerId)?.parentId;
  };
  
  const getDistributorName = (distributorId?: string) => {
    if (!distributorId) return "N/A";
    return organizationHierarchy.find(h => h.id === distributorId)?.name;
  };

  const getParticipatingPromotions = (retailerId: string): ParticipationInfo[] => {
    const distributorId = getRetailerParent(retailerId);
    if (!distributorId) return [];
    
    const distributorName = getDistributorName(distributorId);

    const participatingPromotionData: Record<string, { promotion: Promotion, totalValue: number }> = {};

    orders.forEach(order => {
        if (order.distributorName === distributorName && order.appliedPromotionId) {
            const promotion = activePromotions.find(p => p.id === order.appliedPromotionId);
            if (promotion) {
                if (!participatingPromotionData[promotion.id]) {
                    participatingPromotionData[promotion.id] = { promotion, totalValue: 0 };
                }
                participatingPromotionData[promotion.id].totalValue += order.amount;
            }
        }
    });

    return Object.values(participatingPromotionData);
  };
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const filteredRetailers = retailers.filter(retailer => {
    const distributorId = getRetailerParent(retailer.id);
    if (selectedDistributorId && distributorId !== selectedDistributorId) {
      return false;
    }
    if (selectedPromotionId) {
      const participatingPromos = getParticipatingPromotions(retailer.id);
      return participatingPromos.some(p => p.promotion.id === selectedPromotionId);
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedPromotionId(null);
    setSelectedDistributorId(null);
  };

  return (
    <>
      <PageHeader
        title="Retailer Participation Report"
        description="A summary of retailer participation in active promotions."
      />
      <Card>
        <CardHeader>
          <CardTitle>Participation by Retailer</CardTitle>
          <CardDescription>
            This report shows which active promotions each retailer is participating in based on distributor orders.
          </CardDescription>
          <div className="flex items-center gap-4 pt-4">
              <Select value={selectedPromotionId ?? 'all'} onValueChange={(value) => setSelectedPromotionId(value === 'all' ? null : value)}>
                  <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Filter by promotion" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Promotions</SelectItem>
                      {activePromotions.map(promo => (
                          <SelectItem key={promo.id} value={promo.id}>{promo.schemeName}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select value={selectedDistributorId ?? 'all'} onValueChange={(value) => setSelectedDistributorId(value === 'all' ? null : value)}>
                  <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Filter by distributor" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Distributors</SelectItem>
                      {distributors.map(dist => (
                          <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              {(selectedPromotionId || selectedDistributorId) && (
                <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
              )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead>Distributor</TableHead>
                <TableHead>Participating Promotions</TableHead>
                <TableHead className="text-right">Total Order Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRetailers.map((retailer) => {
                const participatingPromos = getParticipatingPromotions(retailer.id);
                const distributorId = getRetailerParent(retailer.id);
                const distributorName = getDistributorName(distributorId);

                return (
                  <TableRow key={retailer.id}>
                    <TableCell className="font-medium">{retailer.name}</TableCell>
                    <TableCell>{distributorName}</TableCell>
                    <TableCell>
                      {participatingPromos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {participatingPromos.map((info) => (
                            <Badge key={info.promotion.id} variant="secondary">
                              <Link href={`/promotions/${info.promotion.id}/edit`} className="hover:underline">
                                {info.promotion.schemeName}
                              </Link>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No active participation</span>
                      )}
                    </TableCell>
                     <TableCell className="text-right">
                        {participatingPromos.length > 0 ? (
                            formatCurrency(participatingPromos.reduce((acc, info) => acc + info.totalValue, 0))
                        ) : (
                            <span className="text-muted-foreground">N/A</span>
                        )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRetailers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
