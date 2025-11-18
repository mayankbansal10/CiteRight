import React, { useState, useCallback } from 'react';
import { Upload, X, FileImage, File } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

interface UploadedDocument {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface DocumentUploadProps {
  documents: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
}

export function DocumentUpload({ documents, onDocumentsChange }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const newDocuments: UploadedDocument[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type. Please upload images or PDFs.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
            variant: "destructive"
          });
          continue;
        }

        const fileName = `${Date.now()}_${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('citation-documents')
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('citation-documents')
          .getPublicUrl(fileName);

        newDocuments.push({
          name: file.name,
          url: urlData.publicUrl,
          type: file.type,
          size: file.size
        });
      }

      onDocumentsChange([...documents, ...newDocuments]);
      
      if (newDocuments.length > 0) {
        toast({
          title: "Files uploaded",
          description: `${newDocuments.length} file(s) uploaded successfully.`
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [documents, onDocumentsChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Upload Supporting Documents</p>
          <p className="text-xs text-muted-foreground">
            Photos of signage, broken meters, receipts, or other evidence
          </p>
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*,.pdf';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <p className="text-xs text-muted-foreground">
              or drag and drop files here
            </p>
          </div>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Documents</h4>
          {documents.map((doc, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {doc.type.startsWith('image/') ? (
                    <FileImage className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <File className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}