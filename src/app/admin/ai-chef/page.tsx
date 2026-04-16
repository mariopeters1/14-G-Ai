"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { askAiChef } from "@/ai/flows/ai-chef-flow";
import {
  Bot,
  User,
  Send,
  ChefHat,
  Sparkles,
  Clock,
  Trash2,
  Copy,
  Check,
  BarChart3,
  MessageCircle,
  Zap,
  X,
  AlertCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// ─── Constants ──────────────────────────────────────────────────

const CHEF_AVATAR_URL =
  "https://firebasestorage.googleapis.com/v0/b/gastronomic-ai-landing.firebasestorage.app/o/Chez%20Lui%20Cafe%2FGastronomic%20Ai%2FImages%2FMario%20Peters%20(1).png?alt=media&token=20d65f5e-ab91-4522-b619-3b471ca7f842";

const mockSalesData = [
  { day: "Mon", sales: 4000 },
  { day: "Tue", sales: 3000 },
  { day: "Wed", sales: 5000 },
  { day: "Thu", sales: 8000 },
  { day: "Fri", sales: 12000 },
  { day: "Sat", sales: 15000 },
  { day: "Sun", sales: 10000 },
];

const quickPrompts = [
  { label: "Staffing Plan", prompt: "Show me the recommended staffing plan for a 150-seat luxury dining room." },
  { label: "Sales Chart", prompt: "Show me the sales chart for this week." },
  { label: "Menu Ideas", prompt: "Suggest a 5-course tasting menu for a farm-to-table spring dinner." },
  { label: "Cost Control", prompt: "What are the best strategies for controlling food cost under 28%?" },
];

// ─── Types ──────────────────────────────────────────────────────

const chatFormSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});
type ChatFormData = z.infer<typeof chatFormSchema>;

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Timestamp;
}

// ─── Component ──────────────────────────────────────────────────

export default function AiChefChatPage() {
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

  const form = useForm<ChatFormData>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "info" | "warning" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  // ─── Firestore listener ───────────────────────────────────

  useEffect(() => {
    if (!firestore) return;

    const messagesRef = collection(firestore, "ai-chef-chat/main-chat/messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
      },
      (error) => {
        console.error("Error listening to messages:", error);
        showToast("Could not fetch chat history.", "warning");
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  // ─── Auto-scroll ──────────────────────────────────────────

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiTyping]);

  // ─── Send Message ─────────────────────────────────────────

  const handleSendMessage = async (data: ChatFormData) => {
    if (!firestore) return;

    const userMessage = data.message.trim();
    form.reset();

    const messagesRef = collection(firestore, "ai-chef-chat/main-chat/messages");

    try {
      await addDoc(messagesRef, {
        text: userMessage,
        sender: "user",
        timestamp: serverTimestamp(),
      });
      setIsAiTyping(true);

      // Chart demo
      if (userMessage.toLowerCase().includes("chart") || userMessage.toLowerCase().includes("sales")) {
        setTimeout(async () => {
          await addDoc(messagesRef, {
            text: "Here is the sales chart for the last 7 days. We're seeing a strong push into the weekend, with Saturday leading at $15,000.\n[RENDER_SALES_CHART]",
            sender: "ai",
            timestamp: serverTimestamp(),
          });
          setIsAiTyping(false);
        }, 1500);
        return;
      }

      // AI flow
      const aiResponse = await askAiChef({ message: userMessage });

      await addDoc(messagesRef, {
        text: aiResponse.response,
        sender: "ai",
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error:", error);
      showToast("Failed to get a response from the Chef.", "warning");
    } finally {
      setIsAiTyping(false);
    }
  };

  // ─── Copy to clipboard ───────────────────────────────────

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace("[RENDER_SALES_CHART]", "").trim());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Quick prompt ─────────────────────────────────────────

  const handleQuickPrompt = (prompt: string) => {
    form.setValue("message", prompt);
    form.handleSubmit(handleSendMessage)();
  };

  // ─── Format timestamp ────────────────────────────────────

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return "";
    const d = ts.toDate();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="p-8 pb-4 font-sans max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : toastType === "warning"
              ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
              : "bg-white/10 text-white border-white/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "warning" && <AlertCircle className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={CHEF_AVATAR_URL}
                alt="Chef Mario Peters"
                className="w-11 h-11 rounded-full object-cover border-2 border-[#F59E0B]/30"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0D0D12]" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-white flex items-center gap-2">
                Chef Mario Peters
                <span className="text-xs font-normal text-neutral-500 border border-[#2D2D3A] px-2 py-0.5 rounded-full">
                  Gastronomic AI
                </span>
              </h1>
              <p className="text-xs text-neutral-500">Executive AI Chef • Kitchen Operations • Staffing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
              <Zap className="w-3 h-3" /> Online
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {/* Empty State */}
          {messages.length === 0 && !isAiTyping && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#1F1F28] flex items-center justify-center mb-6 border border-[#2D2D3A]">
                <img src={CHEF_AVATAR_URL} alt="Chef" className="w-14 h-14 rounded-xl object-cover" />
              </div>
              <h2 className="text-xl font-medium text-white mb-2">Welcome to Chef Mario&apos;s Office</h2>
              <p className="text-neutral-400 text-sm max-w-md mb-8">
                Ask anything about recipes, staffing plans, kitchen operations, cost control, or menu development.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => handleQuickPrompt(qp.prompt)}
                    className="p-4 bg-[#1C1C24] border border-[#2D2D3A] rounded-xl text-left hover:bg-[#2A2A36] hover:border-[#3D3D4A] transition-all group"
                  >
                    <div className="text-sm text-white font-medium mb-1 group-hover:text-white">{qp.label}</div>
                    <div className="text-xs text-neutral-500 line-clamp-2">{qp.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}>
              {/* AI Avatar */}
              {msg.sender === "ai" && (
                <img src={CHEF_AVATAR_URL} alt="Chef" className="w-8 h-8 rounded-full object-cover border border-[#F59E0B]/20 flex-shrink-0 mt-1" />
              )}

              {/* Bubble */}
              <div className={`max-w-[75%] group relative ${msg.sender === "user" ? "order-first" : ""}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "ai"
                      ? "bg-[#1C1C24] border border-[#2D2D3A] text-neutral-200"
                      : "bg-white text-black"
                  }`}
                >
                  {msg.text.includes("[RENDER_SALES_CHART]") ? (
                    <>
                      <p className="mb-3">{msg.text.replace("[RENDER_SALES_CHART]", "").trim()}</p>
                      <div className="h-48 w-full bg-[#0D0D12] rounded-xl border border-[#1F1F28] p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mockSalesData}>
                            <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: "#6B7280" }} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#6B7280" }} />
                            <Tooltip
                              contentStyle={{ background: "#111116", border: "1px solid #2D2D3A", borderRadius: "12px", fontSize: "12px", color: "#fff" }}
                              cursor={{ fill: "rgba(255,255,255,0.03)" }}
                              formatter={(value: number) => [`$${value.toLocaleString()}`, "Sales"]}
                            />
                            <Bar dataKey="sales" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>

                {/* Meta row */}
                <div className={`flex items-center gap-2 mt-1 ${msg.sender === "user" ? "justify-end" : ""}`}>
                  <span className="text-[10px] text-neutral-600">{formatTime(msg.timestamp)}</span>
                  {msg.sender === "ai" && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded-md"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-500" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#1F1F28] border border-[#2D2D3A] flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-neutral-400" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isAiTyping && (
            <div className="flex items-start gap-3">
              <img src={CHEF_AVATAR_URL} alt="Chef" className="w-8 h-8 rounded-full object-cover border border-[#F59E0B]/20 flex-shrink-0 mt-1" />
              <div className="px-4 py-3 rounded-2xl bg-[#1C1C24] border border-[#2D2D3A]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-neutral-500 ml-1">Chef Mario is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-[#1F1F28] bg-[#0D0D12]">
          {/* Quick prompts - show only when messages exist */}
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => handleQuickPrompt(qp.prompt)}
                  disabled={isAiTyping}
                  className="flex-shrink-0 px-3 py-1.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-neutral-400 hover:text-white rounded-lg text-[11px] border border-[#2D2D3A] transition-colors disabled:opacity-30"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-center gap-3">
            <input
              {...form.register("message")}
              ref={(e) => {
                form.register("message").ref(e);
                (inputRef as any).current = e;
              }}
              placeholder="Ask Chef Mario..."
              autoComplete="off"
              disabled={isAiTyping}
              className="flex-1 bg-[#1C1C24] border border-[#2D2D3A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors placeholder-neutral-500 disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  form.handleSubmit(handleSendMessage)();
                }
              }}
            />
            <button
              type="submit"
              disabled={isAiTyping}
              className="px-5 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #2d2d3a;
          border-radius: 4px;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
