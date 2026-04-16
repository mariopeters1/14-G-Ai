"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Send, ChefHat } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ fullName: "", email: "", message: "" });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.fullName.trim().length < 2) errs.fullName = "Please enter your full name.";
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Please enter a valid email.";
    if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !firestore) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, "contacts"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setForm({ fullName: "", email: "", message: "" });
    } catch (err) {
      console.error("Error adding document:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    height: "3rem",
    transition: "border-color 0.2s",
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
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">
            Contact Us
          </div>
          <h2 className="font-headline text-4xl font-bold mt-4 text-white">
            Let&apos;s Build the Future of Food.
          </h2>
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
          <div
            className="max-w-xl mx-auto mt-12 rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.1)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <h3 className="text-2xl text-white font-headline">Send us a Message</h3>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-white font-medium text-lg">Message Sent!</div>
                <div className="text-white/40 text-sm mt-2">Thank you for contacting us. We&apos;ll get back to you shortly.</div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="text-white/70 text-sm font-medium mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.fullName ? "#EF4444" : "rgba(255,255,255,0.1)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#D4A373")}
                    onBlur={(e) => (e.target.style.borderColor = errors.fullName ? "#EF4444" : "rgba(255,255,255,0.1)")}
                  />
                  {errors.fullName && <span className="text-xs mt-1 block" style={{ color: "#EF4444" }}>{errors.fullName}</span>}
                </div>

                <div>
                  <label className="text-white/70 text-sm font-medium mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.email ? "#EF4444" : "rgba(255,255,255,0.1)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#D4A373")}
                    onBlur={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "rgba(255,255,255,0.1)")}
                  />
                  {errors.email && <span className="text-xs mt-1 block" style={{ color: "#EF4444" }}>{errors.email}</span>}
                </div>

                <div>
                  <label className="text-white/70 text-sm font-medium mb-1.5 block">Message</label>
                  <textarea
                    placeholder="Your message..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    style={{
                      ...inputStyle,
                      height: "auto",
                      minHeight: "120px",
                      resize: "vertical",
                      borderColor: errors.message ? "#EF4444" : "rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#D4A373")}
                    onBlur={(e) => (e.target.style.borderColor = errors.message ? "#EF4444" : "rgba(255,255,255,0.1)")}
                  />
                  {errors.message && <span className="text-xs mt-1 block" style={{ color: "#EF4444" }}>{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    backgroundColor: "rgba(212,163,115,0.15)",
                    color: "#D4A373",
                    border: "1px solid rgba(212,163,115,0.4)",
                  }}
                >
                  {loading ? <ChefHat className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Send Message
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
