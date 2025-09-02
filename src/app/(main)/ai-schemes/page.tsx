import { PageHeader } from "@/components/page-header";
import { SchemeGenerator } from "@/components/ai/scheme-generator";

export default function AISchemesPage() {
  return (
    <>
      <PageHeader
        title="AI Scheme Generator"
        description="Create a new promotion scheme to avoid trade slumps using AI."
      />
      <SchemeGenerator />
    </>
  );
}
