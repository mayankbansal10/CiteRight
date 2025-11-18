
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Brain, AlertCircle } from "lucide-react";

interface FillStatus {
  fieldName: string;
  success: boolean;
  actualFieldUsed?: string;
  value: string;
}

interface AnalysisResult {
  fieldMappings: Record<string, string>;
  suggestions: string[];
  confidence: number;
  enhancedStatement: string;
}

interface PdfFillStatusProps {
  fillStatus: FillStatus[];
  analysisResult: AnalysisResult | null;
}

export function PdfFillStatus({ fillStatus, analysisResult }: PdfFillStatusProps) {
  const successfulFills = fillStatus.filter(status => status.success);
  const failedFills = fillStatus.filter(status => !status.success);

  if (!fillStatus.length && !analysisResult) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* AI Analysis Results */}
      {analysisResult && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span>AI Analysis Results</span>
              <Badge variant="outline" className="ml-2">
                {Math.round(analysisResult.confidence * 100)}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">AI Suggestions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {analysisResult.enhancedStatement && (
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Statement Enhanced:</h4>
                <p className="text-sm text-blue-800">
                  ✓ Your statement has been enhanced with legal language for better effectiveness
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fill Status Results */}
      {fillStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>PDF Field Mapping Status</span>
              <Badge variant="outline" className="ml-2">
                {successfulFills.length}/{fillStatus.length} fields filled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Successfully filled fields */}
            {successfulFills.length > 0 && (
              <div>
                <h4 className="font-medium text-green-900 mb-2 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Successfully Filled Fields ({successfulFills.length})</span>
                </h4>
                <div className="space-y-2">
                  {successfulFills.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">{status.fieldName}</span>
                      <div className="flex items-center space-x-2">
                        {status.actualFieldUsed && status.actualFieldUsed !== status.fieldName && (
                          <Badge variant="outline" className="text-xs">
                            mapped to: {status.actualFieldUsed}
                          </Badge>
                        )}
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {status.value.length > 20 ? `${status.value.substring(0, 20)}...` : status.value}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed fields */}
            {failedFills.length > 0 && (
              <div>
                <h4 className="font-medium text-red-900 mb-2 flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Fields That Need Manual Completion ({failedFills.length})</span>
                </h4>
                <div className="space-y-2">
                  {failedFills.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium">{status.fieldName}</span>
                      <Badge variant="outline" className="text-red-800 text-xs">
                        Fill manually: {status.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {failedFills.length > 0 && (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Manual Completion Required</h4>
                    <p className="text-sm text-amber-800">
                      Some fields couldn't be automatically filled. Please complete them manually in the downloaded PDF before submitting.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
