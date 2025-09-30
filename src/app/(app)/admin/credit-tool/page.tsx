"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCreditRecommendation, type CreditRecommendationOutput } from "@/ai/flows/admin-credit-allocation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  submissionText: z.string().min(10, {
    message: "Submission text must be at least 10 characters.",
  }),
  supportingDocumentDescription: z.string().optional(),
  previousCreditAllocations: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type RecommendationResult = CreditRecommendationOutput & { error?: never } | { error: string; recommendedCredit?: never; reasoning?: never; };

export default function AdminCreditToolPage() {
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submissionText: "",
      supportingDocumentDescription: "",
      previousCreditAllocations: "Example: 'Research paper in Q1 journal' received 15 credits. 'National conference presentation' received 5 credits.",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);
    try {
        const recommendation = await getCreditRecommendation(data);
        setResult(recommendation);
    } catch(e) {
        console.error(e);
        setResult({error: "An unexpected error occurred."})
    }
    setIsLoading(false);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <Bot className="h-6 w-6" />
            AI Credit Recommendation
          </CardTitle>
          <CardDescription>
            Enter the details of a faculty submission to get an AI-powered
            credit recommendation.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="submissionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Published a research paper in a Q1 journal..."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supportingDocumentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supporting Document Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Copy of acceptance letter and first page of paper"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="previousCreditAllocations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Example Allocations (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide some examples for context..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                     <FormDescription>
                        Give the AI some context on previous similar allocations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Recommendation
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <div className="flex items-center justify-center">
        {isLoading && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                <p className="font-semibold">AI is analyzing the submission...</p>
                <p className="text-sm text-center">This may take a moment.</p>
            </div>
        )}
        {result && (
            <Card className="w-full bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl animate-in fade-in-50 zoom-in-95">
                <CardHeader>
                    <CardTitle className="text-lg text-muted-foreground">AI Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-xs text-muted-foreground">Recommended Credits</p>
                    <div className="my-4 text-7xl font-bold font-headline text-primary">
                        {result.error ? "?" : result.recommendedCredit}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 text-sm">
                    <p className="font-semibold">Reasoning:</p>
                    <p className="text-muted-foreground">
                        {result.error || result.reasoning}
                    </p>
                </CardFooter>
            </Card>
        )}
      </div>
    </div>
  );
}
