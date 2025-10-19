"use client";

import { useState } from "react";
import type { AchievementFormData } from "@/components/achievement-form";
import type { CreditTitle } from "./use-credit-titles";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

export function useSubmitAchievement() {
  const [isLoading, setIsLoading] = useState(false);

  const submitAchievement = async (formData: AchievementFormData, creditTitles: CreditTitle[]) => {
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      throw new Error("Authentication error. Please log in again.");
    }
    
    const { title, creditTitleId, academicYear, proof } = formData;
    
    // Find the selected credit title from the provided array instead of fetching
    const selectedCreditTitle = creditTitles.find(ct => ct._id === creditTitleId);

    if (!selectedCreditTitle) {
        setIsLoading(false);
        throw new Error("Could not find the selected credit category. Please refresh and try again.");
    }

    const submissionData = new FormData();
    submissionData.append("title", title);
    submissionData.append("points", selectedCreditTitle.points.toString());
    submissionData.append("categories", creditTitleId); // API expects 'categories' field
    submissionData.append("academicYear", academicYear);
    submissionData.append("proof", proof);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/credits/positive`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: submissionData,
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = "Submission failed due to a server error.";
        if (responseData.message) {
            errorMessage = responseData.message;
        } else if (response.status === 403) {
            errorMessage = "A security error occurred. Please refresh the page and try again.";
        }
        throw new Error(errorMessage);
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || "An unknown error occurred during submission.");
      }

      return responseData;

    } finally {
      setIsLoading(false);
    }
  };

  return { submitAchievement, isLoading };
}
