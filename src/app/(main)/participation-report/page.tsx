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

  const getParticipatingPromotions = (retailerId: string): Promotion[] => {
    const distributorId = getRetailerParent(retailerId);
    if (!distributorId) return [];
    
    const distributorName = getDistributorName(distributorId);

    const participatingPromotionIds = new Set<string>();

    orders.forEach(order => {
        if (order.distributorName === distributorName && order.appliedPromotionId) {
            const promotion = activePromotions.find(p => p.id === order.appliedPromotionId);
            if (promotion) {
                participatingPromotionIds.add(promotion.id);
            }
        }
    });

    return Array.from(participatingPromotionIds).map(id => promotions.find(p => p.id === id)!);
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead>Distributor</TableHead>
                <TableHead>Participating Promotions</TableHead>
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
                          {participatingPromos.map((promo) => (
                            <Badge key={promo.id} variant="secondary">
                              <Link href={`/promotions/${promo.id}/edit`} className="hover:underline">
                                {promo.schemeName}
                              </Link>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No active participation</span>
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
