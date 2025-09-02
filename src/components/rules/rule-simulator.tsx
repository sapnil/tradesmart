
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
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { orders, promotions, organizationHierarchy, productHierarchy } from "@/lib/data";
import { applyPromotionRules, ApplyPromotionRulesOutput } from "@/ai/flows/apply-promotion-rules";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  orderId: z.string().min(1, { message: "Please select an order." }),
});

export function RuleSimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplyPromotionRulesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const selectedOrderId = form.watch("orderId");
  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  
  const getPromotion = (promotionId?: string) => {
    if (!promotionId) return null;
    return promotions.find((p) => p.id === promotionId);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setError(null);
    const order = orders.find(o => o.id === values.orderId);
    if (!order) {
        setError("Could not find selected order.");
        setLoading(false);
        return;
    }

    try {
      const activePromotions = promotions.filter(p => p.status === 'Active');
      const input = {
          orderJson: JSON.stringify(order, null, 2),
          promotionsJson: JSON.stringify(activePromotions, null, 2),
          organizationHierarchyJson: JSON.stringify(organizationHierarchy, null, 2),
          productHierarchyJson: JSON.stringify(productHierarchy, null, 2),
      };

      const response = await applyPromotionRules(input);
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
            <CardDescription>Select an order to simulate rule evaluation against active promotions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select an Order</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order to simulate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            Order {order.id} ({order.distributorName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading || !selectedOrderId} className="w-full">
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
          {selectedOrder && (
              <Card className="bg-muted/50">
                  <CardHeader>
                      <CardTitle className="text-lg">Order Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                       <p><strong>ID:</strong> <Link href={`/orders/${selectedOrder.id}`} className="text-primary hover:underline">{selectedOrder.id}</Link></p>
                       <p><strong>Distributor:</strong> {selectedOrder.distributorName}</p>
                       <p><strong>Date:</strong> {selectedOrder.date}</p>
                       <p><strong>Items:</strong></p>
                       <ul className="list-disc list-inside pl-4 text-muted-foreground">
                            {selectedOrder.items.map((item, i) => <li key={i}>{item.quantity} x {item.productId}</li>)}
                       </ul>
                  </CardContent>
              </Card>
          )}
        </CardContent>
      </Card>
      
      <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary"/>
                Simulation Result
            </CardTitle>
            <CardDescription>The AI will determine the best promotion and explain its reasoning.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[400px]">
            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {error && <p className="text-destructive">{error}</p>}
            
            {result && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Outcome</h4>
                  {result.bestPromotionId ? (
                    <div className="flex flex-col items-start gap-2">
                        <p>The best promotion to apply is:</p>
                        <Badge variant="default" className="text-base px-3 py-1 bg-green-500/20 text-green-700 border-green-500/20">
                            <Link href={`/promotions/${result.bestPromotionId}/edit`} className="hover:underline">
                                {getPromotion(result.bestPromotionId)?.schemeName} ({result.bestPromotionId})
                            </Link>
                        </Badge>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No applicable promotion found for this order.</p>
                  )}
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md">
                    <h4 className="font-semibold mt-0">Reasoning</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.reasoning}</p>
                </div>
              </div>
            )}
            {!loading && !result && <div className="text-center text-muted-foreground p-8">Your simulation result will be displayed here.</div>}
          </CardContent>
        </Card>
    </div>
  );
}
