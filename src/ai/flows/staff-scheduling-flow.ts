'use server';
/**
 * @fileOverview An AI flow to generate an optimized weekly staff schedule.
 *
 * - generateSchedule - A function that creates a schedule based on demand, events, and employee data.
 * - StaffSchedulingInput - The input type for the generateSchedule function.
 * - StaffSchedulingOutput - The return type for the generateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StaffSchedulingInputSchema = z.object({
  demandForecast: z.string().describe("The manager's forecast for customer traffic and peak hours for the week (e.g., 'High traffic expected Friday 7-9 PM')."),
  specialEvents: z.string().describe("Any special events, private parties, or specific staffing requests (e.g., 'Private party for 30 on Saturday')."),
  employeeData: z.string().describe("A comprehensive list of all available employees, including their roles, hourly pay rates, and any availability constraints or preferences."),
});
export type StaffSchedulingInput = z.infer<typeof StaffSchedulingInputSchema>;

const ShiftSchema = z.object({
    employeeName: z.string().describe("The full name of the scheduled employee."),
    role: z.string().describe("The role the employee will be performing during this shift (e.g., Chef, Server, Bartender)."),
    startTime: z.string().describe("The start time of the shift in 'HH:MM AM/PM' format (e.g., '09:00 AM')."),
    endTime: z.string().describe("The end time of the shift in 'HH:MM AM/PM' format (e.g., '05:00 PM')."),
    hours: z.number().describe("The total number of hours for this shift, calculated precisely."),
});

const DailyScheduleSchema = z.object({
    shifts: z.array(ShiftSchema).describe("A list of all shifts scheduled for this specific day."),
    dailyCost: z.number().describe("The total calculated labor cost for this day, based on the sum of (hours * pay rate) for every shift."),
});

const StaffSchedulingOutputSchema = z.object({
  summary: z.string().describe("A brief summary of the scheduling strategy, explaining how peak hours, events, and cost-effectiveness were balanced."),
  totalWeeklyCost: z.number().describe("The total estimated labor cost for the entire week, summed from all daily costs."),
  schedule: z.object({
    monday: DailyScheduleSchema,
    tuesday: DailyScheduleSchema,
    wednesday: DailyScheduleSchema,
    thursday: DailyScheduleSchema,
    friday: DailyScheduleSchema,
    saturday: DailyScheduleSchema,
    sunday: DailyScheduleSchema,
  }),
});
export type StaffSchedulingOutput = z.infer<typeof StaffSchedulingOutputSchema>;

export async function generateSchedule(input: StaffSchedulingInput): Promise<StaffSchedulingOutput> {
  return staffSchedulingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'staffSchedulingPrompt',
  input: {schema: StaffSchedulingInputSchema},
  output: {schema: StaffSchedulingOutputSchema},
  prompt: `You are an expert restaurant operations manager AI for Gastronomic AI. Your task is to create a highly optimized and cost-effective weekly staff schedule from Monday to Sunday.

You will be given three key pieces of information:
1.  **Demand Forecast & Peak Hours:** {{{demandForecast}}}
2.  **Special Events or Requests:** {{{specialEvents}}}
3.  **Employee Data (Name, Role, Pay Rate, Availability):** {{{employeeData}}}

Your Goal is to construct the perfect schedule by following these steps:
1.  **Analyze Demand:** Analyze the forecast and events to determine staffing needs for each day. Ensure peak hours and special events are adequately covered to maintain service quality.
2.  **Assign Shifts Strategically:** Assign shifts to employees based on their roles, availability, and pay rates. Distribute hours fairly where possible, but prioritize cost-effectiveness. Avoid overtime unless essential for a special event.
3.  **Calculate Costs:** For each day, create a list of all shifts, including employee name, role, start/end times, and total hours. Then, calculate the total labor cost for that day by summing up (hours * pay rate) for every shift.
4.  **Calculate Weekly Total:** Sum the daily costs to get the total labor cost for the entire week.
5.  **Summarize Your Strategy:** Provide a brief summary explaining your key scheduling decisions, such as how you covered the busiest periods or managed labor costs during slow times.
6.  **Format Output Precisely:** Format the final output according to the specified JSON schema. Ensure every day from Monday to Sunday is present in the final schedule object. If a day has no shifts, return an empty 'shifts' array and a 'dailyCost' of 0 for that day.
  `,
});

const staffSchedulingFlow = ai.defineFlow(
  {
    name: 'staffSchedulingFlow',
    inputSchema: StaffSchedulingInputSchema,
    outputSchema: StaffSchedulingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response that conforms to the required JSON schema.");
    }
    return output;
  }
);
