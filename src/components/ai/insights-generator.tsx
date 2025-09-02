"use client";

import { useState } from "react";
import { providePromotionInsights, ProvidePromotionInsightsOutput } from "@/ai/flows/provide-promotion-insights";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  salesData: z.string().min(10, { message: "Please provide sales data." }),
  marketTrends: z.string().min(10, { message: "Please provide market trends." }),
  promotionHistory: z.string().optional(),
});

const exampleSalesData = JSON.stringify(
  [
    { product: "Cool Cola 300ml", month: "Jan", sales: 12000, region: "North" },
    { product: "Cool Cola 300ml", month: "Feb", sales: 11500, region: "North" },
    { product: "Zesty Orange 500ml", month: "Jan", sales: 8000, region: "North" },
    { product: "Zesty Orange 500ml", month: "Feb", sales: 9500, region: "North" },
  ],
  null,
  2
);

const exampleMarketTrends = JSON.stringify(
  [
    { trend: "Growing demand for 'zero sugar' options." },
    { trend: "Competitor 'FizzUp' launched a BOGO offer on their 500ml SKUs." },
    { trend: "Increased consumer activity on e-commerce platforms for beverages." },
  ],
  null,
  2
);

export function InsightsGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProvidePromotionInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesData: exampleSalesData,
      marketTrends: exampleMarketTrends,
      promotionHistory: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const insights = await providePromotionInsights(values);
      setResult(insights);
    } catch (e) {
      setError("An error occurred while generating insights. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
            <CardTitle>Generate Insights</CardTitle>
            <CardDescription>Provide data to get AI-powered recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="salesData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter sales data" {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketTrends"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Trends (JSON)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter market trends" {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promotionHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion History (JSON, Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter past promotion performance data" {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Get Insights"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Actionable insights from your data.</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            {loading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />}
            {error && <p className="text-destructive">{error}</p>}
            {result ? <p>{result.insights}</p> : !loading && <p className="text-muted-foreground">Insights will appear here once generated.</p>}
          </CardContent>
        </Card>
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested strategies based on the insights.</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            {loading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />}
            {error && <p className="text-destructive">{error}</p>}
            {result ? <p>{result.recommendations}</p> : !loading && <p className="text-muted-foreground">Recommendations will appear here once generated.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
