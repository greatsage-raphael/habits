'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  User,
  AlertCircle,
  Users,
  FileText,
  Send,
  X,
  Calendar,
  BarChart2,
  Contact,
  PenTool,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/scripts/admin';
import { currentUser, useUser } from '@clerk/nextjs';
import DocumentClient from '@/components/ui/documentClient';
import { extractContractData } from '@/scripts/faq';

interface Contract {
  entityName: string;
  obligationType: string;
  description: string;
  penalties: string;
  keyDates: string;
  risk: string;
}

export default function Component() {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [newSignatoryEmail, setNewSignatoryEmail] = useState('');
  const [prompt, setPrompt] = useState('');
  const [signatories, setSignatories] = useState<string[]>([]);
  const [contractArray, setContractArray] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [rawText, setrawText] = useState<string>();
  const [chatId, setChatId] = useState<string>();
  const [PdfName, setPdfName] = useState<string>();
  const pathname = usePathname();
  const { user } = useUser();

  const id = pathname.match(/\/scan\/([a-f0-9-]+)/)?.[1];

  //console.log('id', id);

  function extractJsonArray(input: string) {
    // Use a regular expression to match content between the JSON block
    const jsonMatch = input.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]); // Parse and return the JSON
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        throw new Error('Invalid JSON format.');
      }
    } else {
      throw new Error('No valid JSON block found.');
    }
  }

  useEffect(() => {
    setLoading(true);

    const fetchContractData = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('contracts')
        .select('pdf_url, raw_text, pdfname')
        .eq('documentid', id)
        .single();

      if (error) {
        console.error('Error fetching contract data:', error);
      } else if (data) {
        setPdfUrl(data.pdf_url);
        setrawText(data.raw_text);
        setPdfName(data.pdfname)
        setChatId(id);
        //console.log('pdf', data.pdf_url);
        //console.log('RAWTEXT', data.raw_text);
        const info = await extractContractData(data.raw_text);
        const contractArray = extractJsonArray(info);
        //console.log('ContractArray:', contractArray);
        setContractArray(contractArray);
        setLoading(false);
      }
    };

    fetchContractData();
  }, [id]);

  // const info = extractContractData(rawText ?? "");
  // console.log('Info:', info);

  const handleAddSignatory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSignatoryEmail) {
      setSignatories([...signatories, newSignatoryEmail]);
      setNewSignatoryEmail('');
      setShowEmailInput(false);
    }
  };

  const handleSigning =() =>{
    const requestPayload = {
      documentUrl: pdfUrl,
      documentName: PdfName,
      signers: signatories
    };
    

    fetch("https://red-delight-414207.uc.r.appspot.com/send-signature-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    })
      .then((response) => response.json())
      .then((data) => console.log("Envelope ID:", data.envelopeId))
      .catch((error) => console.error("Error:", error));
  }

  const handleDeleteSignatory = (index: number) => {
    const updatedSignatories = signatories.filter((_, i) => i !== index);
    setSignatories(updatedSignatories);
  };

  const handleObligationClick = (obligation: string, name: String) => {
    const prompt = `Explain the following obligations of ${name}: ${obligation}`;
    console.log('Clicked data:', prompt);
    setPrompt(prompt); // Assuming `setPrompt` is a state setter for your prompt
  };

  const handleDescriptionClick = (
    description: string,
    obligation: string,
    name: string,
  ) => {
    const prompt = `Explain the following obligations of ${name}:${obligation} - ${description}`;
    console.log('Clicked data:', prompt);
    setPrompt(prompt);
  };

  const handlePenaltiesClick = (penalties: string) => {
    const prompt = `Explain the following penalties: ${penalties}`;
    console.log('Clicked data:', prompt);
    setPrompt(prompt); // Assuming `setPrompt` is a state setter for your prompt
  };

  const handleDatesClick = (date: string, name: string) => {
    const prompt = `Explain the significance of these key dates for ${name}: ${date}`;
    console.log('Clicked data:', prompt);
    setPrompt(prompt); // Assuming `setPrompt` is a state setter for your prompt
  };

  const handleRisksClick = (risks: string, name: string) => {
    const prompt = `Explain these following risks to ${name}: ${risks}`;
    console.log('Clicked data:', prompt);
    setPrompt(prompt); // Assuming `setPrompt` is a state setter for your prompt
  };

  return (
    <div className="flex h-screen flex-col">
      <hr />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-100 max-w-sm overflow-y-auto border-r">
        <button className="m-5 group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 w-30" onClick={handleSigning}>
              <span className="relative flex items-center gap-2 rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900">
                <PenTool className="h-5 w-5" />
                <span className="relative">Sign</span>
              </span>
            </button>
          <div className="flex flex-col gap-6 p-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Signatories
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowEmailInput(!showEmailInput)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add new signatory</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {showEmailInput && (
                    <form
                      onSubmit={handleAddSignatory}
                      className="flex items-center gap-2"
                    >
                      <Input
                        type="email"
                        placeholder="Enter email"
                        value={newSignatoryEmail}
                        onChange={(e) => setNewSignatoryEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm">
                        Add
                      </Button>
                    </form>
                  )}
                  {signatories.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{email}</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteSignatory(index)}
                        className="h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Delete signatory</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="spinner" />
                <p>Loading contracts...</p>
              </div>
            ) : (
              contractArray.map((contract, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {contract.entityName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4 text-sm">
                      <div
                        onClick={() =>
                          handleObligationClick(
                            contract.obligationType,
                            contract.entityName,
                          )
                        }
                        className="cursor-pointer rounded p-2 hover:bg-gray-100"
                      >
                        <strong>Obligation :</strong> {contract.obligationType}
                      </div>
                      <div
                        onClick={() =>
                          handleDescriptionClick(
                            contract.description,
                            contract.obligationType,
                            contract.entityName,
                          )
                        }
                        className="cursor-pointer rounded p-2 hover:bg-gray-100"
                      >
                        <strong>Description:</strong> {contract.description}
                      </div>
                      <div
                        onClick={() => handlePenaltiesClick(contract.penalties)}
                        className="cursor-pointer rounded p-2 hover:bg-gray-100"
                      >
                        <strong>Penalties:</strong> {contract.penalties}
                      </div>
                      <div
                        onClick={() =>
                          handleDatesClick(
                            contract.keyDates,
                            contract.entityName,
                          )
                        }
                        className="cursor-pointer rounded p-2 hover:bg-gray-100"
                      >
                        <strong>Key Dates:</strong> {contract.keyDates}
                      </div>
                      <div
                        onClick={() =>
                          handleRisksClick(contract.risk, contract.entityName)
                        }
                        className="cursor-pointer rounded p-2 hover:bg-gray-100"
                      >
                        <strong>Risks:</strong> {contract.risk}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full border-r">
          {pdfUrl && chatId && rawText ? (
            <DocumentClient
              userImage={user?.imageUrl}
              chatId={chatId}
              pdfUrl={pdfUrl}
              rawText={rawText}
              prompt={prompt}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p>Loading document data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
