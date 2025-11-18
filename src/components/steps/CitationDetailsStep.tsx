import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Plus, Trash2 } from "lucide-react";

interface CitationDetailsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function CitationDetailsStep({ formData, updateFormData, onNext, onPrev }: CitationDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addCitation = () => {
    updateFormData({
      citation_numbers: [...formData.citation_numbers, ""],
      citation_dates: [...formData.citation_dates, ""]
    });
  };

  const removeCitation = (index: number) => {
    if (formData.citation_numbers.length > 1) {
      const newNumbers = formData.citation_numbers.filter((_: any, i: number) => i !== index);
      const newDates = formData.citation_dates.filter((_: any, i: number) => i !== index);
      updateFormData({
        citation_numbers: newNumbers,
        citation_dates: newDates
      });
    }
  };

  const updateCitation = (index: number, field: 'number' | 'date', value: string) => {
    if (field === 'number') {
      const newNumbers = [...formData.citation_numbers];
      newNumbers[index] = value;
      updateFormData({ citation_numbers: newNumbers });
    } else {
      const newDates = [...formData.citation_dates];
      newDates[index] = value;
      updateFormData({ citation_dates: newDates });
    }
  };

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.license_plate.trim()) {
      newErrors.license_plate = "License plate number is required";
    }

    // Check if at least one citation is filled out
    const validCitations = formData.citation_numbers.filter((num: string, i: number) => 
      num.trim() && formData.citation_dates[i].trim()
    );

    if (validCitations.length === 0) {
      newErrors.citations = "At least one citation number and date is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Citation Details</span>
        </CardTitle>
        <CardDescription>
          Enter your license plate number and the citation details you want to dispute.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="license_plate" className="text-sm font-medium">License Plate Number *</Label>
          <Input
            id="license_plate"
            value={formData.license_plate}
            onChange={(e) => updateFormData({ license_plate: e.target.value.toUpperCase() })}
            placeholder="ABC1234"
            className={`font-mono ${errors.license_plate ? "border-destructive" : ""}`}
            style={{ textTransform: 'uppercase' }}
          />
          {errors.license_plate && <p className="text-sm text-destructive mt-1">{errors.license_plate}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">Citations to Dispute *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCitation}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Citation</span>
            </Button>
          </div>

          {formData.citation_numbers.map((number: string, index: number) => (
            <div key={index} className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg mb-4 bg-muted/30">
              <div>
                <Label htmlFor={`citation-${index}`} className="text-sm font-medium">
                  Citation Number #{index + 1}
                </Label>
                <Input
                  id={`citation-${index}`}
                  value={number}
                  onChange={(e) => updateCitation(index, 'number', e.target.value)}
                  placeholder="e.g., 1234567890"
                  className="font-mono"
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor={`date-${index}`} className="text-sm font-medium">
                    Citation Date
                  </Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={formData.citation_dates[index]}
                    onChange={(e) => updateCitation(index, 'date', e.target.value)}
                  />
                </div>
                {formData.citation_numbers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCitation(index)}
                    className="mt-6 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {errors.citations && <p className="text-sm text-destructive">{errors.citations}</p>}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Finding Your Citation Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Citation numbers are usually 10 digits long</li>
            <li>• The citation date is when the ticket was issued</li>
            <li>• You can find this information on your physical or digital citation</li>
            <li>• Add multiple citations if you want to dispute several at once</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button onClick={validateAndNext} className="bg-gradient-primary">
            Continue to Dispute Reason
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}