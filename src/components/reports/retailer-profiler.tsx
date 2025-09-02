
"use client";

import { useState } from "react";
import { profileRetailers, ProfileRetailersOutput } from "@/ai/flows/profile-retailers";
import { orders, promotions, organizationHierarchy } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RetailerProfile = ProfileRetailersOutput['highPotentialRetailers'][0];

export function RetailerProfiler() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileRetailersOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await profileRetailers({
        ordersJson: JSON.stringify(orders, null, 2),
        promotionsJson: JSON.stringify(promotions, null, 2),
        organizationHierarchyJson: JSON.stringify(organizationHierarchy, null, 2),
      });
      setResult(response);
    } catch (e) {
      setError("An error occurred while profiling retailers. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const renderProfileTable = (profiles: RetailerProfile[]) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Distributor</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-center">Promotions Joined</TableHead>
                    <TableHead>AI Reasoning</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {profiles.map((profile) => (
                    <TableRow key={profile.retailerId}>
                        <TableCell className="font-medium">{profile.retailerName}</TableCell>
                        <TableCell>{profile.distributorName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(profile.totalOrderValue)}</TableCell>
                        <TableCell className="text-center">{profile.promotionParticipationCount}</TableCell>
                        <TableCell className="text-muted-foreground">{profile.reasoning}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
  };

  return (
    <div className="space-y-8">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Sparkles className="w-8 h-8 text-primary"/>
                    AI-Powered Retailer Profiling
                </CardTitle>
                <CardDescription>
                    Analyze retailer performance to uncover growth opportunities and risks.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleAnalysis} disabled={loading} size="lg">
                    {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Retailer Data...
                    </>
                    ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Profile Report
                    </>
                    )}
                </Button>
            </CardContent>
        </Card>
      
        <Card>
            <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>AI-driven segmentation of your retailer base.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
                {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
                {error && <p className="text-destructive">{error}</p>}
                
                {result ? (
                    <Tabs defaultValue="high-potential">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="high-potential" className="gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                High Potential ({result.highPotentialRetailers.length})
                            </TabsTrigger>
                            <TabsTrigger value="low-response" className="gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                Low Response ({result.lowResponseRetailers.length})
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="high-potential" className="pt-4">
                            {result.highPotentialRetailers.length > 0 ? (
                                renderProfileTable(result.highPotentialRetailers)
                            ) : (
                                <p className="text-center text-muted-foreground p-8">No high-potential retailers identified.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="low-response" className="pt-4">
                             {result.lowResponseRetailers.length > 0 ? (
                                renderProfileTable(result.lowResponseRetailers)
                            ) : (
                                <p className="text-center text-muted-foreground p-8">No low-response retailers identified.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : !loading && (
                    <div className="text-center text-muted-foreground p-8">Click the generate button to begin the analysis.</div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
