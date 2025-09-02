
"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Sparkles, Wand2, CheckCircle, XCircle } from "lucide-react";
import { orders, organizationHierarchy, productHierarchy } from "@/lib/data";
import { executeDynamicRule } from "@/ai/flows/execute-dynamic-rule";
import { Rule, ExecuteDynamicRuleOutput } from "@/types/rules";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  ruleId: z.string().min(1, { message: "Please select a rule." }),
  orderId: z.string().min(1, { message: "Please select an order." }),
});

export function DynamicRuleSimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecuteDynamicRuleOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedRules, setSavedRules] = useState<Rule[]>([]);

  useEffect(() => {
    // Load rules from localStorage on component mount
    const rulesFromStorage = localStorage.getItem("dynamicRules");
    if (rulesFromStorage) {
      setSavedRules(JSON.parse(rulesFromStorage));
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setError(null);

    const selectedRule = savedRules.find(r => r.id === values.ruleId);
    const selectedOrder = orders.find(o => o.id === values.orderId);

    if (!selectedRule || !selectedOrder) {
        setError("Selected rule or order not found.");
        setLoading(false);
        return;
    }
    
    try {
      const input = {
          ruleJson: JSON.stringify(selectedRule, null, 2),
          orderJson: JSON.stringify(selectedOrder, null, 2),
          organizationHierarchyJson: JSON.stringify(organizationHierarchy, null, 2),
          productHierarchyJson: JSON.stringify(productHierarchy, null, 2),
      };

      const response = await executeDynamicRule(input);
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
            <CardDescription>Select a dynamic rule and an order to test.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="ruleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Dynamic Rule</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rule to simulate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {savedRules.length > 0 ? savedRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.name}
                          </SelectItem>
                        )) : <SelectItem value="none" disabled>No saved rules found</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Order</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order to test against" />
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
                AI Simulation Result
            </CardTitle>
            <CardDescription>The AI's evaluation of the rule against the order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[400px]">
            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {error && <p className="text-destructive">{error}</p>}
            
            {result && (
              <div className="space-y-6">
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2">
                            {result.isApplicable ? 
                                <CheckCircle className="h-6 w-6 text-green-500"/> :
                                <XCircle className="h-6 w-6 text-red-500" />
                            }
                            Rule is {result.isApplicable ? "Applicable" : "Not Applicable"}
                        </CardTitle>
                    </CardHeader>
                </Card>
                
                {result.isApplicable && result.appliedActions.length > 0 && (
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Applied Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                            {result.appliedActions.map((action, i) => (
                                <Badge key={i} variant="secondary">{action.description}</Badge>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md">
                    <h4 className="font-semibold mt-0">AI Reasoning</h4>
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
