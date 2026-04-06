
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generateSchedule,
  type StaffSchedulingOutput,
} from '@/ai/flows/staff-scheduling-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Sparkles,
  UserPlus,
  CalendarDays,
  Clock,
  DollarSign,
  BrainCircuit,
  Settings,
  Trash2,
} from 'lucide-react';

const schedulerFormSchema = z.object({
  demandForecast: z.string().min(1, 'Demand forecast is required.'),
  specialEvents: z.string().min(1, 'Please enter any special events or note if there are none.'),
  employeeData: z.string().min(1, 'Employee data is required.'),
});

type SchedulerFormData = z.infer<typeof schedulerFormSchema>;

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export default function StaffPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StaffSchedulingOutput | null>(null);
  const [roles, setRoles] = useState([
    'General Manager', 'Assistant Manager', 'Floor Supervisor', 'Host / Hostess', 'Maître D’', 'Lead Server', 'Server / Waiter / Waitress', 'Food Runner', 'Busser', 'Bartender', 'Barback', 'Sommelier / Wine Steward', 'Beverage Director', 'Cocktail Server', 'VIP/Concierge Host', 'Lounge Attendant', 'Reservation Specialist', 'Coat Check Attendant', 'Guest Relations Specialist', 'Executive Chef', 'Chef de Cuisine', 'Sous Chef', 'Pastry Chef', 'Line Cook', 'Prep Cook', 'Garde Manger (Cold Station)', 'Saucier (Sauce Cook)', 'Grill Cook', 'Fry Cook', 'Pantry Cook', 'Butcher', 'Sushi Chef', 'Baker', 'Dishwasher / Steward', 'Kitchen Porter', 'Chef de Partie (Station Chef)', 'Banquet Chef', 'Catering Manager', 'Private Event Chef', 'Chef’s Table Host', 'R&D Chef (Research & Development)', 'Menu Development Specialist', 'Food Stylist', 'Tasting Room Host', 'Head Bartender / Mixologist', 'DJ', 'VJ (Video Jockey)', 'Audio/Visual Technician', 'Event Host / MC', 'Bar Manager', 'Security / Door Host', 'Cigar Lounge Attendant', 'Office Administrator', 'HR Coordinator', 'Payroll Specialist', 'Inventory Manager', 'Purchasing Manager', 'Maintenance Supervisor', 'Cleaning Crew / Janitorial', 'POS/IT Specialist', 'AI Systems Coordinator', 'Digital Menu Content Manager', 'Social Media Manager', 'Marketing & Promotions Coordinator', 'Smartbrew Operator', 'Merchandise Manager', 'Brand Ambassador', 'Guest Experience Innovator', 'Community Outreach Coordinator'
  ].sort());
  const [newRoleInput, setNewRoleInput] = useState('');
  const [newHire, setNewHire] = useState({ name: '', role: '', rate: '', availability: '' });

  const form = useForm<SchedulerFormData>({
    resolver: zodResolver(schedulerFormSchema),
    defaultValues: {
      demandForecast: 'High traffic expected Friday and Saturday from 7-9 PM. Lunch rush is 12-2 PM daily.',
      specialEvents: 'Private party for 30 on Saturday requires 2 extra servers and 1 bartender from 6 PM.',
      employeeData: 'Alice (Chef, $25.00/hr): Mon-Fri 9am-5pm; Bob (Server, $15.50/hr): available weekends; Charlie (Bartender, $18.00/hr): not available Tuesdays; David (Server, $15.50/hr): any day after 5pm.',
    },
  });

  const onSubmit = async (data: SchedulerFormData) => {
    setLoading(true);
    setResult(null);
    try {
      const aiResult = await generateSchedule(data);
      setResult(aiResult);
      toast({
        title: 'Schedule Generated!',
        description: 'The AI has created an optimized weekly schedule.',
      });
    } catch (error) {
      console.error('Error calling AI flow:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate schedule. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    if (newRoleInput.trim() && !roles.map(r => r.toLowerCase()).includes(newRoleInput.trim().toLowerCase())) {
        const newRole = newRoleInput.trim().charAt(0).toUpperCase() + newRoleInput.trim().slice(1);
        setRoles([...roles, newRole].sort());
        setNewRoleInput('');
        toast({
            title: "Role Added",
            description: `"${newRole}" has been added to the roles list.`,
        });
    } else if (!newRoleInput.trim()) {
        toast({
            variant: "destructive",
            title: "Failed to Add Role",
            description: "Role name cannot be empty.",
        });
    } else {
         toast({
            variant: "destructive",
            title: "Failed to Add Role",
            description: "This role already exists.",
        });
    }
  };

  const handleDeleteRole = (roleToDelete: string) => {
    setRoles(roles.filter(role => role !== roleToDelete));
    toast({
        title: "Role Removed",
        description: `"${roleToDelete}" has been removed from the roles list.`,
    });
  };

  const handleAddEmployee = () => {
    const { name, role, rate, availability } = newHire;
    if (!name || !role || !rate) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out the name, role, and pay rate.',
        });
        return;
    }

    const newEmployeeString = `${name} (${role}, $${parseFloat(rate).toFixed(2)}/hr): ${availability || 'No availability notes'}`;
    
    const currentEmployeeData = form.getValues('employeeData');
    const updatedEmployeeData = currentEmployeeData ? `${currentEmployeeData}; ${newEmployeeString}` : newEmployeeString;

    form.setValue('employeeData', updatedEmployeeData, { shouldValidate: true });

    toast({
        title: 'Employee Added!',
        description: `${name} has been added to the employee data for scheduling.`,
    });

    setNewHire({ name: '', role: '', rate: '', availability: '' });
  };


  return (
    <div className="container mx-auto py-10">
      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                        <BrainCircuit className="h-6 w-6" />
                        </div>
                        <div>
                        <CardTitle className="font-headline text-2xl">AI Staff Scheduler</CardTitle>
                        <CardDescription>
                            Provide data to generate an optimized weekly schedule.
                        </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="demandForecast" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Demand Forecast & Peak Hours</FormLabel>
                            <FormControl>
                                <Textarea rows={3} placeholder="e.g., High traffic expected Friday..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="specialEvents" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Special Events or Requests</FormLabel>
                            <FormControl>
                                <Textarea rows={3} placeholder="e.g., Private party for 30..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="employeeData" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Employee Availability, Roles, & Pay Rates</FormLabel>
                            <FormControl>
                                <Textarea rows={5} className="font-mono text-xs" placeholder="e.g., Alice (Chef, $25/hr): Mon-Fri 9am-5pm..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" disabled={loading} size="lg" className="w-full">
                            {loading ? (
                            <>
                                <Loader2 className="mr-2 animate-spin" />
                                Generating...
                            </>
                            ) : (
                            <>
                                <Sparkles className="mr-2" />
                                Get AI-Powered Schedule
                            </>
                            )}
                        </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <UserPlus /> Add New Hire
                    </CardTitle>
                    <CardDescription>
                        Add an employee to use in the AI Scheduler.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-hire-name">Full Name</Label>
                            <Input id="new-hire-name" placeholder="e.g., Jane Doe" value={newHire.name} onChange={(e) => setNewHire({...newHire, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="new-hire-role">Role</Label>
                             <Select value={newHire.role} onValueChange={(value) => setNewHire({...newHire, role: value})}>
                                 <SelectTrigger id="new-hire-role">
                                     <SelectValue placeholder="Select a role" />
                                 </SelectTrigger>
                                 <SelectContent>
                                     {roles.map((role) => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-hire-rate">Hourly Pay Rate ($)</Label>
                            <Input id="new-hire-rate" type="number" placeholder="e.g., 25.50" value={newHire.rate} onChange={(e) => setNewHire({...newHire, rate: e.target.value})} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-hire-availability">Availability / Notes</Label>
                            <Textarea id="new-hire-availability" rows={3} placeholder="e.g., Available evenings and weekends. Not available Tuesdays." value={newHire.availability} onChange={(e) => setNewHire({...newHire, availability: e.target.value})} />
                        </div>
                        <Button type="button" variant="secondary" className="w-full" onClick={handleAddEmployee}>Add Employee to Roster</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Settings className="h-5 w-5"/> Manage Roles
                    </CardTitle>
                    <CardDescription>
                        Add or remove roles available for scheduling.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input 
                                placeholder="New role name..."
                                value={newRoleInput}
                                onChange={(e) => setNewRoleInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddRole();
                                    }
                                }}
                            />
                            <Button onClick={handleAddRole}>Add</Button>
                        </div>
                        <div className="space-y-2">
                            {roles.length > 0 && <Label>Existing Roles</Label>}
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {roles.map(role => (
                                    <div key={role} className="flex items-center justify-between rounded-md border p-2 bg-accent/50">
                                        <span className="text-sm font-medium">{role}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteRole(role)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {roles.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No roles defined. Add one above.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-3">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] p-8 text-center bg-card rounded-lg border">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-2xl font-headline font-bold mt-4">AI is building your schedule...</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Optimizing shifts based on your forecasts, staff availability, and special events.</p>
            </div>
          )}

          {!loading && !result && (
             <Card className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-accent/50 border-dashed">
                <div className="bg-background p-4 rounded-full border shadow-sm mb-4">
                  <CalendarDays className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-headline font-bold">Your Optimized Schedule Will Appear Here</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">Fill in your staffing data and let Gastronomic AI create a balanced and cost-effective weekly schedule.</p>
            </Card>
          )}

          {!loading && result && (
            <div className="space-y-6">
              <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">AI-Generated Weekly Schedule</CardTitle>
                    <p className="text-muted-foreground">{result.summary}</p>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="font-bold text-lg">Total Weekly Labor Cost:</div>
                      <div className="text-2xl font-bold text-primary">${result.totalWeeklyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {daysOfWeek.map(day => {
                  const daySchedule = result.schedule[day];
                  return (
                    <Card key={day}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="font-headline capitalize text-lg">{day}</CardTitle>
                        <div className="text-sm font-bold flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4"/>
                          {daySchedule.dailyCost.toFixed(2)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {daySchedule.shifts.length > 0 ? (
                           <div className="space-y-3">
                             {daySchedule.shifts.map((shift, index) => (
                               <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-accent">
                                 <div>
                                   <p className="font-semibold">{shift.employeeName}</p>
                                   <p className="text-xs text-muted-foreground">{shift.role}</p>
                                 </div>
                                 <div className="flex items-center gap-2 text-xs font-mono">
                                   <Clock className="h-3 w-3" />
                                   <span>{shift.startTime} - {shift.endTime}</span>
                                   <span className="font-sans font-bold">({shift.hours} hrs)</span>
                                 </div>
                               </div>
                             ))}
                           </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No shifts scheduled.</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
