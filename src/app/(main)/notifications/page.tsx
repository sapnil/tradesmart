import { PageHeader } from "@/components/page-header";
import { SentNotificationsViewer } from "@/components/notifications/sent-notifications-viewer";

export default function SentNotificationsPage() {
  return (
    <>
      <PageHeader
        title="Sent Notifications"
        description="A log of all promotion notifications sent to distributors."
      />
      <SentNotificationsViewer />
    </>
  );
}
