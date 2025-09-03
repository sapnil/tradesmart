
"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { promotions, organizationHierarchy, organizationGroups } from "@/lib/data";
import { File, ListFilter, PlusCircle, Trash, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { type Promotion, type DistributorInfo } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { generateNotification } from "@/ai/flows/generate-notification";


export default function PromotionsPage() {
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState<string | null>(null);

  const getTargetedDistributors = (promotion: Promotion): DistributorInfo[] => {
    const targetedDistributorIds = new Set<string>();

    const allDistributors = organizationHierarchy.filter(h => h.level === 'Distributor');
    const distributorsById = new Map(allDistributors.map(d => [d.id, d]));

    const hierarchyIdSet = new Set(promotion.hierarchyIds);
    const nodesToProcess = organizationHierarchy.filter(h => hierarchyIdSet.has(h.id));
    const processedNodes = new Set<string>();

    while(nodesToProcess.length > 0) {
        const node = nodesToProcess.pop();
        if (!node || processedNodes.has(node.id)) continue;
        processedNodes.add(node.id);

        if (node.level === 'Distributor') {
            targetedDistributorIds.add(node.id);
        } else {
            organizationHierarchy
                .filter(child => child.parentId === node.id)
                .forEach(child => nodesToProcess.push(child));
        }
    }

    if (promotion.organizationGroupIds) {
        const groupMembers = organizationGroups
            .filter(g => promotion.organizationGroupIds?.includes(g.id))
            .flatMap(g => g.memberIds);
        
        groupMembers.forEach(memberId => {
            if(distributorsById.has(memberId)) {
                targetedDistributorIds.add(memberId);
            }
        });
    }

    return Array.from(targetedDistributorIds)
        .map(id => {
            const distributor = distributorsById.get(id);
            if (!distributor) return null;
            return {
                id,
                name: distributor.name,
                email: `${distributor.name.toLowerCase().replace(/ /g, '.')}@example.com`,
            };
        })
        .filter((d): d is DistributorInfo => d !== null);
  };

  const handleNotify = async (promotion: Promotion) => {
    setIsNotifying(promotion.id);
    try {
        const targetedDistributors = getTargetedDistributors(promotion);
        if (targetedDistributors.length === 0) {
            toast({
                title: "No distributors to notify",
                description: "This promotion does not target any specific distributors.",
                variant: "destructive"
            });
            return;
        }

        await generateNotification({
            promotionJson: JSON.stringify(promotion, null, 2),
            distributorsJson: JSON.stringify(targetedDistributors, null, 2),
        });

        toast({
            title: "Notifications Sent!",
            description: `A notification has been queued for ${targetedDistributors.length} targeted distributors.`
        });

    } catch (error) {
        console.error("Failed to send notifications:", error);
        toast({
            title: "Notification Failed",
            description: "An error occurred while sending notifications.",
            variant: "destructive",
        });
    } finally {
        setIsNotifying(null);
    }
  };

  const onDelete = (promotion: Promotion) => {
    // In a real app, you'd call an API here.
    console.log("Deleting promotion", promotion.id);
    toast({
        title: "Promotion deleted",
        description: `The promotion "${promotion.schemeName}" has been deleted.`,
        variant: "destructive",
    });
  };


  return (
    <>
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
              <Link href="/promotions/create">
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">
                    <Link href={`/promotions/${promo.id}/edit`} className="hover:underline">
                      {promo.schemeName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.status === 'Active' ? 'default' : promo.status === 'Upcoming' ? 'secondary' : 'outline'} className={promo.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30' : ''}>
                        {promo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{promo.type}</TableCell>
                  <TableCell>{promo.startDate}</TableCell>
                  <TableCell>{promo.endDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isNotifying === promo.id}>
                              {isNotifying === promo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Notifications</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This will generate and send a notification for &quot;{promo.schemeName}&quot; to all targeted distributors. Are you sure you want to continue?
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleNotify(promo)}>
                                  Send Notifications
                              </AlertDialogAction>
                          </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                promotion &quot;{promo.schemeName}&quot;.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(promo)}>
                                Delete
                              </AlertDialogAction>
                          </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
