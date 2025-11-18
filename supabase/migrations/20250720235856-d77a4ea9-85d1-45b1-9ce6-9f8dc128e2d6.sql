
-- Create storage bucket for supporting documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('citation-documents', 'citation-documents', true);

-- Create storage policy for uploading documents
CREATE POLICY "Anyone can upload citation documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'citation-documents');

-- Create storage policy for viewing documents
CREATE POLICY "Anyone can view citation documents" ON storage.objects
FOR SELECT USING (bucket_id = 'citation-documents');

-- Create storage policy for deleting documents
CREATE POLICY "Anyone can delete citation documents" ON storage.objects
FOR DELETE USING (bucket_id = 'citation-documents');
