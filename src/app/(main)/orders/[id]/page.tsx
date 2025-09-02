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
import { orders, products, promotions } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Package } from "lucide-react";

export default function ViewOrderPage({ params }: { params: { id: string } }) {
  const order = orders.find((o) => o.id === params.id);

  if (!order) {
    notFound();
  }

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || "Unknown Product";
  };
  
  const getPromotionName = (promotionId?: string) => {
    if (!promotionId) return "N/A";
    return promotions.find((p) => p.id === promotionId)?.schemeName || "N/A";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  return (
    <>
      <PageHeader title={`Order ${order.id}`} description={`Details for order placed by ${order.distributorName} on ${order.date}.`}>
        <Button asChild variant="outline">
            <Link href="/orders">
                <ArrowLeft className="mr-2" />
                Back to Orders
            </Link>
        </Button>
      </PageHeader>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package />Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{getProductName(item.productId)}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.quantity * item.price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText />Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-medium">{order.id}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Distributor</span>
                        <span className="font-medium">{order.distributorName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Order Date</span>
                        <span className="font-medium">{order.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
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
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Applied Scheme</span>
                        <span className="font-medium text-primary">
                             {order.appliedPromotionId ? (
                                <Link href={`/promotions/${order.appliedPromotionId}/edit`} className="hover:underline">
                                    {getPromotionName(order.appliedPromotionId)}
                                </Link>
                            ) : (
                                "N/A"
                            )}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount</span>
                        <span>{formatCurrency(order.amount)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
}
