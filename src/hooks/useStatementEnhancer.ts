
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StatementAnalysis {
  feedback: string;
  enhancedStatement: string;
  completenessScore: number;
  suggestions: string[];
}

interface SupportingDocument {
  name: string;
  url: string;
  type: string;
}

export function useStatementEnhancer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StatementAnalysis | null>(null);
  const { toast } = useToast();

  const enhanceStatement = async (
    statement: string, 
    disputeReason: string, 
    supportingDocuments: SupportingDocument[] = []
  ): Promise<StatementAnalysis | null> => {
    console.log('🚀 Starting statement enhancement...', { statement, disputeReason });
    setIsAnalyzing(true);
    
    try {
      console.log('📡 Calling enhance-statement function...');
      const { data, error } = await supabase.functions.invoke('enhance-statement', {
        body: {
          statement,
          disputeReason,
          supportingDocuments
        }
      });

      console.log('📥 Response received:', { data, error });

      if (error) {
        console.error('❌ Statement enhancement error:', error);
        toast({
          title: "Enhancement Failed",
          description: "Unable to enhance your statement. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      if (!data) {
        console.error('❌ No data received from enhancement');
        toast({
          title: "Enhancement Failed", 
          description: "No response received. Please try again.",
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Enhancement successful:', data);
      setAnalysis(data);
      
      toast({
        title: "Statement Enhanced",
        description: "Your statement has been analyzed and improved!"
      });
      
      return data;

    } catch (error) {
      console.error('💥 Failed to enhance statement:', error);
      toast({
        title: "Enhancement Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      console.log('🏁 Finishing enhancement process, setting isAnalyzing to false');
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    console.log('🧹 Clearing analysis');
    setAnalysis(null);
  };

  return {
    isAnalyzing,
    analysis,
    enhanceStatement,
    clearAnalysis
  };
}
