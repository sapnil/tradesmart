"use client"

import { Suspense } from "react";
import { PromotionForm } from "@/components/promotions/promotion-form";
import { PageHeader } from "@/components/page-header";
import { useSearchParams } from "next/navigation";
import { type Promotion } from "@/types";

function CreatePromotionContent() {
  const searchParams = useSearchParams();
  const schemeName = searchParams.get('schemeName');

  const prefilledPromotion = schemeName ? {
    schemeName: schemeName,
  } as Partial<Promotion> : undefined;

  return (
    <>
      <PageHeader
        title="Create Promotion"
        description="Fill out the form below to create a new promotion scheme."
      />
      <PromotionForm promotion={prefilledPromotion} />
    </>
  )
}


export default function CreatePromotionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePromotionContent />
    </Suspense>
  );
}
