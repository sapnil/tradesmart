
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sentNotifications, promotions, organizationHierarchy } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function SentNotificationsViewer() {
  const [selectedPromotion, setSelectedPromotion] = useState<string>('all');
  const [selectedDistributor, setSelectedDistributor] = useState<string>('all');

  const uniquePromotions = [...new Set(sentNotifications.map(n => n.promotionName))];
  const uniqueDistributors = [...new Set(sentNotifications.map(n => n.distributorName))];

  const filteredNotifications = sentNotifications.filter(notification => {
    const promotionMatch = selectedPromotion === 'all' || notification.promotionName === selectedPromotion;
    const distributorMatch = selectedDistributor === 'all' || notification.distributorName === selectedDistributor;
    return promotionMatch && distributorMatch;
  });

  const clearFilters = () => {
    setSelectedPromotion('all');
    setSelectedDistributor('all');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Log</CardTitle>
        <CardDescription>
          Review notifications sent from the system. Use the filters to narrow down the results.
        </CardDescription>
        <div className="flex items-center gap-4 pt-4">
            <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Filter by promotion" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Promotions</SelectItem>
                    {uniquePromotions.map(promo => (
                        <SelectItem key={promo} value={promo}>{promo}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Filter by distributor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Distributors</SelectItem>
                    {uniqueDistributors.map(dist => (
                        <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {(selectedPromotion !== 'all' || selectedDistributor !== 'all') && (
              <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {filteredNotifications.length > 0 ? filteredNotifications.map((notification) => (
            <AccordionItem key={notification.id} value={notification.id}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4 items-center">
                    <div className="flex flex-col text-left">
                        <span className="font-semibold">{notification.subject}</span>
                        <span className="text-sm text-muted-foreground">To: {notification.distributorName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline">{notification.promotionName}</Badge>
                        <span className="text-sm text-muted-foreground">{notification.sentDate}</span>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/50 rounded-md">
                    <p>{notification.body}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )) : (
            <div className="text-center text-muted-foreground p-8">
              No notifications found for the selected filters.
            </div>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
