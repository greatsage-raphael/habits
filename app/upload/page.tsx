'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/scripts/admin'

type FileType = {
  name: string;
  time: string;
  documentId: string
};

export default function PDFDashboard() {
  const router = useRouter()
  const [files, setFiles] = useState<FileType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const { user } = useUser();

  const userId = user?.id

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if(user){
      const userId = user.id
      const fileName = file.name

      try {
        let uploadRoute = '';

        if (file.type === 'application/pdf' || file.type === 'text/plain') {
          uploadRoute = 'https://red-delight-414207.uc.r.appspot.com/uploadPdfs';
        } else {
          throw new Error('Unsupported file type');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('pdfName', fileName);

        formData.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });

        const response = await fetch(uploadRoute, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log('File ID:', data);

        router.push(`/scan/${data.fileId}`);

        if (response.ok) {
          setUploadStatus(`${file.name} uploaded successfully`);
        } else {
          setUploadStatus(`${file.name} unable to upload. Please try again later.`);
        }
      } catch (error) {
        setUploadStatus('An error occurred during the upload');
        console.error('An error occurred during the upload:', error);
      }
    }
  }

  useEffect(() => {
    const fetchContractData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('contracts')
            .select('pdf_url, documentid, pdfname')
            .eq('user_id', userId);

          if (error) {
            console.error('Error fetching contract data:', error);
          } else if (data) {
            const formattedFiles = data.map((file) => ({
              name: file.pdfname,
              time: 'Uploaded recently',
              documentId: file.documentid
            }));
            setFiles(formattedFiles);
          }
        } catch (error) {
          console.error('Error fetching contract data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchContractData();
  }, [userId]);

  const handleFileClick = (documentId: string) => {
    router.push(`/scan/${documentId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Chat With Your PDFs</h1>
      <Card className="mb-8">
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading files...</span>
            </div>
          ) : files.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleFileClick(file.documentId)}
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    {file.name}
                  </span>
                  <span className="text-sm text-gray-500">{file.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No files found. Upload a PDF to get started!
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Or upload a new PDF</h2>
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="application/pdf,text/plain"
              onChange={handleFileChange}
              required
            />
            <Button onClick={handleUploadClick} className="mb-2">Upload a File</Button>
          </div>
          <p className="text-sm text-gray-500">...or drag and drop a file.</p>
        </div>
        {uploadStatus && (
          <p className="mt-4 text-sm text-gray-600">{uploadStatus}</p>
        )}
      </div>
    </div>
  );
}

