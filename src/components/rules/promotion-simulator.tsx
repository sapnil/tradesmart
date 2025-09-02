

"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Wand2, Users, Percent, DollarSign } from "lucide-react";
import { orders, promotions, organizationHierarchy, salesData } from "@/lib/data";
import { simulatePromotionImpact } from "@/ai/flows/simulate-promotion-impact";
import { SimulatePromotionImpactOutput } from "@/types/promotions";

const formSchema = z.object({
  promotionId: z.string().min(1, { message: "Please select a promotion." }),
  hierarchyId: z.string().min(1, { message: "Please select a hierarchy level." }),
});

export function PromotionSimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulatePromotionImpactOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
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
      const input = {
          ...values,
          promotionsJson: JSON.stringify(promotions, null, 2),
          organizationHierarchyJson: JSON.stringify(organizationHierarchy, null, 2),
          historicalSalesJson: JSON.stringify(salesData, null, 2),
          ordersJson: JSON.stringify(orders, null, 2),
      };

      const response = await simulatePromotionImpact(input);
      setResult(response);
    } catch (e) {
      setError("An error occurred during simulation. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
            <CardTitle>Simulation Setup</CardTitle>
            <CardDescription>Select a promotion and an organizational level to simulate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="promotionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Promotion</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a promotion to simulate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {promotions.map((promo) => (
                          <SelectItem key={promo.id} value={promo.id}>
                            {promo.schemeName}
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
                name="hierarchyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Organization Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region, state, or area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationHierarchy.filter(h => h.level !== 'Retailer').map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name} ({h.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading || !form.formState.isValid} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                    <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
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
                Simulation Forecast
            </CardTitle>
            <CardDescription>The AI's prediction of the promotion's impact in the selected area.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[400px]">
            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {error && <p className="text-destructive">{error}</p>}
            
            {result && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Predicted Uplift</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{result.predictedUplift.toFixed(2)}%</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Est. Financial Impact</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(result.estimatedFinancialImpact)}</div>
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Likely Participating Distributors</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <div className="flex flex-wrap gap-2 pt-2">
                            {result.participatingDistributors.map((name, i) => (
                                <span key={i} className="text-sm font-medium">{name}{i < result.participatingDistributors.length - 1 ? ',' : ''}</span>
                            ))}
                            {result.participatingDistributors.length === 0 && (
                                <p className="text-sm text-muted-foreground">No specific distributors likely to participate based on historical data.</p>
                            )}
                           </div>
                        </CardContent>
                    </Card>
                 </div>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md">
                    <h4 className="font-semibold mt-0">AI Reasoning</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.reasoning}</p>
                </div>
              </div>
            )}
            {!loading && !result && <div className="text-center text-muted-foreground p-8">Your simulation forecast will be displayed here.</div>}
          </CardContent>
        </Card>
    </div>
  );
}
