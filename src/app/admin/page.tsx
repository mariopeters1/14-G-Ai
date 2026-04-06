"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";

// Schema for the form
const formSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

type FormData = z.infer<typeof formSchema>;

// Data structure for a contact from Firestore
interface Contact {
  id: string;
  fullName: string;
  email: string;
  message: string;
  createdAt: Timestamp;
}

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for editing or creating
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fullName: "",
        email: "",
        message: "",
    }
  });
  
  // Fetch contacts from Firestore
  const fetchContacts = async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "contacts"));
      const contactsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[];
      // Sort by creation date, newest first
      contactsData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setContacts(contactsData);
    } catch (error) {
      console.error("Error fetching contacts: ", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch messages",
        description: "There was a problem fetching data from Firestore.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [firestore]);

  // Set form values when a contact is selected or when creating a new one
  useEffect(() => {
    if (isFormOpen) {
      if (selectedContact) {
        form.reset(selectedContact);
      } else {
        form.reset({
            fullName: "",
            email: "",
            message: "",
        });
      }
    }
  }, [isFormOpen, selectedContact, form]);

  // Handle create/update submission
  const onSubmit = async (data: FormData) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (selectedContact) {
        // Update existing contact
        const contactRef = doc(firestore, "contacts", selectedContact.id);
        await updateDoc(contactRef, data);
        toast({
          title: "Message Updated",
          description: "The message has been successfully updated.",
        });
      } else {
        // Create new contact message
        await addDoc(collection(firestore, "contacts"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast({
          title: "Message Created",
          description: "A new message has been successfully added.",
        });
      }
      fetchContacts(); // Refresh the list
      setIsFormOpen(false); // Close dialog
    } catch (error) {
      console.error("Error saving document: ", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save the message.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  // Handle contact deletion
  const handleDelete = async (contactId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "contacts", contactId));
      toast({
        title: "Message Deleted",
        description: "The message has been successfully deleted.",
      });
      setContacts(contacts.filter((contact) => contact.id !== contactId)); // Update UI immediately
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not delete the message.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold">Contact Messages</h1>
        <Button onClick={() => {
            setSelectedContact(null);
            setIsFormOpen(true);
        }}>
            <PlusCircle className="mr-2" />
            Create Message
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.fullName}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{contact.message}</TableCell>
                  <TableCell>
                    {contact.createdAt ? new Date(contact.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedContact(contact);
                        setIsFormOpen(true);
                    }}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this message from the database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(contact.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {contacts.length === 0 && !loading && (
            <div className="text-center p-8 text-muted-foreground">No messages found.</div>
          )}
        </CardContent>
      </Card>
    </div>

    {/* Form Dialog for Create/Edit */}
     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>{selectedContact ? "Edit Message" : "Create New Message"}</DialogTitle>
            <DialogDescription>
                {selectedContact ? "Make changes to the message here." : "Fill out the form to add a new message."}
            </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
                </DialogFooter>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
