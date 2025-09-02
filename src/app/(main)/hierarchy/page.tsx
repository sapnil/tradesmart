import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import { organizationHierarchy } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function HierarchyPage() {
  const getParentName = (parentId?: string) => {
    if (!parentId) return "N/A";
    return organizationHierarchy.find(h => h.id === parentId)?.name || "N/A";
  }
  return (
    <>
      <PageHeader
        title="Organization Hierarchy"
        description="View and manage your sales and distribution hierarchy."
      />
      <Card>
        <CardHeader>
          <CardTitle>Hierarchy Structure</CardTitle>
          <CardDescription>
            This represents the levels of your organization, from regions down to individual retailers.
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
              {organizationHierarchy.map((item) => (
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
