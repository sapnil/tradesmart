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

type ParticipationInfo = {
    promotion: Promotion;
    totalValue: number;
}

export default function ParticipationReportPage() {
  const activePromotions = promotions.filter((p) => p.status === "Active");
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
              {retailers.map((retailer) => {
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
