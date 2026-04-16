"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { ChefHat, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const ANNUAL_WEEKS = 52;
const TOTAL_SAVINGS_MULTIPLIER = 0.10;

export default function Calculator() {
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    weeklySeats: 500,
    tableTurns: 3,
    averageTicket: 45,
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
  });

  const [savings, setSavings] = useState({ annual: 0, waste: 0, revenue: 0 });

  useEffect(() => {
    const ws = form.weeklySeats > 0 ? form.weeklySeats : 0;
    const tt = form.tableTurns > 0 ? form.tableTurns : 0;
    const at = form.averageTicket > 0 ? form.averageTicket : 0;
    const weeklyRev = ws * tt * at;
    const annualRev = weeklyRev * ANNUAL_WEEKS;
    const annual = annualRev * TOTAL_SAVINGS_MULTIPLIER;
    setSavings({ annual, waste: annual * 0.5, revenue: annual * 0.5 });
  }, [form.weeklySeats, form.tableTurns, form.averageTicket]);

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.weeklySeats <= 0) errs.weeklySeats = "Required";
    if (form.tableTurns <= 0) errs.tableTurns = "Required";
    if (form.averageTicket <= 0) errs.averageTicket = "Required";
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.businessName.trim()) errs.businessName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !firestore) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, "costSavingsLeads"), {
        ...form,
        annualSavings: savings.annual,
        wasteSavings: savings.waste,
        extraRevenue: savings.revenue,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  };

  const labelStyle = { color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem", display: "block" };

  return (
    <section id="calculator" className="bg-background py-24 relative overflow-hidden border-y border-white/5">
      <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
        <div className="mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* ─── Left: Savings Display ─── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 tracking-wide uppercase">
              ROI Calculator
            </div>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white tracking-tight">
              Project Your Savings
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Our Interactive Cost-Savings Calculator demonstrates how Gastronomic AI can directly impact your
              bottom line. Add your restaurant&apos;s details to get a personalized projection.
            </p>
            <div className="space-y-6 pt-4">
              <h3 className="font-headline text-xl font-bold text-white">Estimated Annual Savings</h3>
              <p
                className="text-6xl font-bold tracking-tight transition-all duration-500"
                style={{
                  background: "linear-gradient(to right, #D4A373, #C9956C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "none",
                  filter: "drop-shadow(0 0 12px rgba(212,163,115,0.3))",
                }}
              >
                ${Math.round(savings.annual).toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <p className="text-sm font-light text-white/50 tracking-wide uppercase">Waste Savings</p>
                  <p className="text-3xl font-bold text-white mt-2">${Math.round(savings.waste).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <p className="text-sm font-light text-white/50 tracking-wide uppercase">Extra Revenue</p>
                  <p className="text-3xl font-bold text-white mt-2">${Math.round(savings.revenue).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Right: Form ─── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(16px)",
                borderColor: "rgba(255,255,255,0.1)",
                boxShadow: "0 0 40px rgba(212,163,115,0.1)",
              }}
            >
              <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <h3 className="font-headline text-2xl text-white">Get Your Free Report</h3>
                <p className="text-white/50 text-sm mt-1">Fill out the form for a detailed breakdown emailed to you.</p>
              </div>

              {submitted ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>
                    <ArrowRight className="w-7 h-7" />
                  </div>
                  <div className="text-white text-lg font-medium">Report on its way!</div>
                  <div className="text-white/40 text-sm mt-2">We&apos;ve sent the detailed cost-savings report to your email.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Calculator inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { key: "weeklySeats", label: "Weekly Seats", type: "number", placeholder: "500" },
                      { key: "tableTurns", label: "Table Turns", type: "number", placeholder: "3.0", step: "0.1" },
                      { key: "averageTicket", label: "Avg. Ticket ($)", type: "number", placeholder: "45" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={labelStyle}>{f.label}</label>
                        <input
                          type={f.type}
                          step={f.step}
                          placeholder={f.placeholder}
                          value={(form as any)[f.key]}
                          onChange={(e) => update(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                          style={{ ...inputStyle, borderColor: errors[f.key] ? "#EF4444" : "rgba(255,255,255,0.1)" }}
                          onFocus={(e) => (e.target.style.borderColor = "#D4A373")}
                          onBlur={(e) => (e.target.style.borderColor = errors[f.key] ? "#EF4444" : "rgba(255,255,255,0.1)")}
                        />
                        {errors[f.key] && <span className="text-xs mt-1 block" style={{ color: "#EF4444" }}>{errors[f.key]}</span>}
                      </div>
                    ))}
                  </div>

                  <div className="w-full h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

                  {/* Contact info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "firstName", label: "First Name" },
                      { key: "lastName", label: "Last Name" },
                      { key: "businessName", label: "Business Name" },
                      { key: "email", label: "Your Email", type: "email", placeholder: "you@restaurant.com" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={labelStyle}>{f.label}</label>
                        <input
                          type={f.type || "text"}
                          placeholder={f.placeholder || ""}
                          value={(form as any)[f.key]}
                          onChange={(e) => update(f.key, e.target.value)}
                          style={{ ...inputStyle, borderColor: errors[f.key] ? "#EF4444" : "rgba(255,255,255,0.1)" }}
                          onFocus={(e) => (e.target.style.borderColor = "#D4A373")}
                          onBlur={(e) => (e.target.style.borderColor = errors[f.key] ? "#EF4444" : "rgba(255,255,255,0.1)")}
                        />
                        {errors[f.key] && <span className="text-xs mt-1 block" style={{ color: "#EF4444" }}>{errors[f.key]}</span>}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-base font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: "#D4A373", color: "#0A0A0F" }}
                  >
                    {loading && <ChefHat className="w-4 h-4 animate-spin" />}
                    Generate Full Report
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
