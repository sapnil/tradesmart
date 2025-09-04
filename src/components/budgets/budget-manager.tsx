
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";


export function BudgetManager() {
  const { toast } = useToast();
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    // Load budgets from localStorage on component mount
    const storedBudgets = localStorage.getItem('budgets');
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    } else {
      setBudgets(initialBudgets);
    }
  }, []);

  const saveBudgets = (updatedBudgets: Budget[]) => {
    setBudgets(updatedBudgets);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
  };
  
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

  const handleDelete = (budgetId: string) => {
    const budgetToDelete = budgets.find(b => b.id === budgetId);
    if (!budgetToDelete) return;

    // Prevent deletion if it has children
    const hasChildren = budgets.some(b => b.parentId === budgetId);
    if (hasChildren) {
        toast({
            title: "Cannot Delete Budget",
            description: `Budget "${budgetToDelete.name}" has child budgets. Please delete or reassign them first.`,
            variant: "destructive",
        });
        return;
    }

    const updatedBudgets = budgets.filter(b => b.id !== budgetId);
    saveBudgets(updatedBudgets);

    toast({
        title: "Budget Deleted",
        description: `The budget "${budgetToDelete.name}" has been deleted.`,
    });
  };

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
                                        )) : <span className="text-muted-foreground">Any</span>}
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
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/budgets/edit/${budget.id}`}><Edit className="h-4 w-4"/></Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the budget "{budget.name}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(budget.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {budgets.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        No budgets found. <Link href="/budgets/create" className="text-primary hover:underline">Create one now</Link>.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
