import { genAI, } from '@/scripts/admin';

// Initialize the model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Array to map day numbers to day names
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Function to extract contract data
export async function generateSubTasks(week: number, habit: string) {
  const prompt = `You are great at generating sub tasks for any given habit over 52 weeks. A user will provide the week of the year and your job is to generate sub tasks for just this particular day. Generate structured data as a valid JSON array without additional text:
  {
    habitId: string,
    subTaskName: string,
  }
  Generate subtasks for this ${habit} for week ${week}in a JSON array format.`;
  
  const result = await model.generateContent(prompt);

  try {
    const cleanedResponse = result.response.text().trim();
    return cleanedResponse; // Parse the JSON
  } catch (error) {
    console.error("Failed to parse response:", error, "Response:", result.response.text());
    throw new Error("Invalid JSON received from model.");
  }
}