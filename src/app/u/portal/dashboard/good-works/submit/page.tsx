
"use client"

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubmitAchievement } from "@/hooks/use-submit-achievement";
import { useCreditTitles } from "@/hooks/use-credit-titles";
import { AchievementForm, type AchievementFormData } from "@/components/achievement-form";
import { useAlert } from "@/context/alert-context";

export default function SubmitAchievementPage() {
  const { toast } = useToast();
  const { showAlert } = useAlert();
  const { creditTitles, isLoading: isLoadingTitles, error: titlesError } = useCreditTitles();
  const { submitAchievement, isLoading: isSubmitting } = useSubmitAchievement();
  const [formKey, setFormKey] = useState(Date.now());

  const handleSubmit = async (formData: AchievementFormData) => {
    try {
      await submitAchievement(formData);
      toast({
        title: "Submission Successful",
        description: "Your achievement has been submitted for review.",
      });
      // Reset form by changing the key
      setFormKey(Date.now());
    } catch (error: any) {
      showAlert(
        "Submission Failed",
        error.message || "An unexpected error occurred.",
      );
    }
  };
  
  if (titlesError) {
    showAlert("Error Loading Data", titlesError);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Submit Achievement
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill out the form below to submit your recent achievement for review.
        </p>
      </div>
      <AchievementForm
        key={formKey}
        creditTitles={creditTitles}
        onSubmit={handleSubmit}
        isLoading={isSubmitting || isLoadingTitles}
      />
    </div>
  );
}
