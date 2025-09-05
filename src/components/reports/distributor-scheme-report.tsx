
"use client";

import { useState, useMemo } from "react";
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
  promotions,
  organizationHierarchy,
  organizationGroups,
} from "@/lib/data";
import Link from "next/link";
import { type Promotion, type OrganizationHierarchy, type PromotionLevel } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DistributorSchemeReport() {
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const distributors = organizationHierarchy.filter(h => h.level === 'Distributor');

  const getDistributorAncestors = (distributorId: string, hierarchy: OrganizationHierarchy[]): Set<string> => {
    const ancestors = new Set<string>();
    let currentNode = hierarchy.find(h => h.id === distributorId);
    while(currentNode) {
        ancestors.add(currentNode.id);
        currentNode = hierarchy.find(h => h.id === currentNode?.parentId);
    }
    return ancestors;
  }

  const getDistributorGroups = (distributorId: string): string[] => {
    return organizationGroups
        .filter(g => g.memberIds.includes(distributorId))
        .map(g => g.id);
  }

  const targetedSchemes = useMemo<Promotion[]>(() => {
    if (!selectedDistributorId) return [];

    const distributorHierarchyIds = getDistributorAncestors(selectedDistributorId, organizationHierarchy);
    const distributorGroupIds = new Set(getDistributorGroups(selectedDistributorId));
    
    let allTargeted = promotions.filter(promo => {
        const hierarchyMatch = promo.hierarchyIds.some(id => distributorHierarchyIds.has(id));
        const groupMatch = promo.organizationGroupIds?.some(id => distributorGroupIds.has(id));
        return hierarchyMatch || groupMatch;
    });

    if (selectedStatus !== 'all') {
        allTargeted = allTargeted.filter(promo => promo.status === selectedStatus);
    }
    
    if (selectedCategory !== 'all') {
        allTargeted = allTargeted.filter(promo => promo.promotionLevel === selectedCategory);
    }

    return allTargeted;

  }, [selectedDistributorId, selectedStatus, selectedCategory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distributor Scheme Report</CardTitle>
        <CardDescription>
          Select a distributor to see all the promotion schemes they are eligible for.
        </CardDescription>
        <div className="flex items-center gap-4 pt-4">
            <Select value={selectedDistributorId ?? ''} onValueChange={setSelectedDistributorId}>
                <SelectTrigger className="w-[380px]">
                    <SelectValue placeholder="Select a distributor" />
                </SelectTrigger>
                <SelectContent>
                    {distributors.map(dist => (
                        <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
            </Select>
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Secondary">Secondary</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheme Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedDistributorId ? (
                targetedSchemes.length > 0 ? (
                targetedSchemes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">
                        <Link href={`/promotions/${promo.id}/edit`} className="hover:underline text-primary">
                            {promo.schemeName}
                        </Link>
                    </TableCell>
                    <TableCell>
                        <Badge variant={promo.promotionLevel === 'Primary' ? 'default' : 'secondary'}>
                            {promo.promotionLevel}
                        </Badge>
                    </TableCell>
                    <TableCell>{promo.type}</TableCell>
                    <TableCell>
                      <Badge variant={promo.status === 'Active' ? 'default' : promo.status === 'Upcoming' ? 'secondary' : 'outline'} className={promo.status === 'Active' ? 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30' : ''}>
                          {promo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{promo.startDate}</TableCell>
                    <TableCell>{promo.endDate}</TableCell>
                  </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No schemes found for the selected criteria.
                    </TableCell>
                </TableRow>
            )
            ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Please select a distributor to see the report.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
