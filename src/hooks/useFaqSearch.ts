import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Static FAQs for fallback and chat bubble suggestions
export const staticFaqs: FAQ[] = [
  {
    id: "1",
    question: "How do I track my delivery?",
    answer: "You can track your delivery in real-time through the Courial app. Once your order is picked up, you'll see a live map showing your Courial's location and estimated arrival time.",
    category: "delivery",
  },
  {
    id: "2",
    question: "What items can I send with Courial?",
    answer: "You can send most items including documents, packages, food, and retail goods. However, we don't transport hazardous materials, illegal items, or extremely fragile goods without proper packaging.",
    category: "delivery",
  },
  {
    id: "3",
    question: "How do I book a Chauffeur?",
    answer: "Open the Courial app, select 'Chauffeur' service, enter your pickup and destination, choose your vehicle class, and confirm your booking. Your Chauffeur will arrive at the scheduled time.",
    category: "chauffeur",
  },
  {
    id: "4",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, Apple Pay, Google Pay, and PayPal. You can manage your payment methods in the app under Settings > Payment.",
    category: "payments",
  },
  {
    id: "5",
    question: "How do refunds work?",
    answer: "Refunds are processed within 5-7 business days. If your delivery was damaged or not completed, contact support with your order details for a full refund review.",
    category: "payments",
  },
  {
    id: "6",
    question: "How do I reset my password?",
    answer: "Go to the login screen, tap 'Forgot Password', enter your email, and follow the reset link sent to your inbox. If you don't receive it, check your spam folder.",
    category: "account",
  },
  {
    id: "7",
    question: "Are Courials background checked?",
    answer: "Yes, all Courials and Chauffeurs undergo comprehensive background checks including criminal history, driving record, and identity verification before joining our platform.",
    category: "safety",
  },
  {
    id: "8",
    question: "What cities do you operate in?",
    answer: "We currently operate in San Francisco Bay Area, Los Angeles, Boston, New York City, San Diego, and Bangkok (Thailand). Check the app for the full list of service areas.",
    category: "general",
  },
];

export const useFaqSearch = () => {
  const [results, setResults] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);

  const searchFaqs = useCallback(async (query: string): Promise<FAQ[]> => {
    if (!query || query.length < 2) {
      setResults([]);
      return [];
    }

    setLoading(true);

    try {
      // First try to search via Help Scout
      const { data, error } = await supabase.functions.invoke("helpscout", {
        body: { action: "search", query },
      });

      if (error) {
        console.error("Error searching FAQs:", error);
      }

      if (data?.results && data.results.length > 0) {
        setResults(data.results);
        return data.results;
      }

      // Fall back to local search
      const queryLower = query.toLowerCase();
      const localResults = staticFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(queryLower) ||
          faq.answer.toLowerCase().includes(queryLower)
      );

      setResults(localResults);
      return localResults;
    } catch (error) {
      console.error("Error searching FAQs:", error);
      
      // Fall back to local search on error
      const queryLower = query.toLowerCase();
      const localResults = staticFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(queryLower) ||
          faq.answer.toLowerCase().includes(queryLower)
      );
      
      setResults(localResults);
      return localResults;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestions = useCallback((query: string): FAQ[] => {
    if (!query || query.length < 2) {
      return staticFaqs.slice(0, 3);
    }

    const queryLower = query.toLowerCase();
    return staticFaqs
      .filter(
        (faq) =>
          faq.question.toLowerCase().includes(queryLower) ||
          faq.answer.toLowerCase().includes(queryLower)
      )
      .slice(0, 3);
  }, []);

  return {
    results,
    loading,
    searchFaqs,
    getSuggestions,
    staticFaqs,
  };
};
