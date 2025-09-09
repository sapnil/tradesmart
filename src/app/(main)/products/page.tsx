import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productHierarchy, products } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
    const getParentName = (parentId?: string) => {
        if (!parentId) return "N/A";
        return productHierarchy.find(h => h.id === parentId)?.name || "N/A";
    }

    const getProductPrice = (productName: string) => {
        return products.find(p => p.name === productName)?.price;
    }
    
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        }).format(amount);

  return (
    <>
      <PageHeader
        title="Product Hierarchy"
        description="Manage complex product hierarchies for promotion targeting."
      />
      <Card>
        <CardHeader>
          <CardTitle>Product Structure</CardTitle>
          <CardDescription>
            This represents the levels of your product catalog, from categories down to individual SKUs.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {productHierarchy.map((item) => {
                    const price = item.level === 'SKU' ? getProductPrice(item.name) : undefined;
                    return (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">{item.level}</Badge>
                        </TableCell>
                        <TableCell>{getParentName(item.parentId)}</TableCell>
                        <TableCell className="text-right font-mono">
                            {price !== undefined ? formatCurrency(price) : 'N/A'}
                        </TableCell>
                        </TableRow>
                    )
                })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </>
  );
}
