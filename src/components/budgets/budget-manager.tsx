
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
import { PlusCircle, Wallet, Calendar, Tag, Trash2, Edit } from "lucide-react";
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
import { type Budget } from "@/types";

const initialBudgets: Budget[] = [
    { id: 'BUD-001', name: 'Q3 North Region Beverage Budget', period: 'Q3 2024', totalAmount: 500000, allocatedAmount: 150000, spentAmount: 75000, targetIds: ['HIER-R1', 'CAT-1'] },
    { id: 'BUD-002', name: 'Annual Maharashtra Budget', period: '2024', totalAmount: 2000000, allocatedAmount: 800000, spentAmount: 650000, targetIds: ['HIER-S3'] },
    { id: 'BUD-003', name: 'Diwali Dhamaka Campaign', period: 'Q4 2024', totalAmount: 1000000, allocatedAmount: 0, spentAmount: 0, targetIds: [] },
];


const formSchema = z.object({
  name: z.string().min(3, "Budget name must be at least 3 characters."),
  period: z.string().min(1, "Period is required."),
  totalAmount: z.coerce.number().min(1, "Total amount must be greater than 0."),
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
    },
  });
  
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const onSubmit = (data: BudgetFormValues) => {
    const newBudget: Budget = {
      id: `BUD-${Date.now()}`,
      ...data,
      allocatedAmount: 0,
      spentAmount: 0,
      targetIds: [],
    };
    setBudgets((prev) => [...prev, newBudget]);
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
