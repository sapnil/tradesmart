import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productHierarchy } from "@/lib/data";
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
                </TableRow>
                </TableHeader>
                <TableBody>
                {productHierarchy.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                        <Badge variant="secondary">{item.level}</Badge>
                    </TableCell>
                    <TableCell>{getParentName(item.parentId)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </>
  );
}
