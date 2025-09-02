import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";

export default function RulesPage() {
  return (
    <>
      <PageHeader
        title="Rule Engine"
        description="Configure rules for applying trade promotions to orders."
      />
      <Card>
        <CardHeader>
          <CardTitle>Feature Under Development</CardTitle>
          <CardDescription>This section is currently being built.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground p-20">
          <SlidersHorizontal className="w-16 h-16 mb-4 opacity-50" />
          <p className="max-w-md">
            The rule engine integration is being developed. This will allow for automated application of promotions to DMS orders based on your defined logic.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
