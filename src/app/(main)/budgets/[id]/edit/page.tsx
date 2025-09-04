
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { BudgetForm } from "@/components/budgets/budget-form";
import { initialBudgets } from "@/lib/data";
import { type Budget } from "@/types";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditBudgetPage({ params }: { params: { id: string } }) {
  const [budget, setBudget] = useState<Budget | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedBudgets = localStorage.getItem('budgets');
    const allBudgets = storedBudgets ? JSON.parse(storedBudgets) : initialBudgets;
    const foundBudget = allBudgets.find((b: Budget) => b.id === params.id);
    setBudget(foundBudget);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
        <>
            <PageHeader
                title="Edit Budget"
                description="Update the details of your budget."
            />
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </>
    );
  }

  if (!budget) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit Budget"
        description="Update the details of your budget."
      />
      <BudgetForm budget={budget} />
    </>
  );
}
