import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PenTool, Lightbulb, Sparkles, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { DocumentUpload } from "@/components/DocumentUpload";
import { useStatementEnhancer } from "@/hooks/useStatementEnhancer";

interface UploadedDocument {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface StatementStepProps {
  formData: any & {
    supporting_documents?: UploadedDocument[];
  };
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const statementTips = {
  "METER PAID/MALFUNCTION": [
    "Mention the exact time you paid and how much",
    "Describe any meter malfunction (broken display, wouldn't accept payment, etc.)",
    "Include receipt number if you have it",
    "Note if other people were having similar issues"
  ],
  "MISSING/OBSCURED SIGN": [
    "Describe exactly what signs were missing or blocked",
    "Mention what was blocking the sign (tree branches, other signs, etc.)",
    "Note if you looked carefully for signs before parking",
    "Describe the lighting conditions if relevant"
  ],
  "VALID PERMIT/DP DISPLAYED": [
    "State the type of permit and its number",
    "Confirm it was properly displayed and visible",
    "Mention if the permit was valid for that location and time",
    "Note if you have photos showing the displayed permit"
  ],
  "STOLEN VEHICLE/PLATE": [
    "Include the police report number",
    "State when you discovered the theft",
    "Mention when and where you reported it",
    "Confirm the citation was issued after the theft was reported"
  ]
};

export function StatementStep({ formData, updateFormData, onNext, onPrev }: StatementStepProps) {
  const [error, setError] = useState("");
  const [showEnhanced, setShowEnhanced] = useState(false);
  const { isAnalyzing, analysis, enhanceStatement } = useStatementEnhancer();

  const validateAndNext = () => {
    if (!formData.statement_of_facts.trim()) {
      setError("Please provide a statement explaining your situation");
      return;
    }
    
    if (formData.statement_of_facts.trim().length < 20) {
      setError("Please provide a more detailed explanation (at least 20 characters)");
      return;
    }

    setError("");
    onNext();
  };

  const currentTips = statementTips[formData.selected_reason_checkbox as keyof typeof statementTips] || [
    "Be specific about dates, times, and locations",
    "Explain exactly what happened in chronological order",
    "Include any relevant details that support your case",
    "Be honest and factual in your description"
  ];

  const exampleStatements = {
    "METER PAID/MALFUNCTION": "I paid for parking at meter #1234 on Main Street at 2:15 PM on March 15th, 2024. I inserted $2.00 in quarters, but the meter display remained broken and showed 'ERROR'. I tried to use the ParkSF app as a backup, but the app showed the meter was 'out of service'. Despite my attempts to pay, I received a citation at 2:45 PM. I have the ParkSF app transaction history showing my attempted payment.",
    
    "MISSING/OBSCURED SIGN": "I parked on Oak Street between 1st and 2nd Avenue at 9:00 AM on March 15th, 2024. I carefully looked for parking signs before parking and saw none visible from my parking spot. After receiving the citation, I discovered there was a 'No Parking 8-10 AM' sign approximately 150 feet down the block, completely obscured by overgrown tree branches. The sign was not visible when approaching from my direction, and there were no other signs indicating the parking restriction in the immediate vicinity of my vehicle."
  };

  const selectedExample = exampleStatements[formData.selected_reason_checkbox as keyof typeof exampleStatements];

  const handleDocumentsChange = (documents: UploadedDocument[]) => {
    updateFormData({ supporting_documents: documents });
  };

  const handleEnhanceStatement = async () => {
    if (!formData.statement_of_facts.trim()) return;
    
    await enhanceStatement(
      formData.statement_of_facts,
      formData.selected_reason_checkbox,
      formData.supporting_documents || []
    );
    setShowEnhanced(true);
  };

  const handleUseEnhanced = () => {
    if (analysis?.enhancedStatement) {
      updateFormData({ statement_of_facts: analysis.enhancedStatement });
      setShowEnhanced(false);
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PenTool className="h-5 w-5 text-primary" />
          <span>Your Statement</span>
        </CardTitle>
        <CardDescription>
          Explain your situation in detail. This is your chance to tell your side of the story and provide 
          context for why the citation should be dismissed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label htmlFor="statement" className="text-sm font-medium">
              Statement of Facts *
            </Label>
            {analysis && (
              <Badge variant={analysis.completenessScore >= 80 ? "default" : analysis.completenessScore >= 60 ? "secondary" : "destructive"}>
                {analysis.completenessScore}% Complete
              </Badge>
            )}
          </div>
          <Textarea
            id="statement"
            value={formData.statement_of_facts}
            onChange={(e) => updateFormData({ statement_of_facts: e.target.value })}
            placeholder="Describe exactly what happened, including specific times, dates, and circumstances..."
            className={`min-h-[150px] ${error ? "border-destructive" : ""}`}
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
            <span>{error || "Be specific and factual in your explanation"}</span>
            <span>{formData.statement_of_facts.length} characters</span>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleEnhanceStatement}
              disabled={!formData.statement_of_facts.trim() || isAnalyzing}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <Sparkles className="h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Regenerate with CiteRight"}
            </Button>
          </div>
        </div>

        {/* AI Analysis Results */}
        {analysis && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-blue-600" />
                CiteRight Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Feedback */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Feedback
                </h4>
                <p className="text-sm text-muted-foreground">{analysis.feedback}</p>
              </div>

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4" />
                    Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enhanced Statement */}
              {showEnhanced && analysis.enhancedStatement && (
                <div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Enhanced Statement
                    </h4>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUseEnhanced}>
                        Use This Version
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowEnhanced(false)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                    <p className="text-sm whitespace-pre-wrap">{analysis.enhancedStatement}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Supporting Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supporting Documents</CardTitle>
            <CardDescription>
              Upload photos or documents that support your case (optional but recommended)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload
              documents={formData.supporting_documents || []}
              onDocumentsChange={handleDocumentsChange}
            />
          </CardContent>
        </Card>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 mb-2">Tips for "{formData.selected_reason_checkbox}"</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {currentTips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {selectedExample && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">📝 Example Statement</h4>
            <p className="text-sm text-blue-700 italic leading-relaxed">
              "{selectedExample}"
            </p>
            <p className="text-xs text-blue-600 mt-2">
              This is just an example - write about your specific situation using your own words.
            </p>
          </div>
        )}

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2">⚖️ Important Reminders</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Be truthful and accurate in your statement</li>
            <li>• Include specific dates, times, and locations</li>
            <li>• Mention any supporting evidence you have (photos, receipts, etc.)</li>
            <li>• Keep it factual and avoid emotional language</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button onClick={validateAndNext} className="bg-gradient-primary">
            Review & Finalize
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}