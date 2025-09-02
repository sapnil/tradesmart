
"use client";

import { useState } from "react";
import { detectOrderAnomalies, DetectOrderAnomaliesOutput } from "@/ai/flows/detect-order-anomalies";
import { orders, promotions } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, Sparkles, AlertTriangle, Eye, ShieldCheck, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";


export function AnomalyDetector() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectOrderAnomaliesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetection = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await detectOrderAnomalies({
        ordersJson: JSON.stringify(orders, null, 2),
        promotionsJson: JSON.stringify(promotions, null, 2),
      });
      setResult(response);
    } catch (e) {
      setError("An error occurred while detecting anomalies. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
        case 'High':
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case 'Medium':
            return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        case 'Low':
            return <Eye className="h-4 w-4 text-blue-500" />;
    }
  }

  const getSeverityClass = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
        case 'High':
            return "bg-red-500/20 text-red-700 border-red-500/20";
        case 'Medium':
            return "bg-yellow-500/20 text-yellow-700 border-yellow-500/20";
        case 'Low':
            return "bg-blue-500/20 text-blue-700 border-blue-500/20";
    }
  }


  return (
    <div className="space-y-8">
        <Card className="text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <ShieldAlert className="w-8 h-8 text-primary"/>
                    AI-Powered Anomaly Detection
                </CardTitle>
                <CardDescription>
                    Analyze the last 100 orders to identify patterns of scheme misuse or potential fraud.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleDetection} disabled={loading} size="lg">
                    {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning for Anomalies...
                    </>
                    ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Scan Recent Orders
                    </>
                    )}
                </Button>
            </CardContent>
        </Card>
      
        <Card>
            <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>Suspicious activities identified by the AI will be listed below.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
                {loading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
                {error && <p className="text-destructive">{error}</p>}
                
                {result ? (
                    result.anomalies.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Distributor</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Recommendation</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.anomalies.map((anomaly, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Badge className={cn("gap-1.5", getSeverityClass(anomaly.severity))}>
                                                {getSeverityIcon(anomaly.severity)}
                                                {anomaly.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/orders/${anomaly.orderId}`} className="text-primary hover:underline">
                                                {anomaly.orderId}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{anomaly.distributorName}</TableCell>
                                        <TableCell>{anomaly.reason}</TableCell>
                                        <TableCell>{anomaly.recommendation}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/orders/${anomaly.orderId}`}>
                                                    Review
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                           <ShieldCheck className="w-16 h-16 text-green-500" />
                           <h3 className="text-xl font-semibold">No Anomalies Found</h3>
                           <p className="text-muted-foreground max-w-sm">The AI has scanned the recent orders and found no suspicious patterns. Everything looks to be in order.</p>
                        </div>
                    )
                ) : !loading && (
                    <div className="text-center text-muted-foreground p-8">Click the scan button to begin the analysis.</div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
