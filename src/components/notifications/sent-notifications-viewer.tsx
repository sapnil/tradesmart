
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sentNotifications } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export function SentNotificationsViewer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Log</CardTitle>
        <CardDescription>
          Showing the last 50 notifications sent from the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {sentNotifications.map((notification) => (
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
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
