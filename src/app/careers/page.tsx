'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

import { cn } from '@/lib/utils';
import { askAiChef } from '@/ai/flows/ai-chef-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { Upload, Video, Briefcase, Search, Building, Users, Camera, StopCircle, UploadCloud, FileVideo, RotateCw, Loader2, Bot, User, Send, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useStorage } from '@/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';


// Schema for the chat form
const chatFormSchema = z.object({
  message: z.string().min(1, { message: 'Message cannot be empty.' }),
});

type ChatFormData = z.infer<typeof chatFormSchema>;

// Data structure for a chat message
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Timestamp;
}

// AI Career Chat Component
function AiCareerChat() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChatFormData>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: '',
    },
  });

  // Listen for new messages in Firestore
  useEffect(() => {
    if (!firestore) return;
    const messagesRef = collection(firestore, 'ai-careers-chat/public-chat/messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: Message[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    }, (error) => {
      console.error("Error listening to messages:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not fetch chat history. Please refresh the page.",
      });
    });

    return () => unsubscribe();
  }, [firestore, toast]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping]);


  const handleSendMessage = async (data: ChatFormData) => {
    if (!firestore) return;
    const userMessage = data.message;
    form.reset();

    const messagesRef = collection(firestore, 'ai-careers-chat/public-chat/messages');
    try {
      await addDoc(messagesRef, {
        text: userMessage,
        sender: 'user',
        timestamp: serverTimestamp(),
      });
      setIsAiTyping(true);

      const aiResponse = await askAiChef({ message: userMessage });

      await addDoc(messagesRef, {
        text: aiResponse.response,
        sender: 'ai',
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error sending message or getting AI response:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message or get a response from the AI.',
      });
    } finally {
        setIsAiTyping(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto flex flex-col h-[70vh]">
        <CardHeader className="bg-primary/5 border-b mb-4">
          <CardTitle className="font-headline text-xl flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842" className="object-cover" />
              <AvatarFallback><Bot className="text-primary" /></AvatarFallback>
            </Avatar>
            <span>Chef Mario Peters Career Advisor</span>
          </CardTitle>
          <CardDescription>
            Ask about roles, responsibilities, or company culture.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
             <div className="p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-start gap-3", msg.sender === 'user' && 'justify-end')}>
                  {msg.sender === 'ai' && (
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                      <AvatarImage src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842" className="object-cover" />
                      <AvatarFallback><Bot className="text-primary" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", 
                     msg.sender === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
                     <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                   {msg.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isAiTyping && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border-2 border-primary/50">
                      <AvatarImage src="https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842" className="object-cover" />
                      <AvatarFallback><Bot className="text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-xs p-3 rounded-lg bg-secondary flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                        <span className="text-sm text-muted-foreground">AI is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Ask about a career at Gastronomic AI..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isAiTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Form>
        </div>
      </Card>
  );
}


export default function CareersPage() {
    const { toast } = useToast();
    const storage = useStorage();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const recordedVideoUrl = recordedVideo ? URL.createObjectURL(recordedVideo) : null;

    const handleReset = useCallback(() => {
        setRecordedVideo(null);
        setIsRecording(false);
        setIsUploading(false);
        setUploadProgress(0);
        if (streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, []);

    const getCameraPermission = useCallback(async () => {
      if (hasCameraPermission !== null) return;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    }, [hasCameraPermission, toast]);

    useEffect(() => {
        let isMounted = true;
        if (isDialogOpen) {
            getCameraPermission();
        } else {
            // Cleanup when dialog closes
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (isMounted) {
                handleReset();
            }
        }
        return () => { isMounted = false };
    }, [isDialogOpen, getCameraPermission, handleReset]);

    const handleStartRecording = () => {
        if (!streamRef.current) return;
        setIsRecording(true);
        const recordedChunks: Blob[] = [];
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            setRecordedVideo(videoBlob);
            setIsRecording(false);
        };

        mediaRecorderRef.current.start();
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current?.stop();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setRecordedVideo(file);
        }
    };
    
    const handleUpload = async () => {
        if (!recordedVideo || !storage) return;
        setIsUploading(true);
        setUploadProgress(0);

        const fileName = `video-profile-${Date.now()}.webm`;
        const sRef = storageRef(storage, `video-profiles/${fileName}`);
        const uploadTask = uploadBytesResumable(sRef, recordedVideo);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Upload Failed',
                    description: 'There was a problem uploading your video. Please try again.',
                });
                setIsUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    toast({
                        title: 'Upload Successful!',
                        description: 'Your video profile has been uploaded.',
                    });
                    // Here you would typically save the downloadURL to a user's database record.
                    setIsUploading(false);
                    setTimeout(() => setIsDialogOpen(false), 500); // Close dialog after a short delay
                });
            }
        );
    };

    return (
        <div className="flex min-h-screen flex-col bg-secondary/50">
        <Header />
        <main className="flex-1">
            <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-lg bg-primary/10 text-primary px-3 py-1 text-sm font-medium">Careers</div>
                <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">
                    Join Our Culinary Network
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Connecting the brightest talent with the most innovative kitchens. Whether you're seeking your next role or your next star employee, your search starts here.
                </p>
                </div>

                <div className="mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-2">
                {/* For Job Seekers */}
                <Card className="flex flex-col">
                    <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">For Job Seekers</CardTitle>
                            <CardDescription>Find your next role in the culinary world.</CardDescription>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="resume-upload" className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload Your Resume</Label>
                            <Input id="resume-upload" type="file" />
                        </div>

                        <div className="space-y-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Award className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-primary">Earn Gastronomic AI Certifications</h3>
                            <p className="text-sm text-muted-foreground">
                                We invest in your growth. Complete any training module and receive a certification to showcase your new skills.
                            </p>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Video className="h-4 w-4" /> Create a Video Profile</Label>
                                <Button variant="outline" className="w-full justify-start">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Record or Upload a Video
                                </Button>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="font-headline text-2xl">Video Profile</DialogTitle>
                                    <DialogDescription>
                                        Record a short video to introduce yourself, or upload an existing one.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                <div className="aspect-video w-full bg-black rounded-md overflow-hidden relative">
                                    <video ref={videoRef} src={recordedVideoUrl ?? undefined} autoPlay muted={!recordedVideo} controls={!!recordedVideo} className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        {hasCameraPermission === null && (
                                            <div className="text-white flex items-center gap-2">
                                                <Loader2 className="animate-spin h-4 w-4" />
                                                <span>Requesting camera access...</span>
                                            </div>
                                        )}
                                        {hasCameraPermission === false && (
                                            <Alert variant="destructive">
                                                <Camera className="h-4 w-4" />
                                                <AlertTitle>Camera Access Required</AlertTitle>
                                                <AlertDescription>
                                                    Please allow camera and microphone access in your browser to record a video.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                                {isUploading && (
                                    <div className="space-y-2">
                                        <Progress value={uploadProgress} />
                                        <p className="text-sm text-center text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</p>
                                    </div>
                                )}
                                </div>
                                <DialogFooter>
                                    {recordedVideo ? (
                                        <div className="w-full flex justify-between">
                                            <Button variant="outline" onClick={handleReset} disabled={isUploading}>
                                                <RotateCw className="mr-2" /> Record Again
                                            </Button>
                                            <Button onClick={handleUpload} disabled={isUploading}>
                                                {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <UploadCloud className="mr-2" />}
                                                Upload Profile Video
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="w-full flex flex-col sm:flex-row gap-2">
                                             <Button className="w-full" onClick={handleStartRecording} disabled={isRecording || hasCameraPermission !== true}>
                                                <Camera className="mr-2" /> Start Recording
                                            </Button>
                                            <Button className="w-full" onClick={handleStopRecording} disabled={!isRecording} variant="destructive">
                                                <StopCircle className="mr-2" /> Stop Recording
                                            </Button>
                                            <div className="w-full">
                                                <Input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                                                <Label htmlFor="video-upload" className="w-full">
                                                    <Button variant="secondary" asChild className="w-full cursor-pointer">
                                                        <div><FileVideo className="mr-2" /> Upload File</div>
                                                    </Button>
                                                </Label>
                                            </div>
                                        </div>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button size="lg" className="w-full">
                            <Search className="mr-2 h-4 w-4" />
                            Browse Open Positions
                        </Button>
                    </div>
                </Card>

                {/* For Employers */}
                <Card className="flex flex-col">
                    <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                            <Building className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="font-headline text-2xl">For Employers</CardTitle>
                            <CardDescription>Find the perfect hire for your team.</CardDescription>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="candidate-search" className="flex items-center gap-2"><Search className="h-4 w-4" /> Search Candidate Profiles</Label>
                            <Input id="candidate-search" placeholder="Search by role, skill, or name..." />
                        </div>
                        <p className="text-sm text-center text-muted-foreground pt-4">Recruit top-tier talent effortlessly.</p>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button size="lg" className="w-full">
                            <Briefcase className="mr-2 h-4 w-4" /> Post a Job Opening
                        </Button>
                    </div>
                </Card>
                </div>
            </div>
            </section>
            <section className="py-16 md:py-24 bg-background">
                <div className="container px-4 md:px-6">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">Chef Mario Peters Career Advisor</div>
                        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl mt-4">Have Questions About a Career with Us?</h2>
                        <p className="mt-4 text-muted-foreground md:text-lg">
                            Ask our Chef Assistant about roles, company culture, or our operational structure. Get instant answers.
                        </p>
                    </div>
                    <div className="mt-8">
                        <AiCareerChat />
                    </div>
                </div>
            </section>
        </main>
        <Footer />
        </div>
    );
}
