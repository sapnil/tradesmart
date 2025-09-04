
"use client";

import { useState } from "react";
import { allocatePromotionBudget, AllocatePromotionBudgetOutput } from "@/ai/flows/allocate-promotion-budget";
import { salesData, productHierarchy, organizationHierarchy, promotions, initialBudgets } from "@/lib/data";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Wand2, PlusCircle, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { type Budget } from "@/types";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  totalBudget: z.coerce.number().min(10000, { message: "Budget must be at least 10,000." }),
  allocationStrategy: z.enum(['Maximize ROI', 'Maximize Volume', 'Market Share Growth']),
});

const allocationStrategies = ['Maximize ROI', 'Maximize Volume', 'Market Share Growth'] as const;

export function BudgetAllocator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AllocatePromotionBudgetOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalBudget: 500000,
      allocationStrategy: 'Maximize ROI',
    },
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await allocatePromotionBudget({
        totalBudget: values.totalBudget,
        allocationStrategy: values.allocationStrategy,
        historicalSalesJson: JSON.stringify(salesData, null, 2),
        productHierarchyJson: JSON.stringify(productHierarchy, null, 2),
        organizationHierarchyJson: JSON.stringify(organizationHierarchy, null, 2),
        pastPromotionsJson: JSON.stringify(promotions.filter(p => p.status === 'Expired'), null, 2)
      });
      setResult(response);
    } catch (e) {
      setError("An error occurred while generating allocation. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateBudgets = () => {
    if (!result) return;
    const { totalBudget, allocationStrategy } = form.getValues();
    
    // Load existing budgets from local storage or start with initial data
    const existingBudgets: Budget[] = JSON.parse(localStorage.getItem('budgets') || JSON.stringify(initialBudgets));

    // Create the main parent budget
    const parentId = `BUD-${Date.now()}`;
    const parentBudget: Budget = {
        id: parentId,
        name: `Simulated Budget - ${allocationStrategy}`,
        period: "Simulated",
        totalAmount: totalBudget,
        allocatedAmount: 0,
        spentAmount: 0,
        targetIds: [],
        promotionTypes: [],
    };
    
    let totalAllocated = 0;
    const childBudgets: Budget[] = [];

    // Create child budgets from recommendations
    result.recommendations.forEach(rec => {
        const childId = `BUD-${Date.now()}-${Math.random()}`;
        const childBudget: Budget = {
            id: childId,
            name: `${rec.targetType} - ${rec.targetName}`,
            period: "Simulated",
            totalAmount: rec.allocatedBudget,
            allocatedAmount: 0,
            spentAmount: 0,
            targetIds: [], // This could be enhanced to map targetName to an ID
            promotionTypes: [],
            parentId: parentId,
        };
        childBudgets.push(childBudget);
        totalAllocated += rec.allocatedBudget;
    });

    parentBudget.allocatedAmount = totalAllocated;

    // Save all new budgets to local storage
    localStorage.setItem('budgets', JSON.stringify([...existingBudgets, parentBudget, ...childBudgets]));

    toast({
        title: "Budgets Created Successfully!",
        description: `${childBudgets.length + 1} new budgets have been created based on the AI recommendations.`,
    });

    router.push('/budgets');
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
            <CardTitle>Budget Details</CardTitle>
            <CardDescription>Provide your total budget and strategic goal.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Promotion Budget</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g. 500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="allocationStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocation Strategy</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allocationStrategies.map((strategy) => (
                          <SelectItem key={strategy} value={strategy}>
                            {strategy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose the primary goal for this budget.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Recommendations...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Allocate Budget with AI</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary"/>
                AI-Powered Allocation
            </CardTitle>
            <CardDescription>Recommended budget breakdown from the AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[400px]">
            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {error && <p className="text-destructive">{error}</p>}
            
            {result ? (
              <div className="space-y-6">
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md">
                    <h4 className="font-semibold mt-0">Strategy Summary</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Recommended Allocation</h4>
                   <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Target</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {result.recommendations.map((rec, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{rec.targetName}</TableCell>
                            <TableCell>{rec.targetType}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(rec.allocatedBudget)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                   </Table>
                </div>
                 <Button onClick={handleCreateBudgets}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Budgets from Recommendations
                </Button>
              </div>
            ) : !loading && <div className="text-center text-muted-foreground p-8">Your budget allocation will be displayed here.</div>}
          </CardContent>
        </Card>
    </div>
  );
}
