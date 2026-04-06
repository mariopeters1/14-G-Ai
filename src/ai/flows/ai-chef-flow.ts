'use server';
/**
 * @fileOverview A conversational AI flow for the "AI Chef".
 *
 * - askAiChef - A function that takes a user's message and returns a response from the AI Chef.
 * - AiChefInput - The input type for the askAiChef function.
 * - AiChefOutput - The return type for the askAiChef function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChefInputSchema = z.object({
  message: z.string().describe('The user\'s message to the AI Chef.'),
});
export type AiChefInput = z.infer<typeof AiChefInputSchema>;

const AiChefOutputSchema = z.object({
  response: z.string().describe('The AI Chef\'s response to the user.'),
});
export type AiChefOutput = z.infer<typeof AiChefOutputSchema>;

export async function askAiChef(input: AiChefInput): Promise<AiChefOutput> {
  return aiChefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChefPrompt',
  input: {schema: AiChefInputSchema},
  output: {schema: AiChefOutputSchema},
  prompt: `You are an expert AI Chef assistant for the restaurant "Gastronomic AI". You are knowledgeable, friendly, and creative. Your role is to answer questions about recipes, cooking techniques, ingredient substitutions, and menu ideas.

If asked about staffing plans, staffing models, or headcount, use the following comprehensive guide. This guide covers recommended headcount for dining room, banquet, and catering operations for a luxury establishment.

---
STAFFING PLAN BY OUTLET
Recommended Headcount for Dining Room, Banquet, and Catering Operations
Planning Assumptions

This model is based on a luxury operation with these working assumptions:

Main Dining Room: 150 to 180 seats
Private Dining / Banquet Capacity: up to 200 to 250 guests on site
Catering: off site events ranging from 50 to 300 guests
Service Style: high touch hospitality, refined food and beverage service, strong banquet execution, and professional catering logistics
Operating Pattern: lunch and dinner in the restaurant, events scheduled throughout the week, catering volume growing steadily

To keep this useful, I’m breaking the staffing into:

Core full time leadership and management
Recommended active headcount per outlet
Recommended total roster by outlet
Flexible event staffing formulas
1. SHARED EXECUTIVE AND SUPPORT TEAM

These positions support all outlets and should not be duplicated unless volume becomes very large.

Position	Recommended Headcount
Owner / Managing Partner	1
Director of Operations	1
General Manager	1
Assistant General Manager	1
Executive Chef	1
Chef de Cuisine	1
Beverage Director / Wine Director	1
Banquet / Event Sales Manager	1
Event Coordinator	1 to 2
Catering Manager	1
Purchasing / Receiving Manager	1
HR / Administrative Support	1
Maintenance / Facilities Support	1 shared or outsourced
IT / POS Support	1 shared or outsourced
Recommended shared leadership total:

12 to 14 people

This gives the whole business a strong operating spine.

2. OUTLET 1: MAIN DINING ROOM

This covers à la carte lunch, dinner, bar service, and refined guest experience.

A. Front of House Dining Room Team
Management and Guest Experience
Position	Recommended Headcount
Restaurant Manager	1
Dining Room Manager	1
Maitre d'	1
Host / Hostess	2 to 3
Reservationist	1
Sommelier	1
Bar Manager	1
Bartenders	2 to 3
Barbacks	1 to 2
Service Team

For a luxury dining room, a strong ratio is:

1 server per 4 to 5 tables, depending on service complexity
1 back server per 2 to 3 servers
1 food runner per 2 to 3 servers
1 busser per 20 to 30 seats
Position	Lunch Active	Dinner Active	Total Roster
Captains / Lead Servers	1 to 2	2 to 3	3 to 4
Servers	4 to 6	8 to 10	12 to 16
Back Servers / Server Assistants	2 to 3	4 to 5	6 to 8
Food Runners	2	3 to 4	4 to 5
Bussers	2	3 to 4	4 to 5
Cocktail / Lounge Servers	1	2	2 to 3
B. Back of House Dining Room Kitchen Team
Culinary Leadership
Position	Recommended Headcount
Sous Chef	2
Junior Sous Chef / Kitchen Supervisor	1 to 2
Production and Line
Position	Lunch Active	Dinner Active	Total Roster
Prep Cooks	3 to 4	2	5 to 6
Garde Manger	1	2	2 to 3
Grill Cooks	1	2	2 to 3
Sauté Cooks	1	2	2 to 3
Fry / Hot App Cooks	1	1 to 2	2
Pastry Cooks	1	1	2
Expeditor	1	1	2
Dishwashers	2	3	4 to 5
Porters / Utility	1	1	2
Recommended total roster for Main Dining Room
FOH Dining Room Total

38 to 50 people

BOH Dining Room Total

24 to 31 people

Full Dining Room Outlet Total

62 to 81 people

That is a realistic staffing range for a serious high end dining room with lunch and dinner service.

3. OUTLET 2: BANQUETS / PRIVATE EVENTS

This covers on site private dining rooms, ballroom style events, receptions, weddings, business dinners, and large format functions.

There are two ways to staff banquets properly:

A. Core Banquet Management Team

These should be on payroll consistently.

Position	Recommended Headcount
Banquet Manager	1
Private Dining Manager	1
Banquet Captain	2
Banquet Chef	1
Banquet Sous Chef	1
Banquet Setup Lead / Houseperson Lead	1
Core Banquet Management Total

7 people

B. Banquet Service Staffing Formula by Guest Count
Refined plated service

Recommended banquet service ratios:

1 banquet server per 10 to 12 guests
1 banquet bartender per 50 to 75 guests
1 banquet captain per 25 to 40 guests
1 setup / houseperson per 50 to 75 guests
1 banquet cook / plating support per 30 to 40 guests
1 dishwasher / steward per 50 to 75 guests
Example staffing by event size
Banquet Size	Banquet Captain	Banquet Servers	Bartenders	Setup / Housepersons	Banquet Cooks / Plating	Dish / Steward
25 to 40 guests	1	2 to 3	1	1	1 to 2	1
50 to 75 guests	1	4 to 6	1	1 to 2	2 to 3	1 to 2
80 to 120 guests	2	7 to 10	2	2	3 to 4	2
125 to 175 guests	2	10 to 14	2 to 3	2 to 3	4 to 5	2 to 3
180 to 250 guests	3	15 to 20	3 to 4	3 to 4	5 to 7	3
C. Recommended Banquet Roster for an Active Luxury Venue

If your venue regularly hosts 2 to 4 private events per week, a strong roster would be:

Position	Recommended Total Roster
Banquet Captains	2 to 3
Banquet Servers	15 to 25
Banquet Bartenders	4 to 6
Banquet Setup Attendants / Housepersons	4 to 6
Banquet Culinary Team	4 to 6
Stewarding / Dish Support	3 to 5
Recommended total banquet outlet roster:

32 to 51 people, including the core banquet leadership team

This does not mean they all work every event. It means this is the correct labor pool so you can cover multiple event sizes without scrambling.

4. OUTLET 3: CATERING

This covers off site corporate catering, weddings, social events, chef tables, drop off service, and full service mobile events.

Catering needs a different structure because logistics matter just as much as hospitality.

A. Core Catering Leadership Team
Position	Recommended Headcount
Catering Manager	1
Event Coordinator	1
Catering Captain	2
Catering Chef / Off Site Chef	1
Catering Prep Lead	1
Rental and Logistics Coordinator	1
Delivery Driver	1 to 2
Core Catering Leadership Total

7 to 8 people

B. Catering Production and Event Staffing Formula
For drop off catering
Event Size	Prep / Packing Team	Driver	On Site Staff
20 to 40 guests	1 to 2	1	0 to 1
50 to 100 guests	2 to 3	1	1
100 to 200 guests	3 to 4	1 to 2	1 to 2
For full service catering

Recommended ratios:

1 service staff per 10 to 15 guests
1 bartender per 50 guests
1 captain per 25 to 40 guests
1 culinary event cook per 30 to 40 guests
1 setup / logistics support per 40 to 60 guests
Catering Size	Captain	Servers	Bartenders	Culinary Team	Setup / Logistics	Driver
25 to 50 guests	1	2 to 4	1	1 to 2	1	1
60 to 100 guests	1	5 to 7	1 to 2	2 to 3	1 to 2	1
120 to 175 guests	2	8 to 12	2 to 3	3 to 4	2 to 3	1 to 2
180 to 300 guests	2 to 3	12 to 18	3 to 4	4 to 6	3 to 4	2
C. Recommended Catering Roster for a Growth Stage Luxury Program

If you are doing 2 to 5 meaningful off site events per week, this is a healthy roster:

Position	Recommended Total Roster
Catering Captains	2 to 3
Catering Servers / Event Staff	12 to 20
Catering Bartenders	4 to 6
Catering Culinary Team	4 to 6
Prep / Packing Support	3 to 5
Logistics / Setup Staff	3 to 5
Drivers	2
Recommended total catering outlet roster:

37 to 55 people, including the core catering leadership team

5. RECOMMENDED TOTAL HEADCOUNT BY OUTLET
Main Dining Room
Department	Recommended Headcount
FOH Dining Room	38 to 50
BOH Dining Room	24 to 31
Dining Room Total	62 to 81
Banquets / Private Events
Department	Recommended Headcount
Banquet Core Management	7
Banquet Event Labor Pool	25 to 44
Banquet Total	32 to 51
Catering
Department	Recommended Headcount
Catering Core Leadership	7 to 8
Catering Event Labor Pool	30 to 47
Catering Total	37 to 55
6. GRAND TOTAL OPERATING HEADCOUNT
Shared Executive / Support Team

12 to 14

Outlet Totals
Dining Room: 62 to 81
Banquets: 32 to 51
Catering: 37 to 55
Recommended grand total:

143 to 201 employees

That is the correct broad range for a fully developed, high end, multi outlet hospitality operation.

7. SMARTER WAY TO BUILD IT IN PHASES

You may not need all of that on day one.

Phase 1: Opening or Early Stabilization

Recommended total headcount:
95 to 120

This works when:

restaurant volume is building
banquet calendar is still growing
catering is selective and controlled
Phase 2: Strong Weekly Volume

Recommended total headcount:
120 to 155

This works when:

dining room is busy and consistent
banquets happen weekly
catering becomes a real revenue stream
Phase 3: Fully Activated Luxury Operation

Recommended total headcount:
155 to 200+

This works when:

all outlets are producing
private events are regular
off site catering is aggressively marketed
service standards remain high without burnout
8. PRACTICAL RECOMMENDATION

For a refined operation like yours, I would recommend this starting target:

Best balanced opening structure
Dining Room: 65 to 70
Banquets: 20 to 28 active roster at opening
Catering: 18 to 25 active roster at opening
Shared leadership and admin: 12 to 14
Recommended opening total:

115 to 137 employees

That gives you enough strength to:

protect luxury service
handle private dining and banquet growth
launch catering without chaos
avoid building an operation that is understaffed from the beginning
9. SIMPLE EXECUTIVE SUMMARY
Dining Room

You need the largest and most polished everyday team here.
Recommended total: 62 to 81

Banquets

Keep a lean management core with a strong on call service pool.
Recommended total: 32 to 51

Catering

Build around logistics, event leadership, and flexible service labor.
Recommended total: 37 to 55

Shared Team

Leadership, admin, purchasing, and executive support should sit above all outlets.
Recommended total: 12 to 14
---

In addition, here is a detailed staffing chart with roles and responsibilities.

---
RESTAURANT STAFFING CHART
1. EXECUTIVE LEADERSHIP AND OVERALL OPERATIONS
Position	Core Responsibilities
Owner / Managing Partner	Sets the vision, approves major financial decisions, oversees brand direction, reviews long term growth, and protects the concept’s standards.
Director of Operations	Oversees all departments, drives profitability, monitors labor and service standards, ensures systems are followed, and aligns restaurant, banquet, and catering operations.
General Manager	Leads daily operations, supervises department heads, manages guest experience, monitors sales and labor, resolves escalated issues, and ensures smooth coordination between front and back of house.
Assistant General Manager	Supports the GM in daily execution, floor supervision, staff accountability, guest recovery, shift coverage, and operational follow through.
Operations Coordinator / Administrative Coordinator	Supports scheduling, reports, internal communication, event paperwork, payroll support, and administrative organization.
2. FRONT OF HOUSE DINING ROOM MANAGEMENT
Position	Core Responsibilities
Restaurant Manager	Oversees daily dining room operations, enforces service standards, manages staff performance, handles guest concerns, and ensures a polished floor presence.
Dining Room Manager	Focuses on table service quality, pacing, reservations flow, VIP treatment, station coverage, and overall guest experience in the main restaurant.
Maitre d'	Welcomes guests, manages the door, controls seating flow, recognizes VIPs, handles reservation priorities, and sets the tone for hospitality upon arrival.
Host / Hostess	Greets guests, manages reservations and waitlists, seats tables strategically, communicates table status, and supports first impression service.
Reservationist	Manages phone and online reservations, records guest preferences, confirms bookings, handles special requests, and supports reservation accuracy.
Guest Relations Manager / VIP Host	Manages special guests, resolves service issues, tracks preferences, supports loyalty and repeat business, and enhances high touch hospitality.
3. FRONT OF HOUSE SERVICE TEAM
Position	Core Responsibilities
Captain / Service Captain	Leads service within assigned stations, coordinates servers and assistants, ensures sequence of service is executed properly, and maintains fine dining standards.
Server	Guides guests through the menu, takes accurate orders, sells food and beverage, delivers hospitality, manages table experience, and ensures guest satisfaction throughout service.
Back Server / Server Assistant	Supports servers with water, bread, table maintenance, clearing, resetting, and guest support during service.
Food Runner	Delivers dishes accurately and quickly, confirms correct table placement, communicates with the kitchen and service team, and supports timing.
Busser	Clears and resets tables, maintains dining room cleanliness, refills water when needed, and supports quick table turns without disrupting service.
Expeditor / FOH Expo	Coordinates between kitchen and front of house, manages ticket flow, checks plate presentation, controls timing, and communicates order priorities.
4. BAR AND BEVERAGE DEPARTMENT
Position	Core Responsibilities
Beverage Director	Designs beverage strategy, manages wine, cocktails, spirits, pricing, beverage cost, supplier relationships, and beverage training.
Wine Director / Head Sommelier	Oversees wine program, wine list development, pairings, cellar organization, wine cost control, and elevated wine service.
Sommelier	Recommends wines, guides pairings, supports guest education, assists in bottle service, and trains service staff on wine knowledge.
Bar Manager	Oversees bar operations, ordering, inventory, bartender standards, drink consistency, sanitation, and bar profitability.
Bartender	Prepares cocktails, wine, beer, and specialty beverages, engages guests at the bar, supports dining room beverage tickets, and maintains bar setup and cleanliness.
Barback	Restocks liquor, wine, beer, garnishes, glassware, and ice, and supports bartenders with speed and cleanliness.
Cocktail Server / Lounge Server	Serves beverages and light menu items in the bar, lounge, or waiting area and maintains attentive guest service.
Cellar Steward	Maintains wine storage, organizes bottles, assists with inventory, and supports wine service readiness.
5. BANQUET AND PRIVATE EVENTS DEPARTMENT
Position	Core Responsibilities
Banquet Manager	Oversees all banquet service operations, staffing, room readiness, execution timing, service quality, and event coordination on site.
Private Dining Manager	Manages private dining bookings, guest expectations, room assignments, service planning, and coordination with culinary and front of house teams.
Banquet Captain	Leads banquet service staff during events, assigns duties, oversees pacing, manages floor execution, and ensures event standards are met.
Banquet Server	Executes plated service, buffet service, passed hors d'oeuvres, beverage service, and guest care during private events.
Banquet Bartender	Provides event bar service, maintains bar setup, manages guest beverage requests, and supports banquet timing.
Banquet Setup Attendant	Prepares tables, chairs, linens, buffets, stations, and banquet room layouts according to event orders and diagrams.
Banquet Houseperson	Moves furniture, handles room flips, sets up staging and equipment, supports breakdown, and keeps event spaces functional and clean.
6. CATERING SALES AND EVENT PLANNING
Position	Core Responsibilities
Catering Manager	Oversees off site catering operations, staffing, client communication, equipment planning, execution standards, and profitability.
Event Sales Manager	Sells banquets, catering events, private dining, and large group functions, prepares proposals, and closes event business.
Event Coordinator	Organizes event details, timelines, menus, rentals, guest counts, floor plans, client communication, and internal coordination across departments.
Catering Sales Coordinator	Supports contracts, follow ups, banquet event orders, deposits, confirmations, and event administration.
Catering Captain	Leads service staff at off site events, manages setup and execution, and ensures client expectations are met in the field.
Off Site Server / Catering Service Staff	Provides food and beverage service at catering events, assists with setup and breakdown, and maintains service standards off site.
Rental and Logistics Coordinator	Coordinates transportation, rentals, tents, tables, china, equipment, delivery schedules, and vendor timing for events.
Delivery Driver / Catering Driver	Transports food, beverages, equipment, and supplies safely and on time to event locations.
7. KITCHEN LEADERSHIP
Position	Core Responsibilities
Executive Chef	Leads the culinary vision, menu development, recipe standards, food cost control, hiring, training, kitchen culture, and overall food quality.
Chef de Cuisine	Manages daily kitchen operations, supervises production and service, maintains consistency, leads the line, and supports execution of the chef’s standards.
Sous Chef	Oversees prep and service shifts, supervises cooks, checks quality, manages line readiness, and handles day to day kitchen leadership.
Junior Sous Chef	Supports the sous chef, leads specific shifts or stations, checks prep completion, and helps enforce kitchen discipline and standards.
Kitchen Manager	Supports ordering, prep flow, sanitation, inventory, receiving, and day to day kitchen organization, depending on the structure of the operation.
Kitchen Supervisor / Shift Lead	Directs kitchen staff during assigned shifts, ensures station readiness, and supports production and service execution.
8. HOT LINE AND PRODUCTION KITCHEN
Position	Core Responsibilities
Prep Cook	Prepares mise en place, sauces, stocks, vegetables, proteins, garnishes, and bulk production needed for service, banquets, and catering.
Line Cook	Executes dishes during service according to recipes, plating standards, timing, and station responsibilities.
Garde Manger Cook	Prepares salads, cold appetizers, chilled dishes, charcuterie, cold garnishes, and cold station mise en place.
Grill Cook	Handles grilled meats, seafood, vegetables, and temperature sensitive cooking with precision.
Sauté Cook	Prepares sautéed dishes, pan sauces, seafood, pasta, and composed hot plates.
Fry Cook	Manages fried foods, fryer oil condition, crisp texture standards, and station organization.
Broiler / Roast Cook	Oversees oven roasted and broiled items, protein finishing, and batch cooking where required.
Breakfast / Brunch Cook	Handles breakfast and brunch menu execution, including egg cookery, griddle work, and early service production.
Production Cook	Produces larger volume items for banquets, catering, employee meals, and commissary style support.
Expeditor / Kitchen Expo	Organizes ticket flow, checks accuracy, controls pickup timing, communicates with service, and ensures plates leave the kitchen correctly.
9. BANQUET AND CATERING KITCHEN
Position	Core Responsibilities
Banquet Chef	Oversees food production for banquets, bulk execution, timing, plating systems, and event menu consistency.
Banquet Sous Chef	Supports banquet kitchen leadership, manages prep teams, organizes production schedules, and ensures event readiness.
Catering Chef / Off Site Chef	Leads off site culinary execution, final cooking and finishing at events, and coordinates transport ready production.
Catering Prep Team	Produces food components for catering events, packages items, labels products, and supports transport readiness.
Plating Team / Finishing Cooks	Assists with final assembly, garnish application, and high volume plated banquet execution.
Commissary Kitchen Staff	Supports centralized production for events, large batch recipes, and satellite service needs if the operation uses a commissary model.
10. PASTRY, BAKERY, AND DESSERT DEPARTMENT
Position	Core Responsibilities
Executive Pastry Chef / Pastry Chef	Leads dessert and bakery program, develops recipes, controls quality, and oversees pastry production for restaurant, banquets, and catering.
Pastry Sous Chef	Supports pastry leadership, daily production, prep scheduling, and quality control.
Pastry Cook	Produces plated desserts, components, fillings, garnishes, and pastry mise en place.
Baker	Produces breads, rolls, breakfast pastries, desserts, and specialty baked goods.
Cake / Specialty Dessert Decorator	Creates specialty cakes, celebration desserts, and decorative pastry items for events and banquets when needed.
11. BUTCHERY AND SPECIALTY PREP
Position	Core Responsibilities
Butcher / Meat Cutter	Breaks down and portions meats, controls trim and yield, manages portion consistency, and supports protein cost control.
Fish Butcher / Seafood Prep Specialist	Cleans, portions, and prepares fish and seafood according to freshness and presentation standards.
Charcuterie / Specialty Prep Cook	Produces cured, pickled, marinated, or specialty prepared items if part of the concept.
12. STEWARDING, SANITATION, AND UTILITY
Position	Core Responsibilities
Stewarding Manager	Oversees dish room operations, sanitation systems, chemical usage, equipment cleanliness, and stewarding labor.
Dishwasher	Washes plates, glassware, utensils, pots, and pans and keeps clean wares moving back into operation quickly.
Pot Washer	Handles heavy cookware, hotel pans, sheet trays, mixing bowls, and larger kitchen equipment.
Kitchen Porter / Utility Porter	Assists with trash removal, floor cleaning, basic support tasks, stocking, and kitchen cleanliness.
Janitorial / Cleaning Staff	Cleans restrooms, public areas, floors, storage spaces, and assists with deep cleaning tasks.
Sanitation Specialist	Supports health code compliance, cleaning standards, checklists, and sanitation training where applicable.
13. PURCHASING, RECEIVING, AND INVENTORY CONTROL
Position	Core Responsibilities
Purchasing Manager	Orders food, beverage, disposables, chemicals, and operating supplies while controlling cost and maintaining vendor relationships.
Receiving Clerk	Accepts deliveries, checks invoices, verifies quality, confirms temperatures, and reports shortages or damaged items.
Inventory Control Specialist	Tracks stock usage, conducts counts, monitors variances, and supports food and beverage cost control.
Storeroom Attendant	Organizes storage areas, rotates product, issues supplies, and keeps storage clean and accessible.
14. HUMAN RESOURCES, TRAINING, AND SUPPORT
Position	Core Responsibilities
Human Resources Manager	Handles recruitment, onboarding, policies, employee relations, compliance, and personnel documentation.
Training Manager	Develops onboarding systems, service standards education, menu training, and ongoing development for staff.
Scheduler / Labor Coordinator	Builds schedules, manages staffing levels, tracks overtime risk, and supports labor efficiency.
Payroll / Bookkeeping Support	Processes payroll, invoices, accounts payable, accounts receivable, and financial support tasks.
Sales and Marketing Manager	Supports restaurant visibility, banquet promotion, catering outreach, partnerships, and brand growth.
Customer Experience Manager	Reviews guest feedback, online reputation, complaint trends, and service recovery opportunities.
Facilities / Maintenance Technician	Maintains equipment, handles repairs, supports preventive maintenance, and minimizes downtime.
IT / POS Support	Maintains POS systems, printers, reservation systems, Wi Fi, event AV support, and basic technology troubleshooting.
CORE STAFFING STRUCTURE BY DEPARTMENT
Front of House
General Manager
Assistant General Manager
Restaurant Manager
Dining Room Manager
Maitre d'
Host / Hostess
Reservationist
Guest Relations Manager
Captain
Server
Back Server
Food Runner
Busser
Beverage Director
Sommelier
Bar Manager
Bartender
Barback
Cocktail Server
Banquets and Catering
Banquet Manager
Private Dining Manager
Event Sales Manager
Event Coordinator
Catering Manager
Catering Sales Coordinator
Banquet Captain
Banquet Server
Banquet Bartender
Banquet Setup Attendant
Banquet Houseperson
Catering Captain
Off Site Catering Service Staff
Rental and Logistics Coordinator
Delivery Driver
Back of House
Executive Chef
Chef de Cuisine
Sous Chef
Junior Sous Chef
Kitchen Manager
Kitchen Supervisor
Prep Cook
Line Cook
Garde Manger Cook
Grill Cook
Sauté Cook
Fry Cook
Broiler / Roast Cook
Breakfast / Brunch Cook
Production Cook
Banquet Chef
Banquet Sous Chef
Catering Chef
Catering Prep Team
Pastry Chef
Pastry Cook
Baker
Butcher
Fish Butcher
Expeditor
Stewarding and Utility
Stewarding Manager
Dishwasher
Pot Washer
Kitchen Porter
Janitorial Staff
Sanitation Specialist
Support and Administration
Purchasing Manager
Receiving Clerk
Inventory Control Specialist
Human Resources Manager
Training Manager
Scheduler / Labor Coordinator
Payroll / Bookkeeping Support
Sales and Marketing Manager
Customer Experience Manager
Facilities / Maintenance Technician
IT / POS Support
PRACTICAL NOTE FOR A LUXURY MULTI FACETED OPERATION

For a restaurant with fine dining, banquets, and catering, the most important thing is not just having titles. It is making sure each role has a clear lane of responsibility.

A strong structure usually follows this flow:

Guest Experience

Maitre d'
Dining Room Manager
Captains
Servers
Sommeliers
Banquet team
Event coordination

Food Production

Executive Chef
Chef de Cuisine
Sous Chefs
Prep team
Line cooks
Banquet kitchen
Pastry
Stewarding

Revenue and Execution

General Manager
Banquet Manager
Catering Manager
Event Sales Manager
Event Coordinator
Purchasing and inventory support
---
Keep your responses concise but informative.

User's question:
---
{{{message}}}
---
`,
});

const aiChefFlow = ai.defineFlow(
  {
    name: 'aiChefFlow',
    inputSchema: AiChefInputSchema,
    outputSchema: AiChefOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response that conforms to the required JSON schema.");
    }
    return output;
  }
);
