import { genAI } from '@/scripts/admin';

const createSummaryPrompt = (contractText: string) => {
  return `
Please summarize this contract in plain language, covering:

1. Who is involved?
2. What is the main purpose?
3. What are the main responsibilities?
4. Important dates and deadlines
5. Money-related terms
6. How to end the contract
7. Other important points

Contract text: ${contractText}
  `;
};

export const generateContractSummary = async (contractText: string) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `
      You are a helpful assistant that makes contracts easy to understand.
      Your summaries should:
      - Use simple, clear language
      - Avoid legal jargon
      - Be organized and easy to read
      - Only include information that's actually in the contract
      - Be accurate and complete
    `
  });

  const prompt = createSummaryPrompt(contractText);
  return await model.generateContentStream([prompt]);
};