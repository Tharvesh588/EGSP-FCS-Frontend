"use client";

import { useState } from "react";
import type { AchievementFormData } from "@/components/achievement-form";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://faculty-credit-system.onrender.com';

export function useSubmitAchievement() {
  const [isLoading, setIsLoading] = useState(false);

  const submitAchievement = async (formData: AchievementFormData) => {
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      throw new Error("Authentication error. Please log in again.");
    }
    
    const { title, creditTitleId, academicYear, proof, csrfToken } = formData;
    
    // Corrected the fetch URL to the proper endpoint
    const creditTitleResponse = await fetch(`${API_BASE_URL}/api/v1/admin/credit-title/${creditTitleId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const creditTitle = await creditTitleResponse.json();

    if (!creditTitle.success) {
        setIsLoading(false);
        throw new Error("Could not verify credit category.");
    }

    const submissionData = new FormData();
    submissionData.append("title", title);
    submissionData.append("points", creditTitle.item.points.toString());
    submissionData.append("categories", creditTitleId);
    submissionData.append("academicYear", academicYear);
    submissionData.append("proof", proof);
    submissionData.append("_csrf", csrfToken);

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
            errorMessage = "Invalid security token. Please refresh the page and try again.";
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
