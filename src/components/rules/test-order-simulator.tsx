
"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Wand2, PlusCircle, Trash2, CheckCircle, XCircle } from "lucide-react";
import { organizationHierarchy, productHierarchy, promotions, products } from "@/lib/data";
import { applyPromotionRules } from "@/ai/flows/apply-promotion-rules";
import { ApplyPromotionRulesOutput } from "@/types/promotions";
import Link from "next/link";
import { Separator } from "../ui/separator";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const formSchema = z.object({
  distributorId: z.string().min(1, { message: "Please select a distributor." }),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item."),
});

export function TestOrderSimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplyPromotionRulesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        distributorId: "",
        items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setError(null);
    
    const distributor = organizationHierarchy.find(d => d.id === values.distributorId);
    if (!distributor) {
        setError("Distributor not found.");
        setLoading(false);
        return;
    }

    // Construct a simplified order object for the AI
    const testOrder = {
        id: `TEST-${Date.now()}`,
        distributorName: distributor.name,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: values.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                ...item,
                price: product ? Math.random() * 50 + 10 : 0 // Add random price for simulation
            }
        }),
        amount: 0 // Amount will be calculated by AI or is not needed for this simulation
    };

    try {
      const input = {
          orderJson: JSON.stringify(testOrder, null, 2),
          promotionsJson: JSON.stringify(promotions.filter(p => p.status === 'Active'), null, 2),
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
            <CardTitle>Build a Test Order</CardTitle>
            <CardDescription>Select a distributor and add products to simulate an order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="distributorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Distributor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a distributor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationHierarchy.filter(h => h.level === 'Distributor').map((dist) => (
                          <SelectItem key={dist.id} value={dist.id}>
                            {dist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div>
                <FormLabel>Order Items</FormLabel>
                 <div className="space-y-4 pt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end border p-4 rounded-md relative">
                            <FormField
                                control={form.control}
                                name={`items.${index}.productId`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="text-xs">Product</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a product" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name}
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
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs">Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 10" {...field} className="w-24" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1})}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                 </div>
              </div>
              
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
                Simulation Result
            </CardTitle>
            <CardDescription>The AI's evaluation of the best promotion for your test order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 min-h-[400px]">
            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {error && <p className="text-destructive">{error}</p>}
            
            {result && (
              <div className="space-y-6">
                <Card>
                    <CardHeader className="p-4">
                        <CardTitle className="flex items-center gap-2">
                            {result.bestPromotionId ? 
                                <CheckCircle className="h-6 w-6 text-green-500"/> :
                                <XCircle className="h-6 w-6 text-red-500" />
                            }
                             {result.bestPromotionId ? "Promotion Applied" : "No Promotion Applied"}
                        </CardTitle>
                    </CardHeader>
                     {result.bestPromotionId && (
                        <CardContent className="p-4 pt-0">
                           <p className="text-sm">
                                Best matched promotion:
                                <Link href={`/promotions/${result.bestPromotionId}/edit`} className="font-semibold text-primary hover:underline ml-1">
                                    {promotions.find(p => p.id === result.bestPromotionId)?.schemeName || result.bestPromotionId}
                                </Link>
                           </p>
                        </CardContent>
                     )}
                </Card>
                
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
