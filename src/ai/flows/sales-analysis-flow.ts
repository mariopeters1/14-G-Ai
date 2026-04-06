'use server';
/**
 * @fileOverview An AI flow to analyze sales data and provide actionable insights.
 *
 * - analyzeSalesData - A function that interprets sales data to find trends and give recommendations.
 * - SalesAnalysisInput - The input type for the analyzeSalesData function.
 * - SalesAnalysisOutput - The return type for the analyzeSalesData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SalesAnalysisInputSchema = z.object({
  salesData: z.string().describe("Raw sales data text, which can include total sales, item breakdowns, sales by category, and qualitative notes about service periods (e.g., 'lunch was slow')."),
});
export type SalesAnalysisInput = z.infer<typeof SalesAnalysisInputSchema>;

const TopItemSchema = z.object({
    itemName: z.string().describe("The name of the top-selling item."),
    unitsSold: z.string().describe("The number of units sold or a relevant sales metric."),
    insight: z.string().describe("A brief insight into why this item is performing well (e.g., 'High-margin item, popular with new menu placement')."),
});

const UnderperformingItemSchema = z.object({
    itemName: z.string().describe("The name of the underperforming item."),
    unitsSold: z.string().describe("The low number of units sold."),
    insight: z.string().describe("A brief insight into why this item might be struggling (e.g., 'Priced too high', 'Poor menu description')."),
});

const RecommendationSchema = z.object({
    recommendation: z.string().describe("A specific, actionable recommendation for the business."),
    reasoning: z.string().describe("The reasoning behind the recommendation, directly tied to the sales data analysis (e.g., top sellers, slow periods, etc.)."),
});

const SalesAnalysisOutputSchema = z.object({
  summary: z.string().describe("A high-level summary of the key trends, overall performance, and major takeaways from the sales data."),
  topItems: z.array(TopItemSchema).describe("A list of the top-performing items from the sales data."),
  underperformingItems: z.array(UnderperformingItemSchema).describe("A list of the worst-performing items that may need attention."),
  recommendations: z.array(RecommendationSchema).describe("A list of actionable recommendations for the business based on the complete analysis."),
});
export type SalesAnalysisOutput = z.infer<typeof SalesAnalysisOutputSchema>;

export async function analyzeSalesData(input: SalesAnalysisInput): Promise<SalesAnalysisOutput> {
  return salesAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesAnalysisPrompt',
  input: {schema: SalesAnalysisInputSchema},
  output: {schema: SalesAnalysisOutputSchema},
  prompt: `You are an expert restaurant business analyst AI for Gastronomic AI. Your job is to analyze raw sales data and provide clear, actionable insights for management.

The user has provided the following sales data report:
---
{{{salesData}}}
---

Your comprehensive analysis task:
1.  **Summarize Performance:** Read the data and create a concise summary of the overall business performance. Mention key financial totals, busy vs. slow periods, category performance, and any other notable high-level trends.
2.  **Identify Top Sellers:** Extract the top-selling items. For each, provide the item name, units sold, and a brief insight into its success (e.g., "High-margin item," "Pairs well with wine specials," "Popular due to promotion").
3.  **Identify Underperforming Items:** Extract the items that sold the least or are clear liabilities. For each, provide the item name, units sold, and a potential reason for its poor performance (e.g., "Priced too high," "Unclear menu description," "Seasonal mismatch").
4.  **Generate Actionable Recommendations:** Based on your complete analysis (summary, top sellers, and underperformers), provide specific, actionable recommendations. For example:
    *   If lunch was slow, suggest a "Power Lunch" special.
    *   If a wine sold well, suggest training staff to upsell it.
    *   If an item is a top seller, recommend ensuring its ingredients are well-stocked.
    *   If an item is underperforming, suggest a menu redesign, a price adjustment, or removing it.

Structure your entire response strictly according to the provided JSON output schema.
  `,
});

const salesAnalysisFlow = ai.defineFlow(
  {
    name: 'salesAnalysisFlow',
    inputSchema: SalesAnalysisInputSchema,
    outputSchema: SalesAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response that conforms to the required JSON schema.");
    }
    return output;
  }
);
