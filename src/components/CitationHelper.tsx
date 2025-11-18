import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { CitationDetailsStep } from "./steps/CitationDetailsStep";
import { DisputeReasonStep } from "./steps/DisputeReasonStep";
import { StatementStep } from "./steps/StatementStep";
import { ReviewStep } from "./steps/ReviewStep";
import { Clock, FileText, CheckCircle } from "lucide-react";

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

const steps = [
  { id: 1, title: "Personal Info", description: "Your contact details" },
  { id: 2, title: "Citation Details", description: "Citation numbers and dates" },
  { id: 3, title: "Dispute Reason", description: "Why you're protesting" },
  { id: 4, title: "Your Statement", description: "Explain your situation" },
  { id: 5, title: "Review & Submit", description: "Final review" }
];

export function CitationHelper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    city: "",
    state: "CA",
    zip: "",
    phone: "",
    email: "",
    license_plate: "",
    citation_numbers: [""],
    citation_dates: [""],
    selected_reason_checkbox: "",
    statement_of_facts: "",
    signature_name: "",
    signature_date: new Date().toISOString().split('T')[0]
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 2:
        return <CitationDetailsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <DisputeReasonStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <StatementStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <ReviewStep formData={formData} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            CiteRight
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting a parking ticket is frustrating. Fighting it shouldn't be.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Step {currentStep} of 5</h2>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          
          {/* Step indicators */}
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  currentStep > step.id 
                    ? 'bg-accent text-accent-foreground' 
                    : currentStep === step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium">{step.title}</div>
                  <div className="hidden sm:block">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}