

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { type Budget } from "@/types";
import { organizationHierarchy, productHierarchy, initialBudgets } from "@/lib/data";
import Link from "next/link";


export function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
    
  const getParentName = (parentId?: string) => {
    if (!parentId) return "N/A";
    return budgets.find(b => b.id === parentId)?.name || "Unknown";
  }

  const allTargets = [...organizationHierarchy, ...productHierarchy];
  
  const getTargetName = (targetId: string) => {
      return allTargets.find(t => t.id === targetId)?.name || "Unknown";
  }

  return (
    <div className="space-y-6">
       <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Trade Budgets</CardTitle>
                    <CardDescription>A list of all promotional budgets.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/budgets/create">
                        <PlusCircle className="mr-2" />
                        Create New Budget
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Budget Name</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Targets</TableHead>
                            <TableHead>Promotion Types</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead>Consumption</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {budgets.map(budget => (
                            <TableRow key={budget.id}>
                                <TableCell className="font-medium">{budget.name}</TableCell>
                                <TableCell>{getParentName(budget.parentId)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                        {budget.targetIds.length > 0 ? budget.targetIds.map(id => (
                                            <Badge key={id} variant="outline">{getTargetName(id)}</Badge>
                                        )) : <span className="text-muted-foreground">N/A</span>}
                                    </div>
                                </TableCell>
                                 <TableCell>
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                        {budget.promotionTypes.length > 0 ? budget.promotionTypes.map(type => (
                                            <Badge key={type} variant="outline">{type}</Badge>
                                        )) : <span className="text-muted-foreground">Any</span>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{budget.period}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(budget.totalAmount)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Progress value={(budget.spentAmount / budget.totalAmount) * 100} className="h-2"/>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(budget.spentAmount)} spent of {formatCurrency(budget.totalAmount)}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
