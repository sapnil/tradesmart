"use client";

import { useState } from "react";
import { generatePromotionScheme, GeneratePromotionSchemeOutput } from "@/ai/flows/generate-promotion-scheme";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Bot } from "lucide-react";

const formSchema = z.object({
  objective: z.string().min(10, { message: "Objective must be at least 10 characters." }),
  productCategory: z.string().min(3, { message: "Product category is required." }),
  trendAnalysis: z.string().min(10, { message: "Trend analysis is required." }),
});

export function SchemeGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratePromotionSchemeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objective: "Avoid a trade slump and increase market share by 10% in the next quarter.",
      productCategory: "Carbonated Soft Drinks",
      trendAnalysis: "Sales data shows a 15% dip in the last two months, especially in urban areas. Competitors are running aggressive summer campaigns.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const scheme = await generatePromotionScheme(values);
      setResult(scheme);
    } catch (e) {
      setError("An error occurred while generating the scheme. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
            <CardTitle>AI Scheme Assistant</CardTitle>
            <CardDescription>Fill in the details below to generate a new promotion scheme.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Objective</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Increase sales volume" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Beverages, Snacks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trendAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trend Analysis Summary</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide sales trends, market info, competitor actions" {...field} rows={4} />
                    </FormControl>
                     <FormDescription>
                        A brief summary of current market conditions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Scheme...
                  </>
                ) : (
                    <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary"/>
                Generated Promotion Scheme
            </CardTitle>
            <CardDescription>The AI-generated scheme will appear below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {error && <p className="text-destructive">{error}</p>}
            {result ? (
              <div className="space-y-4 text-sm">
                <h3 className="font-bold text-lg text-primary">{result.schemeName}</h3>
                <div>
                    <h4 className="font-semibold">Description</h4>
                    <p className="text-muted-foreground">{result.schemeDescription}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">Target Audience</h4>
                    <p className="text-muted-foreground">{result.targetAudience}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Mechanics</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                        {result.promotionMechanics.map((mech, i) => <li key={i}>{mech}</li>)}
                    </ul>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <h4 className="font-semibold">Duration</h4>
                        <p className="text-muted-foreground">{result.duration}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Budget</h4>
                        <p className="text-muted-foreground">{result.budget}</p>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold">Expected Results</h4>
                    <p className="text-muted-foreground">{result.expectedResults}</p>
                </div>
              </div>
            ) : !loading && <div className="text-center text-muted-foreground p-8">Your generated scheme will be displayed here.</div>}
          </CardContent>
        </Card>
    </div>
  );
}
