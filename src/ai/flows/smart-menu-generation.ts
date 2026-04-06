
'use server';

/**
 * @fileOverview Smart menu generation flow that uses AI to create personalized menus based on dietary needs,
 * wearable health data, and available ingredients.
 *
 * - generateSmartMenu - A function that triggers the smart menu generation process.
 * - SmartMenuInput - The input type for the generateSmartMenu function.
 * - SmartMenuOutput - The return type for the generateSmartMenu function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartMenuInputSchema = z.object({
  dietaryNeeds: z
    .string()
    .describe('The dietary needs of the guest (e.g., vegetarian, vegan, gluten-free, diabetic).'),
  healthData: z.string().describe('Wearable health data of the guest (e.g., glucose levels, heart rate).'),
  availableIngredients: z.string().describe('A comma-separated list of ingredients available in the kitchen.'),
});
export type SmartMenuInput = z.infer<typeof SmartMenuInputSchema>;

const DishSchema = z.object({
  course: z.enum(['Appetizer', 'Main Course', 'Dessert']).describe("The course of the meal (e.g., Appetizer)."),
  name: z.string().describe("The creative name of the dish."),
  description: z.string().describe("A brief, appealing description of the dish."),
  reasoning: z.string().describe("Explanation of why this dish is a good choice based on the guest's needs and health data.")
});

const SmartMenuOutputSchema = z.object({
  menu: z.array(DishSchema).describe("An array of dishes, typically one for each course (Appetizer, Main, Dessert)."),
});
export type SmartMenuOutput = z.infer<typeof SmartMenuOutputSchema>;

export async function generateSmartMenu(input: SmartMenuInput): Promise<SmartMenuOutput> {
  return smartMenuFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartMenuPrompt',
  input: {schema: SmartMenuInputSchema},
  output: {schema: SmartMenuOutputSchema},
  prompt: `You are an elite AI nutritionist and gourmet chef for Gastronomic AI. Your task is to design a personalized, three-course dining experience (Appetizer, Main Course, Dessert) for a guest with specific needs.

Guest Profile:
- Dietary Needs: {{{dietaryNeeds}}}
- Health Data Insights: {{{healthData}}}

Available Kitchen Inventory:
- Ingredients: {{{availableIngredients}}}

Your mission:
1.  **Analyze the Guest Profile:** Carefully consider all dietary restrictions and health data to inform your choices. For example, a diabetic guest needs low-sugar, low-glycemic index options.
2.  **Use ONLY Available Ingredients:** You must create all dishes using ONLY the ingredients from the provided list. Do not invent ingredients.
3.  **Create a Three-Course Menu:** Design one appetizer, one main course, and one dessert.
4.  **Craft Each Dish:** For each dish, provide a creative name, an appealing description, and a clear reasoning for why it suits the guest's profile.
5.  **Format the Output:** Structure your entire response as a JSON object that strictly follows the provided output schema. The output must be an object with a 'menu' key, which is an array of dish objects.
  `,
});

const smartMenuFlow = ai.defineFlow(
  {
    name: 'smartMenuFlow',
    inputSchema: SmartMenuInputSchema,
    outputSchema: SmartMenuOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output) {
        throw new Error("AI failed to generate a response that conforms to the required JSON schema.");
    }
    
    return output;
  }
);
