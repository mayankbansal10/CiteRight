import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Scale, Info } from "lucide-react";

interface DisputeReasonStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const disputeReasons = [
  {
    value: "METER PAID/MALFUNCTION",
    label: "Meter Paid/Malfunction",
    description: "You paid the meter or the meter was broken/malfunctioning"
  },
  {
    value: "MISSING/OBSCURED SIGN",
    label: "Missing/Obscured Sign",
    description: "Parking signs were missing, blocked, or unclear"
  },
  {
    value: "SOLD/NOT OWNED YET",
    label: "Sold/Not Owned Yet",
    description: "You sold the vehicle or didn't own it at the time of citation"
  },
  {
    value: "STOLEN VEHICLE/PLATE",
    label: "Stolen Vehicle/Plate",
    description: "Your vehicle or license plate was stolen"
  },
  {
    value: "COMPLIANCE/FIX IT CITATION",
    label: "Compliance/Fix It Citation",
    description: "You fixed the violation before the citation was issued"
  },
  {
    value: "OTHER EXPLAIN DETAILS",
    label: "Other (Explain Details)",
    description: "Your reason doesn't fit the categories above"
  }
];

export function DisputeReasonStep({ formData, updateFormData, onNext, onPrev }: DisputeReasonStepProps) {
  const [error, setError] = useState("");

  const validateAndNext = () => {
    if (!formData.selected_reason_checkbox) {
      setError("Please select a reason for your dispute");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scale className="h-5 w-5 text-primary" />
          <span>Dispute Reason</span>
        </CardTitle>
        <CardDescription>
          Select the reason that best describes why you're disputing this citation. 
          Choose carefully as this determines which checkbox will be marked on the official form.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Choose the Most Accurate Reason</h4>
              <p className="text-sm text-amber-700">
                Select the option that best matches your situation. In the next step, you'll be able to 
                provide a detailed explanation of your specific circumstances.
              </p>
            </div>
          </div>
        </div>

        <RadioGroup
          value={formData.selected_reason_checkbox}
          onValueChange={(value) => updateFormData({ selected_reason_checkbox: value })}
          className="space-y-3"
        >
          {disputeReasons.map((reason) => (
            <div key={reason.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={reason.value} className="font-medium cursor-pointer">
                  {reason.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 What Happens Next?</h4>
          <p className="text-sm text-blue-800">
            After selecting your reason, you'll write a detailed statement explaining your specific situation. 
            This combination of the official reason and your personal explanation gives you the best chance of success.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Back
          </Button>
          <Button onClick={validateAndNext} className="bg-gradient-primary">
            Continue to Statement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
