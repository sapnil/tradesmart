
"use client";

import { useState } from "react";
import { analyzeCompetitorPromotion, AnalyzeCompetitorPromotionOutput } from "@/ai/flows/analyze-competitor-promotion";
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
import { Loader2, Sparkles, Wand2, Lightbulb, ThumbsUp, ThumbsDown, Target, Bot, ArrowRight } from "lucide-react";
import { Input } from "../ui/input";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  photoDataUri: z.string().optional(),
  promotionText: z.string().optional(),
})
.refine((data) => !!data.photoDataUri || !!data.promotionText, {
    message: 'Either a photo or promotion text must be provided.',
    path: ["promotionText"], // assign error to a specific field
});

export function CompetitorAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeCompetitorPromotionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        photoDataUri: "",
        promotionText: "Buy 2 Cool Cola 500ml and get 1 free.",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue("photoDataUri", dataUri);
        setPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await analyzeCompetitorPromotion(values);
      setResult(response);
    } catch (e) {
      setError("An error occurred while analyzing the promotion. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
            <CardTitle>Competitor's Offer</CardTitle>
            <CardDescription>Upload a photo or paste the text of the promotion.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                control={form.control}
                name="photoDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Photo</FormLabel>
                    <FormControl>
                        <Input type="file" accept="image/*" onChange={handleFileChange} className="pt-1.5"/>
                    </FormControl>
                    <FormMessage />
                    {preview && (
                        <div className="mt-4">
                            <Image src={preview} alt="Promotion preview" width={200} height={200} className="rounded-md object-contain" />
                        </div>
                    )}
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-4">
                <Separator className="flex-1"/>
                <span className="text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1"/>
              </div>
               <FormField
                control={form.control}
                name="promotionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Text</FormLabel>
                     <FormControl>
                        <Textarea placeholder="e.g. 'Buy One Get One Free on all juices'" {...field} rows={3}/>
                     </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Analyze with AI</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary"/>
                AI Analysis & Counter-Strategy
            </CardTitle>
            <CardDescription>The AI's assessment and recommended counter-offer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 min-h-[400px]">
            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {error && <p className="text-destructive">{error}</p>}
            
            {result ? (
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="counter">Counter-Promotion</TabsTrigger>
                </TabsList>
                <TabsContent value="analysis" className="pt-4 space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-base flex items-center gap-2"><Target /> Competitor Strategy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{result.strategy}</p>
                        </CardContent>
                    </Card>
                     <div className="grid grid-cols-2 gap-4">
                        <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2"><ThumbsUp className="text-green-500"/> Strengths</CardTitle>
                             </CardHeader>
                             <CardContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {result.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                             </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2"><ThumbsDown className="text-red-500"/> Weaknesses</CardTitle>
                             </CardHeader>
                             <CardContent>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {result.analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                             </CardContent>
                        </Card>
                     </div>
                </TabsContent>
                <TabsContent value="counter" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bot /> {result.counterPromotion.schemeName}</CardTitle>
                            <CardDescription>{result.counterPromotion.schemeDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <h4 className="font-semibold text-sm">Mechanics</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                                    {result.counterPromotion.promotionMechanics.map((m, i) => <li key={i}>{m}</li>)}
                                </ul>
                            </div>
                            <Button asChild size="sm">
                                <Link href={{
                                    pathname: '/promotions/create',
                                    query: {
                                        schemeName: result.counterPromotion.schemeName,
                                    }
                                }}>
                                    Create this Promotion
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
              </Tabs>
            ) : !loading && <div className="text-center text-muted-foreground p-8">Your analysis will be displayed here.</div>}
          </CardContent>
        </Card>
    </div>
  );
}
