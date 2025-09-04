
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type Budget, type PromotionType, promotionTypes } from "@/types";
import { organizationHierarchy, productHierarchy, initialBudgets } from "@/lib/data";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(3, "Budget name must be at least 3 characters."),
  period: z.string().min(1, "Period is required."),
  totalAmount: z.coerce.number().min(1, "Total amount must be greater than 0."),
  parentId: z.string().optional(),
  targetIds: z.array(z.string()).optional(),
  promotionTypes: z.array(z.string()).optional(),
});

type BudgetFormValues = z.infer<typeof formSchema>;

export function BudgetForm({ budget }: { budget?: Budget }) {
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

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: budget?.name || "",
      period: budget?.period || "",
      totalAmount: budget?.totalAmount || 0,
      parentId: budget?.parentId || undefined,
      targetIds: budget?.targetIds || [],
      promotionTypes: budget?.promotionTypes || [],
    },
  });

  const allTargets = [...organizationHierarchy, ...productHierarchy];
  
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
    const isEditing = !!budget;
    const newBudgetId = isEditing ? budget.id : `BUD-${Date.now()}`;
    
    const newBudget: Budget = {
      id: newBudgetId,
      name: data.name,
      period: data.period,
      totalAmount: data.totalAmount,
      allocatedAmount: budget?.allocatedAmount || 0,
      spentAmount: budget?.spentAmount || 0,
      targetIds: data.targetIds || [],
      promotionTypes: (data.promotionTypes as PromotionType[]) || [],
      parentId: data.parentId === 'none' ? undefined : data.parentId,
    };
    
    const existingBudgets: Budget[] = JSON.parse(localStorage.getItem('budgets') || JSON.stringify(initialBudgets));

    let updatedBudgets: Budget[];

    if(isEditing) {
        updatedBudgets = existingBudgets.map(b => b.id === newBudgetId ? newBudget : b);
    } else {
        updatedBudgets = [...existingBudgets, newBudget];
    }

    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));

    toast({
        title: `Budget ${isEditing ? "Updated" : "Created"}`,
        description: `The budget "${data.name}" has been successfully saved.`,
    });
    
    router.push('/budgets');
  };

  return (
    <Card>
        <CardContent className="pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                        {budgets.filter(b => b.id !== budget?.id).map(budget => (
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
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit">Save Budget</Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
