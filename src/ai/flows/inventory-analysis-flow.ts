'use server';
/**
 * @fileOverview An AI flow to analyze inventory and provide purchasing recommendations.
 *
 * - analyzeInventory - A function that provides purchasing suggestions based on inventory levels, sales forecasts, and events.
 * - InventoryAnalysisInput - The input type for the analyzeInventory function.
 * - InventoryAnalysisOutput - The return type for the analyzeInventory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InventoryAnalysisInputSchema = z.object({
  salesForecast: z.string().describe("The user's sales forecast (e.g., 'Expecting 15% growth this week')."),
  upcomingEvents: z.string().describe("Any upcoming events or large parties (e.g., 'Corporate party for 50 on Friday')."),
  dryStorage: z.string().describe('Current inventory levels for dry storage items.'),
  bar: z.string().describe('Current inventory levels for bar items.'),
  freezer: z.string().describe('Current inventory levels for freezer items.'),
  produce: z.string().describe('Current inventory levels for produce items.'),
  dairy: z.string().describe('Current inventory levels for dairy items.'),
  poultry: z.string().describe('Current inventory levels for poultry items.'),
  meat: z.string().describe('Current inventory levels for meat items.'),
  fish: z.string().describe('Current inventory levels for fish items.'),
});
export type InventoryAnalysisInput = z.infer<typeof InventoryAnalysisInputSchema>;


const PurchaseRecommendationSchema = z.object({
    category: z.enum(['Dry Storage', 'Bar', 'Freezer', 'Produce', 'Dairy', 'Poultry', 'Meat', 'Fish']).describe("The inventory category for the item."),
    item: z.string().describe("The specific item that needs to be purchased."),
    suggestion: z.string().describe("The suggested action and specific purchase quantity (e.g., 'Order 2 cases (24 units)', 'Purchase 15 lbs')."),
    reasoning: z.string().describe("A brief explanation for the recommendation, linking it directly to sales forecasts, events, or low stock levels.")
});


const InventoryAnalysisOutputSchema = z.object({
  recommendations: z.array(PurchaseRecommendationSchema).describe('A list of prioritized purchasing recommendations.'),
});
export type InventoryAnalysisOutput = z.infer<typeof InventoryAnalysisOutputSchema>;

export async function analyzeInventory(input: InventoryAnalysisInput): Promise<InventoryAnalysisOutput> {
  return inventoryAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryAnalysisPrompt',
  input: {schema: InventoryAnalysisInputSchema},
  output: {schema: InventoryAnalysisOutputSchema},
  prompt: `You are an expert restaurant purchasing manager AI for Gastronomic AI. Your task is to analyze the current inventory levels and provide smart, prioritized purchasing recommendations.

Consider the following critical data:
- Sales Forecast: {{{salesForecast}}}
- Upcoming Events: {{{upcomingEvents}}}

Current Inventory Levels:
- Dry Storage: {{{dryStorage}}}
- Bar: {{{bar}}}
- Freezer: {{{freezer}}}
- Produce: {{{produce}}}
- Dairy: {{{dairy}}}
- Poultry: {{{poultry}}}
- Meat: {{{meat}}}
- Fish: {{{fish}}}

Your task is to:
1.  Analyze all provided inventory categories.
2.  Cross-reference current inventory with the sales forecast and upcoming events to anticipate needs. Prioritize items that are essential for popular dishes or required for special events.
3.  Identify items that are running low relative to their expected consumption rate.
4.  For each identified item, create a clear, actionable purchase recommendation with a specific quantity (e.g., 'Order 2 cases', 'Purchase 25 lbs').
5.  Provide a concise reasoning for each suggestion, linking it directly to the forecast, an event, or its current low level.
6.  If a category is well-stocked for the upcoming period, do not provide a recommendation for it.
7.  Return the output as a list of recommendations, structured precisely according to the 'InventoryAnalysisOutput' schema. If no purchases are urgently needed, return an empty array.
  `,
});

const inventoryAnalysisFlow = ai.defineFlow(
  {
    name: 'inventoryAnalysisFlow',
    inputSchema: InventoryAnalysisInputSchema,
    outputSchema: InventoryAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response that conforms to the required JSON schema.');
    }
    return output;
  }
);
