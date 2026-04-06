'use server';
/**
 * @fileOverview An AI flow to handle '86d' menu items.
 *
 * - suggestAlternatives - A function that suggests menu alternatives when an ingredient is out of stock.
 * - Formula86Input - The input type for the suggestAlternatives function.
 * - Formula86Output - The return type for the suggestAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Formula86InputSchema = z.object({
  ingredient: z.string().describe('The ingredient that is out of stock (86d).'),
  menu: z.string().describe('A comma-separated string of all dishes on the menu.'),
});
export type Formula86Input = z.infer<typeof Formula86InputSchema>;

const AffectedDishSchema = z.object({
    dishName: z.string().describe('The name of the dish affected by the out-of-stock ingredient.'),
    reasoning: z.string().describe('A brief, professional explanation of why this dish is affected (e.g., "Main component is unavailable").'),
    suggestedAlternative: z.string().describe('A suitable alternative dish from the menu that does not contain the 86d ingredient. Ensure the alternative is an appealing and logical substitute.')
});

const Formula86OutputSchema = z.object({
  affectedDishes: z.array(AffectedDishSchema).describe('A list of dishes affected by the ingredient shortage and their suggested alternatives.'),
});
export type Formula86Output = z.infer<typeof Formula86OutputSchema>;

export async function suggestAlternatives(input: Formula86Input): Promise<Formula86Output> {
  return formula86Flow(input);
}

const prompt = ai.definePrompt({
  name: 'formula86Prompt',
  input: {schema: Formula86InputSchema},
  output: {schema: Formula86OutputSchema},
  prompt: `You are Formula-86 AI, an expert culinary assistant for the high-end restaurant, Gastronomic AI. Your primary function is to help chefs and managers swiftly handle ingredient shortages with intelligence and professionalism.

An ingredient has been "86d," meaning it is completely out of stock.

- 86'd Ingredient: {{{ingredient}}}
- Current Full Menu: {{{menu}}}

Your critical task is to:
1.  Identify every single dish on the menu that absolutely requires '{{{ingredient}}}' and cannot be served.
2.  For each of those affected dishes, suggest a suitable alternative dish that is ALREADY on the menu and does NOT contain '{{{ingredient}}}'. The suggestion should be a logical and appealing substitute.
3.  Provide a brief, professional reasoning for why each dish is affected.
4.  Structure your response strictly according to the 'Formula86Output' JSON schema.

If no dishes are affected, you must return an empty array for the 'affectedDishes' field. Do not suggest creating new dishes or modifying existing ones. Only use the provided menu for alternatives.
  `,
});

const formula86Flow = ai.defineFlow(
  {
    name: 'formula86Flow',
    inputSchema: Formula86InputSchema,
    outputSchema: Formula86OutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response that conforms to the required JSON schema.');
    }
    return output;
  }
);
