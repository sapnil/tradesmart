import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes } from "lucide-react";

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Product Hierarchy"
        description="Manage complex product hierarchies for promotion targeting."
      />
      <Card>
        <CardHeader>
          <CardTitle>Feature Under Development</CardTitle>
          <CardDescription>This section is currently being built.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-20">
          <Boxes className="w-16 h-16 mb-4 opacity-50" />
          <p className="max-w-md">
            The product management module is in the pipeline. Soon, you will be able to define and manage your product categories, brands, and SKUs for precise promotion targeting.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
