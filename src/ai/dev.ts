'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/smart-menu-generation.ts';
import '@/ai/flows/formula-86-flow.ts';
import '@/ai/flows/inventory-analysis-flow.ts';
import '@/ai/flows/staff-scheduling-flow.ts';
import '@/ai/flows/sales-analysis-flow.ts';
import '@/ai/flows/customer-feedback-analysis-flow.ts';
import '@/ai/flows/ai-chef-flow.ts';
