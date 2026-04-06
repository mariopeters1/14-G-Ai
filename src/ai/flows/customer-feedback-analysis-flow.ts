'use server';
/**
 * @fileOverview An AI flow for analyzing customer feedback.
 *
 * - analyzeFeedback - Analyzes customer review text and an optional photo to provide sentiment analysis and actionable suggestions.
 * - CustomerFeedbackInput - The input type for the analyzeFeedback function.
 * - CustomerFeedbackOutput - The return type for the analyzeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerFeedbackInputSchema = z.object({
  feedbackText: z.string().describe('The raw text from the customer review.'),
  photoDataUri: z.string().optional().describe(
    "An optional photo provided by the customer, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type CustomerFeedbackInput = z.infer<typeof CustomerFeedbackInputSchema>;

const KeyTopicSchema = z.object({
    topic: z.string().describe("The specific topic mentioned (e.g., 'Service', 'Steak Quality', 'Ambiance', 'Cleanliness')."),
    sentiment: z.enum(['Positive', 'Negative', 'Mixed', 'Neutral']).describe("The sentiment for this specific topic, which must be one of 'Positive', 'Negative', 'Mixed', or 'Neutral'."),
    details: z.string().describe("The specific quotes or details from the review that relate directly to this topic."),
});

const SuggestedActionSchema = z.object({
    action: z.string().describe("A concrete, actionable suggestion for the restaurant staff or management to address the feedback."),
    reasoning: z.string().describe("A brief explanation of why this action is recommended based on the specific feedback provided."),
});

const CustomerFeedbackOutputSchema = z.object({
    sentiment: z.enum(['Positive', 'Negative', 'Mixed', 'Neutral']).describe("The overall sentiment of the review, chosen from the specified options."),
    overallSummary: z.string().describe("A concise, neutral summary of the entire customer feedback, capturing the main points."),
    keyTopics: z.array(KeyTopicSchema).describe("A list of key topics identified in the feedback, each with its own sentiment and details."),
    suggestedActions: z.array(SuggestedActionSchema).describe("A list of actionable suggestions based on the identified topics."),
});
export type CustomerFeedbackOutput = z.infer<typeof CustomerFeedbackOutputSchema>;

export async function analyzeFeedback(input: CustomerFeedbackInput): Promise<CustomerFeedbackOutput> {
  return customerFeedbackAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerFeedbackPrompt',
  input: {schema: CustomerFeedbackInputSchema},
  output: {schema: CustomerFeedbackOutputSchema},
  prompt: `You are an expert restaurant manager AI for Gastronomic AI. Your task is to analyze customer feedback with empathy and provide professional, actionable insights.

The customer provided the following feedback:
  
Review Text:
---
{{{feedbackText}}}
---

{{#if photoDataUri}}
They also included this photo. Analyze it for additional context (e.g., food presentation, cleanliness, portion size, crowdedness, ambiance).
{{media url=photoDataUri}}
{{/if}}

Your Task is to perform a detailed analysis and structure it precisely according to the JSON output schema:
1.  **Determine Overall Sentiment:** Read the text and analyze the image (if provided) to determine the single overall sentiment. You must choose one: 'Positive', 'Negative', 'Mixed', or 'Neutral'.
2.  **Write a Neutral Summary:** Provide a brief, objective summary of the customer's entire experience.
3.  **Identify Key Topics:** Break down the feedback into key topics (e.g., 'Food Quality', 'Service Speed', 'Ambiance', 'Value'). For each topic, specify its sentiment ('Positive', 'Negative', 'Mixed', or 'Neutral') and extract the exact details or quotes from the review that support your finding.
4.  **Suggest Actionable Steps:** Based on the feedback, suggest concrete, actionable steps for the restaurant. For example, if service was slow, suggest "Review staffing levels during peak hours." If a dish was praised, suggest "Share positive feedback with the kitchen team and feature it on social media." Be specific.
  `,
});

const customerFeedbackAnalysisFlow = ai.defineFlow(
  {
    name: 'customerFeedbackAnalysisFlow',
    inputSchema: CustomerFeedbackInputSchema,
    outputSchema: CustomerFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response that conforms to the required JSON schema.');
    }
    return output;
  }
);
