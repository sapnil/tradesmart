import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { promotions } from "@/lib/data";
import { File, ListFilter, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

export default function PromotionsPage() {
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <PageHeader
          title="Promotions"
          description="Define, manage, and track your trade promotions."
        />
        <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Upcoming</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>
                  Expired
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button asChild size="sm" className="h-8 gap-1">
              <Link href="/ai-schemes">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Create Promotion
                </span>
              </Link>
            </Button>
          </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Promotion Schemes</CardTitle>
            <CardDescription>A list of all trade promotion schemes in your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Uplift (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.schemeName}</TableCell>
                  <TableCell>
                    <Badge variant={promo.status === 'Active' ? 'default' : promo.status === 'Upcoming' ? 'secondary' : 'outline'} className={promo.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30' : ''}>
                        {promo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{promo.type}</TableCell>
                  <TableCell>{promo.startDate}</TableCell>
                  <TableCell>{promo.endDate}</TableCell>
                  <TableCell className="text-right">{promo.uplift > 0 ? `${promo.uplift}%` : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Tabs>
  );
}
