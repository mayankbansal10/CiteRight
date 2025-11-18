import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface PersonalInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

export function PersonalInfoStep({ formData, updateFormData, onNext }: PersonalInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndNext = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.zip.trim()) newErrors.zip = "ZIP code is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Set signature name to match full name
      updateFormData({ signature_name: formData.name });
      onNext();
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-primary" />
          <span>Personal Information</span>
        </CardTitle>
        <CardDescription>
          We need your contact information for the protest form. This must match your official records.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="John Doe"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              placeholder="(555) 123-4567"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="address" className="text-sm font-medium">Street Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="123 Main Street, Apt 4B"
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="text-sm font-medium">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData({ city: e.target.value })}
              placeholder="San Francisco"
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
          </div>

          <div>
            <Label htmlFor="state" className="text-sm font-medium">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => updateFormData({ state: e.target.value })}
              placeholder="CA"
            />
          </div>

          <div>
            <Label htmlFor="zip" className="text-sm font-medium">ZIP Code *</Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) => updateFormData({ zip: e.target.value })}
              placeholder="94102"
              className={errors.zip ? "border-destructive" : ""}
            />
            {errors.zip && <p className="text-sm text-destructive mt-1">{errors.zip}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email Address (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="john@example.com"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional, but helpful for receiving updates about your protest
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={validateAndNext} className="bg-gradient-primary">
            Continue to Citation Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}