"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Please enter your full name." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export default function Contact() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!firestore) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, "contacts"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem sending your message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-us" className="bg-background py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      
      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
            <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">Contact Us</div>
            <h2 className="font-headline text-4xl font-bold mt-4 text-white">Let's Build the Future of Food.</h2>
            <p className="text-white/60 mt-4 font-light text-lg">
                Have questions or want to be part of our pilot? Drop us a line.
            </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
        >
          <Card className="max-w-xl mx-auto mt-12 bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl relative overflow-hidden">
              <CardHeader className="pb-4">
               <CardTitle className="text-2xl text-white font-headline">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-white/80">Full Name</FormLabel>
                          <FormControl>
                          <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 h-12" placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                   <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-white/80">Email Address</FormLabel>
                          <FormControl>
                          <Input className="bg-black/40 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 h-12" type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel className="text-white/80">Message</FormLabel>
                          <FormControl>
                              <Textarea className="bg-black/40 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 min-h-[120px]" placeholder="Your message..." {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <Button type="submit" className="w-full h-12 text-md transition-all duration-300 bg-primary/20 text-primary hover:bg-primary hover:text-background border border-primary/50" size="lg" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                      Send Message
                  </Button>
                  </form>
              </Form>
              </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
