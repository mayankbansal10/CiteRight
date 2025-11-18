import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  license_plate: string;
  citation_numbers: string[];
  citation_dates: string[];
  selected_reason_checkbox: string;
  statement_of_facts: string;
  signature_name: string;
  signature_date: string;
}

interface AnalysisResult {
  fieldMappings: Record<string, string>;
  suggestions: string[];
  confidence: number;
  enhancedStatement: string;
}

export function useAiPdfAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeFormData = async (formData: FormData, pdfFieldNames: string[]): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analysis of form data...');
      
      const { data, error } = await supabase.functions.invoke('analyze-pdf-overlay', {
        body: {
          formData,
          pdfFieldNames
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        throw error;
      }

      console.log('AI analysis completed:', data);
      setAnalysisResult(data);
      return data;

    } catch (error) {
      console.error('Failed to analyze form data:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
  };

  return {
    isAnalyzing,
    analysisResult,
    analyzeFormData,
    clearAnalysis
  };
}