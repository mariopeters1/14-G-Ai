"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { askAiChef } from "@/ai/flows/ai-chef-flow";
import { useFirestore, useStorage } from "@/firebase";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import {
  Upload, Video, Briefcase, Search, Building, Users, Camera, StopCircle,
  UploadCloud, FileVideo, RotateCw, Bot, User, Send, Award, ChefHat, X,
  ChevronDown, Sparkles, MapPin, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Timestamp;
}

// ─── Open Positions Data ────────────────────────────────────────

const OPEN_POSITIONS = [
  { category: "Corporate / Multi-Unit Management", roles: ["Director of Operations", "Regional Manager", "Area Manager", "Corporate Executive Chef", "Corporate Pastry Chef", "Director of Beverage", "Director of Events & Catering", "Director of Human Resources", "Director of Training & Development", "Director of Purchasing / Procurement"] },
  { category: "General Management (Unit Level)", roles: ["General Manager (GM)", "Assistant General Manager (AGM)", "Restaurant Manager", "Floor Manager", "Bar Manager", "Lounge Manager", "Nightlife / Entertainment Manager"] },
  { category: "Guest Experience & Service Team (FOH)", roles: ["Maitre d' / Host Manager", "Host / Hostess", "Reservationist", "Guest Relations Manager", "VIP Concierge"] },
  { category: "Dining Room Service (FOH)", roles: ["Captain / Lead Server", "Server / Waiter / Waitress", "Back Server / Server Assistant", "Food Runner", "Busser"] },
  { category: "Beverage Team", roles: ["Sommelier", "Head Bartender / Mixologist", "Bartender", "Barback", "Beverage Server / Cocktail Server"] },
  { category: "Entertainment & Experience", roles: ["DJ", "Live Music Coordinator", "AV / Sound Technician", "Lighting Technician"] },
  { category: "Kitchen Leadership (BOH)", roles: ["Executive Chef (You)", "Chef de Cuisine", "Sous Chef (Senior / Junior)", "Kitchen Manager"] },
  { category: "Hot Line & Production (BOH)", roles: ["Line Cook", "Grill Cook", "Sauté Cook", "Fry Cook", "Fish Cook", "Expo (Expeditor)"] },
  { category: "Prep & Support (BOH)", roles: ["Prep Cook", "Butcher", "Fishmonger", "Commissary Cook"] },
  { category: "Garde Manger & Cold Station (BOH)", roles: ["Garde Manger Chef", "Salad / Cold Prep Cook"] },
  { category: "Pastry & Bakery (BOH)", roles: ["Pastry Chef", "Pastry Cook", "Baker"] },
  { category: "Sanitation & Stewardship (BOH)", roles: ["Dishwasher", "Steward", "Kitchen Porter"] },
  { category: "Event Operations", roles: ["Banquet Manager", "Event Coordinator", "Wedding Coordinator", "Private Dining Manager"] },
  { category: "Banquet Service", roles: ["Banquet Captain", "Banquet Server", "Banquet Bartender", "Setup / Breakdown Crew"] },
  { category: "Catering Management", roles: ["Catering Director", "Catering Sales Manager", "Catering Coordinator"] },
  { category: "Catering Operations", roles: ["Catering Chef", "Catering Cook", "Delivery Driver", "Event Setup Team"] },
  { category: "Bar, Lounge & Nightlife", roles: ["Lounge Manager", "Bottle Service Manager", "VIP Host", "Bottle Server", "Security Supervisor", "Security Staff"] },
  { category: "Administration & Support", roles: ["Accountant", "Bookkeeper", "Payroll Specialist", "Office Manager", "HR Manager", "Recruiter", "Training Manager", "Marketing Director", "Social Media Manager", "Content Creator", "Photographer / Videographer", "Systems Administrator", "POS Specialist", "Data Analyst", "AI / Automation Manager"] },
  { category: "Facilities & Maintenance", roles: ["Maintenance Manager", "Technician", "Cleaning Crew / Janitorial"] },
  { category: "Specialized Roles (High-end / Innovative Concepts)", roles: ["Chef Table Coordinator", "Culinary Experience Director", "Food Stylist", "R&D Chef", "Sustainability Manager", "Inventory Analyst", "Guest Data Specialist"] },
];

// ─── AI Career Chat Component ───────────────────────────────────

function AiCareerChat() {
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!firestore) return;
    const messagesRef = collection(firestore, "ai-careers-chat/public-chat/messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs: Message[] = [];
      snap.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [firestore]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue("");

    const messagesRef = collection(firestore, "ai-careers-chat/public-chat/messages");
    try {
      await addDoc(messagesRef, { text, sender: "user", timestamp: serverTimestamp() });
      setIsAiTyping(true);
      const aiResponse = await askAiChef({ message: text });
      await addDoc(messagesRef, { text: aiResponse.response, sender: "ai", timestamp: serverTimestamp() });
    } catch (err) {
      console.error("Chat error:", err);
      // Show error in chat so user knows what happened
      try {
        await addDoc(messagesRef, {
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          sender: "ai",
          timestamp: serverTimestamp(),
        });
      } catch { /* ignore */ }
    } finally {
      setIsAiTyping(false);
    }
  };

  const AVATAR_URL = "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842";

  return (
    <div className="max-w-3xl mx-auto rounded-2xl border overflow-hidden flex flex-col" style={{ height: "70vh", backgroundColor: "#111116", borderColor: "#1F1F28" }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: "#1F1F28", backgroundColor: "#0D0D12" }}>
        <img src={AVATAR_URL} alt="Chef Mario" className="w-10 h-10 rounded-full border-2 object-cover" style={{ borderColor: "#D4A373" }} />
        <div>
          <div className="text-white text-sm font-medium">Chef Mario Peters Career Advisor</div>
          <div className="text-xs" style={{ color: "#64646C" }}>Ask about roles, responsibilities, or company culture.</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[10px]" style={{ color: "#64646C" }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !isAiTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-10 h-10 mb-3" style={{ color: "#2A2A35" }} />
            <div className="text-sm" style={{ color: "#64646C" }}>Start a conversation with Chef Mario</div>
            <div className="text-xs mt-1" style={{ color: "#3A3A45" }}>Ask about any role or career path</div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : ""}`}>
            {msg.sender === "ai" && (
              <img src={AVATAR_URL} alt="Chef" className="w-7 h-7 rounded-full border object-cover flex-shrink-0 mt-0.5" style={{ borderColor: "#D4A37350" }} />
            )}
            <div
              className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{
                backgroundColor: msg.sender === "ai" ? "#1A1A22" : "#D4A373",
                color: msg.sender === "ai" ? "#E0E0E5" : "#0A0A0F",
                borderBottomLeftRadius: msg.sender === "ai" ? "4px" : undefined,
                borderBottomRightRadius: msg.sender === "user" ? "4px" : undefined,
              }}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
            {msg.sender === "user" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#1A1A22" }}>
                <User className="w-3.5 h-3.5" style={{ color: "#64646C" }} />
              </div>
            )}
          </div>
        ))}
        {isAiTyping && (
          <div className="flex items-start gap-2.5">
            <img src={AVATAR_URL} alt="Chef" className="w-7 h-7 rounded-full border object-cover flex-shrink-0 mt-0.5" style={{ borderColor: "#D4A37350" }} />
            <div className="px-4 py-2.5 rounded-2xl flex items-center gap-2" style={{ backgroundColor: "#1A1A22" }}>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: "#D4A373",
                      animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: "#64646C" }}>Chef is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: "#1F1F28", backgroundColor: "#0D0D12" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about a career at Gastronomic AI..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-neutral-600 outline-none border"
          style={{ backgroundColor: "#111116", borderColor: "#1F1F28" }}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isAiTyping || !inputValue.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
          style={{ backgroundColor: "#D4A373", color: "#0A0A0F" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <style jsx>{`
        @keyframes typing { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
      `}</style>
    </div>
  );
}

// ─── Accordion Item Component ───────────────────────────────────

function PositionGroup({ group, index }: { group: typeof OPEN_POSITIONS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "#1F1F28" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-left text-sm font-medium transition-colors hover:text-white"
        style={{ color: open ? "#D4A373" : "#8A8A95" }}
      >
        <span>{group.category}</span>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="pl-4 pb-3 space-y-1.5">
              {group.roles.map((role, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2 py-0.5 cursor-pointer transition-colors" style={{ color: "#64646C" }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: "#D4A37350" }} />
                  <span className="hover:text-[#D4A373] transition-colors">{role}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Video Dialog Component ─────────────────────────────────────

function VideoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const storage = useStorage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  const recordedVideoUrl = recordedVideo ? URL.createObjectURL(recordedVideo) : null;

  const handleReset = useCallback(() => {
    setRecordedVideo(null);
    setIsRecording(false);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadDone(false);
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, []);

  const getCameraPermission = useCallback(async () => {
    if (hasCameraPermission !== null) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setHasCameraPermission(true);
    } catch {
      setHasCameraPermission(false);
    }
  }, [hasCameraPermission]);

  useEffect(() => {
    if (open) {
      getCameraPermission();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      handleReset();
      setHasCameraPermission(null);
    }
  }, [open, getCameraPermission, handleReset]);

  const handleStartRecording = () => {
    if (!streamRef.current) return;
    setIsRecording(true);
    const chunks: Blob[] = [];
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorderRef.current.onstop = () => { setRecordedVideo(new Blob(chunks, { type: "video/webm" })); setIsRecording(false); };
    mediaRecorderRef.current.start();
  };

  const handleStopRecording = () => mediaRecorderRef.current?.stop();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setRecordedVideo(file);
  };

  const handleUpload = async () => {
    if (!recordedVideo || !storage) return;
    setIsUploading(true);
    setUploadProgress(0);
    const fileName = `video-profile-${Date.now()}.webm`;
    const sRef = storageRef(storage, `video-profiles/${fileName}`);
    const task = uploadBytesResumable(sRef, recordedVideo);
    task.on("state_changed",
      (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
      (err) => { console.error(err); setIsUploading(false); },
      () => {
        getDownloadURL(task.snapshot.ref).then(() => {
          setIsUploading(false);
          setUploadDone(true);
          setTimeout(() => onClose(), 1500);
        });
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-2xl border"
        style={{ backgroundColor: "#111116", borderColor: "#1F1F28" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#1F1F28" }}>
          <div>
            <div className="text-white font-medium">Video Profile</div>
            <div className="text-xs mt-0.5" style={{ color: "#64646C" }}>Record a short video or upload an existing one.</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X className="w-4 h-4 text-neutral-500" /></button>
        </div>

        {/* Video Preview */}
        <div className="p-5 space-y-4">
          <div className="aspect-video w-full rounded-xl overflow-hidden relative" style={{ backgroundColor: "#0A0A0F" }}>
            <video ref={videoRef} src={recordedVideoUrl ?? undefined} autoPlay muted={!recordedVideo} controls={!!recordedVideo} className="w-full h-full object-contain" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {hasCameraPermission === null && (
                <div className="text-white flex items-center gap-2 text-sm">
                  <ChefHat className="animate-spin h-4 w-4" style={{ color: "#D4A373" }} />
                  <span>Requesting camera access...</span>
                </div>
              )}
              {hasCameraPermission === false && (
                <div className="text-center rounded-xl p-6 border" style={{ backgroundColor: "#111116", borderColor: "#EF444430" }}>
                  <Camera className="w-8 h-8 mx-auto mb-2" style={{ color: "#EF4444" }} />
                  <div className="text-sm font-medium text-[#EF4444]">Camera Access Required</div>
                  <div className="text-xs mt-1" style={{ color: "#64646C" }}>Please enable camera and microphone in your browser settings.</div>
                </div>
              )}
            </div>
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: "#EF444420" }}>
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                <span className="text-xs text-[#EF4444]">Recording</span>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A22" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, backgroundColor: "#D4A373" }} />
              </div>
              <div className="text-xs text-center" style={{ color: "#64646C" }}>Uploading... {Math.round(uploadProgress)}%</div>
            </div>
          )}
          {uploadDone && (
            <div className="text-center text-sm text-[#10B981] font-medium py-2">✓ Upload successful!</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t flex gap-2" style={{ borderColor: "#1F1F28" }}>
          {recordedVideo ? (
            <>
              <button onClick={handleReset} disabled={isUploading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-colors hover:bg-white/5 disabled:opacity-30" style={{ borderColor: "#1F1F28", color: "#8A8A95" }}>
                <RotateCw className="w-3.5 h-3.5" /> Re-record
              </button>
              <button onClick={handleUpload} disabled={isUploading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50" style={{ backgroundColor: "#D4A373", color: "#0A0A0F" }}>
                {isUploading ? <ChefHat className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                Upload Profile Video
              </button>
            </>
          ) : (
            <>
              <button onClick={handleStartRecording} disabled={isRecording || hasCameraPermission !== true} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-30" style={{ backgroundColor: "#D4A373", color: "#0A0A0F" }}>
                <Camera className="w-3.5 h-3.5" /> Start Recording
              </button>
              <button onClick={handleStopRecording} disabled={!isRecording} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-30" style={{ backgroundColor: "#EF4444", color: "#fff" }}>
                <StopCircle className="w-3.5 h-3.5" /> Stop
              </button>
              <label className="flex-1">
                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm border cursor-pointer transition-colors hover:bg-white/5" style={{ borderColor: "#1F1F28", color: "#8A8A95" }}>
                  <FileVideo className="w-3.5 h-3.5" /> Upload File
                </div>
              </label>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Careers Page ──────────────────────────────────────────

// ─── Job Post Dialog Component ──────────────────────────────────

function JobPostDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: "", role: "", location: "", description: "", contactEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.company.trim()) errs.company = "Required";
    if (!form.role.trim()) errs.role = "Required";
    if (!form.location.trim()) errs.location = "Required";
    if (!form.description.trim() || form.description.trim().length < 10) errs.description = "Min 10 chars";
    if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail)) errs.contactEmail = "Valid email required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !firestore) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, "jobPostings"), {
        ...form,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error posting job:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#0D0D12",
    border: "1px solid #1F1F28",
    color: "#fff",
    borderRadius: "0.75rem",
    padding: "0.65rem 0.85rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border"
        style={{ backgroundColor: "#111116", borderColor: "#1F1F28" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#1F1F28" }}>
          <div>
            <div className="text-white font-medium">Post a Job Opening</div>
            <div className="text-xs mt-0.5" style={{ color: "#64646C" }}>Fill out the details to publish your listing.</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="text-white font-medium text-lg">Job Posted!</div>
            <div className="text-sm mt-2" style={{ color: "#64646C" }}>Your listing has been submitted and is pending review.</div>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ backgroundColor: "#3B82F6", color: "#fff" }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8A8A95" }}>Company Name</label>
                <input value={form.company} onChange={(e) => update("company", e.target.value)} style={{ ...inputStyle, borderColor: errors.company ? "#EF4444" : "#1F1F28" }} placeholder="Gastronomic AI" />
                {errors.company && <span className="text-[10px] mt-0.5 block" style={{ color: "#EF4444" }}>{errors.company}</span>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8A8A95" }}>Role Title</label>
                <input value={form.role} onChange={(e) => update("role", e.target.value)} style={{ ...inputStyle, borderColor: errors.role ? "#EF4444" : "#1F1F28" }} placeholder="Sous Chef" />
                {errors.role && <span className="text-[10px] mt-0.5 block" style={{ color: "#EF4444" }}>{errors.role}</span>}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8A8A95" }}>Location</label>
              <input value={form.location} onChange={(e) => update("location", e.target.value)} style={{ ...inputStyle, borderColor: errors.location ? "#EF4444" : "#1F1F28" }} placeholder="Miami, FL" />
              {errors.location && <span className="text-[10px] mt-0.5 block" style={{ color: "#EF4444" }}>{errors.location}</span>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8A8A95" }}>Job Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} style={{ ...inputStyle, borderColor: errors.description ? "#EF4444" : "#1F1F28", resize: "vertical" as const }} placeholder="Describe responsibilities, requirements, and benefits..." />
              {errors.description && <span className="text-[10px] mt-0.5 block" style={{ color: "#EF4444" }}>{errors.description}</span>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#8A8A95" }}>Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} style={{ ...inputStyle, borderColor: errors.contactEmail ? "#EF4444" : "#1F1F28" }} placeholder="hr@restaurant.com" />
              {errors.contactEmail && <span className="text-[10px] mt-0.5 block" style={{ color: "#EF4444" }}>{errors.contactEmail}</span>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: "#3B82F6", color: "#fff" }}
            >
              {loading ? <ChefHat className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
              Submit Job Posting
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function CareersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJobPostOpen, setIsJobPostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [employerSearch, setEmployerSearch] = useState("");

  const filteredPositions = OPEN_POSITIONS.filter((group) =>
    searchQuery === "" ||
    group.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.roles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalRoles = OPEN_POSITIONS.reduce((sum, g) => sum + g.roles.length, 0);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      <Header />
      <main className="flex-1">

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-[150px] pointer-events-none" style={{ backgroundColor: "#D4A37308" }} />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: "#8B5CF608" }} />

          <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center space-y-5"
            >
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase border" style={{ backgroundColor: "#D4A37310", color: "#D4A373", borderColor: "#D4A37325" }}>
                <Sparkles className="w-3.5 h-3.5" /> Careers
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-white leading-tight">
                Join Our Culinary <br className="hidden md:block" />
                <span style={{ color: "#D4A373" }}>Network</span>
              </h1>
              <p className="max-w-2xl text-base md:text-lg leading-relaxed" style={{ color: "#8A8A95" }}>
                Connecting the brightest talent with the most innovative kitchens. Whether you&apos;re seeking your next role or your next star employee, your search starts here.
              </p>

              {/* KPI Mini Strip */}
              <div className="flex items-center gap-8 mt-4 pt-6 border-t" style={{ borderColor: "#1F1F28" }}>
                {[
                  { value: `${totalRoles}+`, label: "Open Roles" },
                  { value: "20", label: "Departments" },
                  { value: "AI", label: "Powered Matching" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl font-bold text-white">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "#64646C" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ CARDS GRID ═══════════════ */}
        <section className="py-16 md:py-20">
          <div className="container px-4 md:px-6 mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2">

              {/* ─── JOB SEEKERS CARD ─── */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border overflow-hidden flex flex-col"
                style={{ backgroundColor: "#111116", borderColor: "#1F1F28" }}
              >
                {/* Card Header */}
                <div className="px-6 py-5 border-b flex items-center gap-4" style={{ borderColor: "#1F1F28" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#D4A37312", color: "#D4A373" }}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">For Job Seekers</div>
                    <div className="text-xs mt-0.5" style={{ color: "#64646C" }}>Find your next role in the culinary world.</div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-6 py-5 flex-1 space-y-5">
                  {/* Resume Upload */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                      <Upload className="w-3.5 h-3.5" style={{ color: "#D4A373" }} /> Upload Your Resume
                    </label>
                    <input
                      type="file"
                      className="w-full text-sm text-neutral-500 file:rounded-lg file:border-0 file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#0A0A0F] file:bg-[#D4A373] file:cursor-pointer cursor-pointer"
                      style={{ backgroundColor: "#0D0D12", borderRadius: "0.75rem", padding: "0.5rem", border: "1px solid #1F1F28" }}
                    />
                  </div>

                  {/* Certification Badge */}
                  <div className="rounded-xl border border-dashed p-5 text-center" style={{ borderColor: "#D4A37330", backgroundColor: "#D4A37305" }}>
                    <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-3" style={{ backgroundColor: "#D4A37312", color: "#D4A373" }}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-medium" style={{ color: "#D4A373" }}>Earn Gastronomic AI Certifications</div>
                    <div className="text-xs mt-1" style={{ color: "#64646C" }}>Complete training modules and receive certifications to showcase your skills.</div>
                  </div>

                  {/* Video Profile */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                      <Video className="w-3.5 h-3.5" style={{ color: "#D4A373" }} /> Create a Video Profile
                    </label>
                    <button
                      onClick={() => setIsDialogOpen(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all hover:bg-white/[0.02]"
                      style={{ borderColor: "#1F1F28", color: "#8A8A95" }}
                    >
                      <Camera className="w-4 h-4" /> Record or Upload a Video
                    </button>
                  </div>
                </div>

                {/* Positions Browser */}
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#D4A373", color: "#0A0A0F" }}>
                    <Search className="w-3.5 h-3.5" /> Browse Open Positions
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#64646C" }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search roles..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-neutral-600 outline-none border"
                      style={{ backgroundColor: "#0D0D12", borderColor: "#1F1F28" }}
                    />
                  </div>

                  <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1F1F28", backgroundColor: "#0D0D1280" }}>
                    <div className="max-h-72 overflow-y-auto px-4">
                      {filteredPositions.length > 0 ? (
                        filteredPositions.map((group, i) => (
                          <PositionGroup key={i} group={group} index={i} />
                        ))
                      ) : (
                        <div className="py-6 text-center text-sm" style={{ color: "#64646C" }}>No matching positions found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ─── EMPLOYERS CARD ─── */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border overflow-hidden flex flex-col"
                style={{ backgroundColor: "#111116", borderColor: "#1F1F28" }}
              >
                {/* Card Header */}
                <div className="px-6 py-5 border-b flex items-center gap-4" style={{ borderColor: "#1F1F28" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#3B82F612", color: "#3B82F6" }}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">For Employers</div>
                    <div className="text-xs mt-0.5" style={{ color: "#64646C" }}>Find the perfect hire for your team.</div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-6 py-5 flex-1 space-y-5">
                  {/* Candidate Search */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                      <Search className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} /> Search Candidate Profiles
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#64646C" }} />
                      <input
                        type="text"
                        value={employerSearch}
                        onChange={(e) => setEmployerSearch(e.target.value)}
                        placeholder="Search by role, skill, or name..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-neutral-600 outline-none border"
                        style={{ backgroundColor: "#0D0D12", borderColor: "#1F1F28" }}
                      />
                    </div>
                    {/* Live search results */}
                    {employerSearch.trim() && (
                      <div className="mt-2 rounded-xl border overflow-hidden" style={{ borderColor: "#1F1F28", backgroundColor: "#0D0D1280" }}>
                        <div className="max-h-48 overflow-y-auto">
                          {(() => {
                            const matches = OPEN_POSITIONS.flatMap((g) =>
                              g.roles.filter((r) => r.toLowerCase().includes(employerSearch.toLowerCase())).map((r) => ({ role: r, category: g.category }))
                            ).slice(0, 8);
                            return matches.length > 0 ? (
                              matches.map((m, i) => (
                                <div key={i} className="px-4 py-2.5 border-b flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer" style={{ borderColor: "#1F1F2850" }}>
                                  <div>
                                    <div className="text-sm text-white">{m.role}</div>
                                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "#64646C" }}>{m.category}</div>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#3B82F615", color: "#3B82F6" }}>Available</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-4 text-center text-xs" style={{ color: "#64646C" }}>No matching profiles found for &ldquo;{employerSearch}&rdquo;</div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Employer Benefits */}
                  <div className="space-y-3 mt-2">
                    {[
                      { icon: Users, label: "AI-Matched Candidates", desc: "Get the best matches for your open roles" },
                      { icon: Clock, label: "Fast Hiring Pipeline", desc: "Reduce time-to-hire by up to 60%" },
                      { icon: MapPin, label: "Location-Based Search", desc: "Find talent in your area instantly" },
                    ].map((b, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: "#0D0D12" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#3B82F610", color: "#3B82F6" }}>
                          <b.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{b.label}</div>
                          <div className="text-xs" style={{ color: "#64646C" }}>{b.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-center pt-2" style={{ color: "#64646C" }}>Recruit top-tier talent effortlessly.</p>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => setIsJobPostOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                    style={{ backgroundColor: "#3B82F6", color: "#fff" }}
                  >
                    <Briefcase className="w-4 h-4" /> Post a Job Opening
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════ AI CAREER CHAT ═══════════════ */}
        <section className="py-16 md:py-20" style={{ backgroundColor: "#0D0D12" }}>
          <div className="container px-4 md:px-6 mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase border mb-4" style={{ backgroundColor: "#1A1A22", borderColor: "#1F1F28", color: "#8A8A95" }}>
                <Bot className="w-3.5 h-3.5" /> AI Career Advisor
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">
                Have Questions About a Career <span style={{ color: "#D4A373" }}>with Us?</span>
              </h2>
              <p className="mt-3 text-sm md:text-base" style={{ color: "#64646C" }}>
                Ask our Chef Assistant about roles, company culture, or our operational structure.
              </p>
            </motion.div>
            <AiCareerChat />
          </div>
        </section>

        {/* Video Dialog */}
        <AnimatePresence>
          {isDialogOpen && <VideoDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />}
        </AnimatePresence>

        {/* Job Posting Dialog */}
        <AnimatePresence>
          {isJobPostOpen && <JobPostDialog open={isJobPostOpen} onClose={() => setIsJobPostOpen(false)} />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
