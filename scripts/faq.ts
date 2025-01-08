import { genAI, } from '@/scripts/admin';

// Initialize the model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Function to extract contract data
export async function extractContractData(contractText: string) {
  const prompt = `Extract structured data from the following contract as a valid JSON array without additional text:
  {
    entityName: string,
    obligationType: string,
    description: string,
    penalties: string,
    keyDates: string,
    risk: string
  }
  Contract: ${contractText}`;
  
  const result = await model.generateContent(prompt);

  try {
    const cleanedResponse = result.response.text().trim();
    return cleanedResponse; // Parse the JSON
  } catch (error) {
    console.error("Failed to parse response:", error, "Response:", result.response.text());
    throw new Error("Invalid JSON received from model.");
  }
}
