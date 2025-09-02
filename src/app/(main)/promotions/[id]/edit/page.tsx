import { PromotionForm } from "@/components/promotions/promotion-form";
import { PageHeader } from "@/components/page-header";
import { promotions } from "@/lib/data";

export default function EditPromotionPage({ params }: { params: { id: string } }) {
  const promotion = promotions.find(p => p.id === params.id);

  if (!promotion) {
    return <div>Promotion not found</div>;
  }

  return (
    <>
      <PageHeader
        title="Edit Promotion"
        description="Update the details of your promotion scheme."
      />
      <PromotionForm promotion={promotion} />
    </>
  );
}
