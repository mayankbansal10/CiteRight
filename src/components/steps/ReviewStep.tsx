
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, FileText, Calendar, User, Info, AlertCircle } from "lucide-react";
import { usePdfFiller } from "@/hooks/usePdfFiller";
import { useToast } from "@/hooks/use-toast";
import { PdfFillStatus } from "@/components/PdfFillStatus";

interface ReviewStepProps {
  formData: any;
  onPrev: () => void;
}

export function ReviewStep({ formData, onPrev }: ReviewStepProps) {
  const { isProcessing, fillPdfForm, downloadFilledPdf, analysisResult, fillStatus } = usePdfFiller();
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const handleFillAndDownload = async () => {
    setError("");
    setPdfGenerated(false);
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Using AI to map your information to the official SFMTA form",
      });

      const pdfBytes = await fillPdfForm(formData);
      downloadFilledPdf(pdfBytes, formData);
      setPdfGenerated(true);
      
      toast({
        title: "Success!",
        description: "Your completed Citation Protest Form has been downloaded",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate PDF. Please try again or contact support if the problem persists.";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.error('PDF filling error:', err);
    }
  };

  const validCitations = formData.citation_numbers.filter((num: string, i: number) => 
    num.trim() && formData.citation_dates[i]?.trim()
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Your Protest Information is Ready!</h3>
              <p className="text-green-700">
                Review your information below, then generate your completed SFMTA Citation Protest Form.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Information */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Review Your Information</span>
          </CardTitle>
          <CardDescription>
            Please review all information carefully before generating your PDF. You can go back to make changes if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="font-semibold flex items-center space-x-2 mb-3">
              <User className="h-4 w-4" />
              <span>Personal Information</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{formData.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{formData.phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Address:</span>
                <p className="font-medium">{formData.address}</p>
              </div>
              <div>
                <span className="text-muted-foreground">City, State ZIP:</span>
                <p className="font-medium">{formData.city}, {formData.state} {formData.zip}</p>
              </div>
              {formData.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{formData.email}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Citation Details */}
          <div>
            <h4 className="font-semibold flex items-center space-x-2 mb-3">
              <FileText className="h-4 w-4" />
              <span>Citation Details</span>
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">License Plate:</span>
                <p className="font-medium font-mono text-lg">{formData.license_plate}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Citations ({validCitations.length}):</span>
                <div className="space-y-2 mt-2">
                  {validCitations.map((number: string, index: number) => {
                    const dateIndex = formData.citation_numbers.indexOf(number);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="font-mono font-medium">{number}</span>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(formData.citation_dates[dateIndex]).toLocaleDateString()}</span>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dispute Information */}
          <div>
            <h4 className="font-semibold mb-3">Dispute Information</h4>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">Reason for Dispute:</span>
                <Badge className="ml-2 bg-accent text-accent-foreground">
                  {formData.selected_reason_checkbox}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Statement of Facts:</span>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {formData.statement_of_facts}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis and Fill Status */}
      {pdfGenerated && (
        <PdfFillStatus fillStatus={fillStatus} analysisResult={analysisResult} />
      )}

      {/* Official Form Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800">AI-Enhanced PDF Filling</h3>
              <p className="text-blue-700 text-sm">
                This app uses AI to intelligently map your information to the official SFMTA form fields, 
                enhance your statement with legal language, and ensure maximum accuracy for your protest submission.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800">Error Generating PDF</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  If this persists, please check your internet connection or try again later.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate PDF Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-primary" />
            <span>Generate AI-Enhanced PDF</span>
          </CardTitle>
          <CardDescription>
            Generate your completed SFMTA Citation Protest Form with AI-enhanced field mapping and legal language optimization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleFillAndDownload} 
            disabled={isProcessing}
            className="w-full bg-gradient-primary"
            size="lg"
          >
            {isProcessing ? (
              "Generating AI-Enhanced PDF..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download AI-Enhanced PDF
              </>
            )}
          </Button>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">📋 After Download</h4>
            <ol className="text-sm text-green-800 space-y-1">
              <li>1. Review the completed PDF for accuracy</li>
              <li>2. Fill any remaining fields manually if needed</li>
              <li>3. Print the form (if submitting by mail/in-person)</li>
              <li>4. Submit within 21 days of citation date</li>
              <li>5. Keep copies for your records</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back to Edit
        </Button>
        <Button 
          onClick={handleFillAndDownload} 
          disabled={isProcessing}
          className="bg-gradient-primary"
        >
          <Download className="h-4 w-4 mr-2" />
          {isProcessing ? "Generating..." : "Generate AI-Enhanced PDF"}
        </Button>
      </div>
    </div>
  );
}
