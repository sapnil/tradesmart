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
import { orders, promotions } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function OrdersPage() {
  const getPromotionName = (promotionId?: string) => {
    if (!promotionId) return "N/A";
    return promotions.find((p) => p.id === promotionId)?.schemeName || "N/A";
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="View and manage orders from your distributors."
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            A list of recent orders received from the Distributor Management System (DMS).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Distributor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Scheme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/orders/${order.id}`} className="hover:underline text-primary">
                      {order.id}
                    </Link>
                  </TableCell>
                  <TableCell>{order.distributorName}</TableCell>
                  <TableCell>{order.date}</TableCell>
                   <TableCell>
                    <Badge variant={order.orderType === 'Purchase' ? 'default' : 'secondary'}>
                      {order.orderType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(order.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Fulfilled"
                          ? "default"
                          : order.status === "Pending"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        order.status === "Fulfilled"
                          ? "bg-green-500/20 text-green-700 border-green-500/20"
                          : order.status === "Cancelled"
                          ? "bg-red-500/20 text-red-700 border-red-500/20"
                          : ""
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.appliedPromotionId ? (
                        <Link href={`/promotions/${order.appliedPromotionId}/edit`} className="hover:underline text-primary">
                            {getPromotionName(order.appliedPromotionId)}
                        </Link>
                    ) : (
                        "N/A"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
