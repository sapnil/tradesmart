

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Wallet, Calendar, Tag, Trash2, Edit, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { type Budget, type PromotionType, promotionTypes } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { organizationHierarchy, productHierarchy, initialBudgets } from "@/lib/data";

const formSchema = z.object({
  name: z.string().min(3, "Budget name must be at least 3 characters."),
  period: z.string().min(1, "Period is required."),
  totalAmount: z.coerce.number().min(1, "Total amount must be greater than 0."),
  parentId: z.string().optional(),
  targetIds: z.array(z.string()).optional(),
  promotionTypes: z.array(z.string()).optional(),
});

type BudgetFormValues = z.infer<typeof formSchema>;

export function BudgetManager() {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      period: "",
      totalAmount: 0,
      parentId: undefined,
      targetIds: [],
      promotionTypes: [],
    },
  });
  
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

  const handleMultiSelectChange = (
    fieldName: "targetIds" | "promotionTypes", 
    value: string
    ) => {
    const currentValues = form.getValues(fieldName) || [];
    if (currentValues.includes(value)) {
      form.setValue(fieldName, currentValues.filter((v) => v !== value));
    } else {
      form.setValue(fieldName, [...currentValues, value]);
    }
  };


  const onSubmit = (data: BudgetFormValues) => {
    const newBudget: Budget = {
      id: `BUD-${Date.now()}`,
      name: data.name,
      period: data.period,
      totalAmount: data.totalAmount,
      allocatedAmount: 0,
      spentAmount: 0,
      targetIds: data.targetIds || [],
      promotionTypes: (data.promotionTypes as PromotionType[]) || [],
      parentId: data.parentId === 'none' ? undefined : data.parentId,
    };
    
    let updatedBudgets = [...budgets, newBudget];

    if (newBudget.parentId) {
        updatedBudgets = updatedBudgets.map(b => {
            if (b.id === newBudget.parentId) {
                return {
                    ...b,
                    allocatedAmount: b.allocatedAmount + data.totalAmount
                }
            }
            return b;
        })
    }

    setBudgets(updatedBudgets);
    toast({
        title: "Budget Created",
        description: `The budget "${data.name}" has been successfully created.`,
    });
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
       <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Trade Budgets</CardTitle>
                    <CardDescription>A list of all promotional budgets.</CardDescription>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                        <PlusCircle className="mr-2" />
                        Create New Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Create New Budget</DialogTitle>
                        <DialogDescription>
                            Define the name, period, and total amount for your new budget.
                        </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="parentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent Budget (Optional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a parent budget" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">No Parent</SelectItem>
                                                    {budgets.map(budget => (
                                                        <SelectItem key={budget.id} value={budget.id}>
                                                            {budget.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Budget Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Q4 National Beverage Budget" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Period</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Q4 2024 or FY 2024-25" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Total Amount (INR)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 1000000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Targets (Optional)</FormLabel>
                                            <Select onValueChange={(value) => handleMultiSelectChange("targetIds", value)}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select targets (e.g., regions, brands)" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {allTargets.map((target) => (
                                                        <SelectItem key={target.id} value={target.id}>
                                                        {target.name} ({target.level})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                             <div className="flex flex-wrap gap-2 pt-2">
                                                {field.value?.map(id => {
                                                    const item = allTargets.find(h => h.id === id);
                                                    return item ? (
                                                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                                            {item.name}
                                                            <button type="button" onClick={() => handleMultiSelectChange("targetIds", id)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                                <X className="h-3 w-3"/>
                                                            </button>
                                                        </Badge>
                                                    ) : null
                                                })}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="promotionTypes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Allowed Promotion Types (Optional)</FormLabel>
                                            <Select onValueChange={(value) => handleMultiSelectChange("promotionTypes", value)}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select promotion types" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {promotionTypes.map((type) => (
                                                        <SelectItem key={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                             <div className="flex flex-wrap gap-2 pt-2">
                                                {field.value?.map(type => (
                                                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                                                        {type}
                                                        <button type="button" onClick={() => handleMultiSelectChange("promotionTypes", type)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                            <X className="h-3 w-3"/>
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit">Create Budget</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
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
