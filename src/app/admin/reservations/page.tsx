'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CalendarIcon, UserPlus, Edit, Trash2, Loader2 } from 'lucide-react';

const formSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required.'),
  partySize: z.coerce.number().positive('Party size must be greater than 0.'),
  dateTime: z.date({ required_error: "A date and time is required." }),
  notes: z.string().optional(),
  status: z.enum(['Confirmed', 'Seated', 'Cancelled']).default('Confirmed'),
  table: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Reservation {
  id: string;
  guestName: string;
  partySize: number;
  dateTime: Date;
  status: 'Confirmed' | 'Seated' | 'Cancelled';
  table: number | string;
  notes?: string;
}

export default function ReservationsPage() {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [yesterday, setYesterday] = useState<Date | null>(null);

  useEffect(() => {
    // This ensures new Date() is only called on the client, preventing hydration errors.
    const today = new Date();
    setYesterday(new Date(new Date().setDate(today.getDate() - 1)));

    const initialReservations: Reservation[] = [
        { id: '1', guestName: 'Alice Johnson', partySize: 4, dateTime: new Date(new Date().setHours(19, 0, 0, 0)), status: 'Confirmed', table: 3, notes: "Window seat requested" },
        { id: '2', guestName: 'Bob Williams', partySize: 2, dateTime: new Date(new Date().setHours(18, 30, 0, 0)), status: 'Confirmed', table: 1 },
        { id: '3', guestName: 'Charlie Brown', partySize: 5, dateTime: new Date(new Date().setHours(20, 0, 0, 0)), status: 'Confirmed', table: 'N/A' },
        { id: '4', guestName: 'Diana Prince', partySize: 2, dateTime: new Date(new Date().setHours(17, 30, 0, 0)), status: 'Seated', table: 12 },
        { id: '5', guestName: 'Ethan Hunt', partySize: 3, dateTime: new Date(new Date().setHours(20, 30, 0, 0)), status: 'Confirmed', table: 'N/A', notes: "Birthday celebration" },
    ];
    setReservations(initialReservations.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
    setLoading(false);
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isFormOpen) {
      if (selectedReservation) {
        form.reset({
            ...selectedReservation,
            table: typeof selectedReservation.table === 'number' ? selectedReservation.table : undefined,
        });
      } else {
        form.reset({
          guestName: '',
          partySize: 2,
          notes: '',
          dateTime: undefined,
          status: 'Confirmed',
          table: undefined
        });
      }
    }
  }, [isFormOpen, selectedReservation, form]);


  const onSubmit = (data: FormData) => {
    // Simulate AI finding a table and adding/updating the reservation
    if (selectedReservation) {
        // Update
        setReservations(prev => prev!.map(res => res.id === selectedReservation.id ? { ...res, ...data, table: data.table ?? 'N/A' } : res));
        toast({ title: 'Reservation Updated', description: `${data.guestName}'s booking has been updated.` });
    } else {
        // Create
        const newReservation: Reservation = {
            id: new Date().toISOString(),
            ...data,
            table: data.table ?? 'N/A', // AI would assign this
        };
        setReservations(prev => [...(prev ?? []), newReservation].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
        toast({ title: 'Reservation Added', description: `${data.guestName}'s booking for ${data.partySize} has been confirmed.` });
    }
    
    setIsFormOpen(false);
    setSelectedReservation(null);
  };

  const handleDelete = (id: string) => {
    setReservations(prev => prev!.filter(res => res.id !== id));
    toast({ variant: 'destructive', title: 'Reservation Deleted', description: 'The booking has been removed.' });
  }

  const getStatusVariant = (status: Reservation['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Seated': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold">Reservations Management</h1>
            <p className="text-muted-foreground">A list of all bookings for today and beyond.</p>
          </div>
          <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="https://www.opentable.com" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-hvnr3.firebasestorage.app/o/Gastronomic%2Fopentable-logo-ZGYRVF2L.svg?alt=media&token=41e63ffc-e4e0-4600-a12b-d95bc9b087b8"
                    alt="OpenTable Logo"
                    width={90}
                    height={20}
                  />
                </Link>
              </Button>
               <Button asChild variant="outline">
                <Link href="https://www.yelp.com" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-hvnr3.firebasestorage.app/o/Gastronomic%2Fdownload.png?alt=media&token=d5bbad95-63fa-4906-939b-c7fdb6941bbd"
                    alt="Yelp Logo"
                    width={80}
                    height={30}
                    className="h-5 w-auto"
                  />
                </Link>
              </Button>
              <Button onClick={() => {
                  setSelectedReservation(null);
                  setIsFormOpen(true);
              }}>
                  <UserPlus className="mr-2" />
                  Add Reservation
              </Button>
          </div>
      </div>

        <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                      </TableRow>
                  ) : reservations && reservations.length > 0 ? reservations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>
                        <div className="font-medium">{res.guestName}</div>
                        <div className="text-sm text-muted-foreground">{res.partySize} people</div>
                      </TableCell>
                      <TableCell>{format(res.dateTime, "p")}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(res.status)}>{res.status}</Badge>
                      </TableCell>
                      <TableCell>{res.table}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{res.notes}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="icon" onClick={() => { setSelectedReservation(res); setIsFormOpen(true); }}>
                            <Edit className="h-4 w-4" />
                         </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 This will permanently delete the reservation for {res.guestName}.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(res.id)}>Delete</AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No upcoming reservations.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </div>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedReservation ? 'Edit Reservation' : 'Add New Reservation'}</DialogTitle>
                <DialogDescription>Let AI suggest the best table based on your floor plan.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="guestName" render={({ field }) => (
                <FormItem><FormLabel>Guest Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="partySize" render={({ field }) => (
                        <FormItem><FormLabel>Party Size</FormLabel><FormControl><Input type="number" placeholder="e.g., 4" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="table" render={({ field }) => (
                        <FormItem><FormLabel>Table (AI Suggestion)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
               </div>
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => yesterday ? date < yesterday : true} initialFocus />
                        <div className="p-3 border-t border-border">
                            <Input type="time" defaultValue={field.value ? format(field.value, "HH:mm") : ''}
                                onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                    const newDate = new Date(field.value || new Date());
                                    if(!isNaN(hours) && !isNaN(minutes)) {
                                      newDate.setHours(hours, minutes);
                                      field.onChange(newDate);
                                    }
                                }} />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Notes / Special Requests</FormLabel><FormControl><Textarea placeholder="e.g., Window seat preferred, birthday celebration." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit">Save Reservation</Button>
              </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
