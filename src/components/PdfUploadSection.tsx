
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, ExternalLink } from "lucide-react";

interface PdfUploadSectionProps {
  uploadedPdf: File | null;
  onPdfUpload: (file: File) => boolean;
  isProcessing: boolean;
}

export function PdfUploadSection({ uploadedPdf, onPdfUpload, isProcessing }: PdfUploadSectionProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = onPdfUpload(file);
      if (!success) {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-primary" />
          <span>Upload PDF Template</span>
        </CardTitle>
        <CardDescription>
          Upload the blank SFMTA Citation Protest Form PDF to fill it out automatically with your information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedPdf ? (
          <>
            <div>
              <Label htmlFor="pdf-upload" className="text-sm font-medium">
                Select PDF File
              </Label>
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="mt-2"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📄 Need the PDF Form?</h4>
              <p className="text-sm text-blue-800 mb-3">
                Download the official SFMTA Citation Protest Form from the San Francisco Municipal Transportation Agency website.
              </p>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                <ExternalLink className="h-4 w-4 mr-2" />
                Download Official Form
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">PDF Template Ready</h4>
              <p className="text-sm text-green-700">{uploadedPdf.name}</p>
            </div>
          </div>
        )}

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2">💡 How It Works</h4>
          <ol className="text-sm text-amber-700 space-y-1">
            <li>1. Upload the blank SFMTA Citation Protest Form PDF</li>
            <li>2. We'll automatically fill it with your information</li>
            <li>3. Download the completed, ready-to-submit PDF</li>
            <li>4. Print and submit within 21 days of citation date</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
