import { PromotionForm } from "@/components/promotions/promotion-form";
import { PageHeader } from "@/components/page-header";

export default function CreatePromotionPage() {
  return (
    <>
      <PageHeader
        title="Create Promotion"
        description="Fill out the form below to create a new promotion scheme."
      />
      <PromotionForm />
    </>
  );
}
