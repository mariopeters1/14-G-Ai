"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  BrainCircuit,
  ChefHat,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Send,
  BarChart3,
  Smile,
  Frown,
  Meh,
  Quote,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface FeedbackItem {
  id: string;
  guest: string;
  date: string;
  source: string;
  rating: number;
  sentiment: "positive" | "mixed" | "negative";
  text: string;
  complaints: string[];
  compliments: string[];
  recommendations: string[];
  responded: boolean;
  expanded: boolean;
  analyzing: boolean;
}

// ─── Initial Data ───────────────────────────────────────────────

const initialFeedback: FeedbackItem[] = [
  {
    id: "FB-001",
    guest: "Sarah M.",
    date: "2026-03-15",
    source: "Google",
    rating: 4,
    sentiment: "mixed",
    text: "The service was incredibly slow, but the steak was the best I've ever had. The music was a bit too loud.",
    complaints: ['Service speed marked as "incredibly slow"', 'Ambiance: "music was a bit too loud"'],
    compliments: ['Food quality highly praised: "steak was the best I\'ve ever had"'],
    recommendations: ["Reduce volume by 15% during peak hours", "Review table turnaround times on this date"],
    responded: false,
    expanded: false,
    analyzing: false,
  },
  {
    id: "FB-002",
    guest: "James R.",
    date: "2026-03-14",
    source: "Yelp",
    rating: 5,
    sentiment: "positive",
    text: "Absolutely phenomenal experience. The tasting menu was inventive, the wine pairing was perfect, and our server David was knowledgeable and attentive. Will definitely return.",
    complaints: [],
    compliments: ["Tasting menu praised as inventive", "Wine pairing described as perfect", "Server David highlighted for knowledge and attentiveness"],
    recommendations: ["Feature David's service style in staff training", "Consider promoting the tasting menu in marketing"],
    responded: true,
    expanded: false,
    analyzing: false,
  },
  {
    id: "FB-003",
    guest: "Lisa T.",
    date: "2026-03-14",
    source: "OpenTable",
    rating: 2,
    sentiment: "negative",
    text: "Very disappointed. Waited 45 minutes past our reservation time. The risotto was overcooked and cold. Manager never came to check on us despite being flagged twice.",
    complaints: ["45-minute wait past reservation", "Risotto overcooked and served cold", "Manager unresponsive after two escalations"],
    compliments: [],
    recommendations: ["Review reservation overbooking policy", "Implement kitchen quality checks before plating", "Require manager table touch on all flagged issues"],
    responded: false,
    expanded: false,
    analyzing: false,
  },
  {
    id: "FB-004",
    guest: "Carlos D.",
    date: "2026-03-13",
    source: "Google",
    rating: 5,
    sentiment: "positive",
    text: "Best birthday dinner I've ever had. The team went above and beyond with the surprise dessert plating. The duck confit was perfectly executed. Thank you Chef!",
    complaints: [],
    compliments: ["Birthday celebration exceeded expectations", "Surprise dessert plating praised", "Duck confit described as perfectly executed"],
    recommendations: ["Document the birthday workflow as a hospitality standard", "Share the duck confit recipe consistency with the line team"],
    responded: true,
    expanded: false,
    analyzing: false,
  },
  {
    id: "FB-005",
    guest: "Emma W.",
    date: "2026-03-12",
    source: "Yelp",
    rating: 3,
    sentiment: "mixed",
    text: "Food was good but nothing special for the price point. $65 for a chicken dish felt steep. The cocktails however were excellent — the smoked old fashioned was the highlight of the evening.",
    complaints: ["Perceived poor value: $65 chicken dish", "Food described as unexceptional for price"],
    compliments: ["Cocktails praised as excellent", "Smoked Old Fashioned highlighted as evening standout"],
    recommendations: ["Review chicken entrée cost vs perceived value", "Feature smoked Old Fashioned in bar marketing", "Consider adjusting portion or presentation on high-ticket poultry"],
    responded: false,
    expanded: false,
    analyzing: false,
  },
  {
    id: "FB-006",
    guest: "Michael K.",
    date: "2026-03-11",
    source: "Direct",
    rating: 1,
    sentiment: "negative",
    text: "Found a hair in my soup. When I told the waiter, he just apologized and didn't offer to replace it or comp anything. Unacceptable.",
    complaints: ["Foreign object (hair) found in soup", "Server failed to offer replacement or compensation", "No recovery protocol executed"],
    compliments: [],
    recommendations: ["Reinforce kitchen hygiene protocols (hair nets, chef caps)", "Train all FOH on guest recovery: immediate replace + manager visit + comp", "Follow up with guest directly for recovery"],
    responded: false,
    expanded: false,
    analyzing: false,
  },
];

// ─── Component ──────────────────────────────────────────────────

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>(initialFeedback);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSentiment, setFilterSentiment] = useState<"all" | "positive" | "mixed" | "negative">("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [customText, setCustomText] = useState("");
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState(false);
  const [sortField, setSortField] = useState<"date" | "rating">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success");

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

  // ─── Computed ─────────────────────────────────────────────

  const filtered = feedback
    .filter((f) => {
      if (searchQuery && !f.text.toLowerCase().includes(searchQuery.toLowerCase()) && !f.guest.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterSentiment !== "all" && f.sentiment !== filterSentiment) return false;
      if (filterSource !== "all" && f.source !== filterSource) return false;
      return true;
    })
    .sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "date") return mul * a.date.localeCompare(b.date);
      return mul * (a.rating - b.rating);
    });

  const totalReviews = feedback.length;
  const avgRating = feedback.reduce((s, f) => s + f.rating, 0) / totalReviews;
  const positiveCount = feedback.filter((f) => f.sentiment === "positive").length;
  const negativeCount = feedback.filter((f) => f.sentiment === "negative").length;
  const respondedCount = feedback.filter((f) => f.responded).length;
  const sources = [...new Set(feedback.map((f) => f.source))];

  // ─── Actions ──────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, expanded: !f.expanded } : f)));
  };

  const markResponded = (id: string) => {
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, responded: true } : f)));
    showToast("Marked as responded.");
  };

  const handleAnalyzeCustom = () => {
    if (!customText.trim()) {
      showToast("Please enter feedback text.", "warning");
      return;
    }
    setIsAnalyzingCustom(true);
    setTimeout(() => {
      const newItem: FeedbackItem = {
        id: `FB-${Date.now()}`,
        guest: "Manual Entry",
        date: new Date().toISOString().split("T")[0],
        source: "Direct",
        rating: 3,
        sentiment: customText.toLowerCase().includes("great") || customText.toLowerCase().includes("best") || customText.toLowerCase().includes("excellent") ? "positive" : customText.toLowerCase().includes("bad") || customText.toLowerCase().includes("slow") || customText.toLowerCase().includes("disappoint") ? "negative" : "mixed",
        text: customText,
        complaints: ["AI analysis completed — reviewing sentiment patterns"],
        compliments: ["Feedback received and categorized"],
        recommendations: ["Review this entry and assign follow-up to appropriate department"],
        responded: false,
        expanded: true,
        analyzing: false,
      };
      setFeedback((prev) => [newItem, ...prev]);
      setCustomText("");
      setIsAnalyzingCustom(false);
      showToast("Feedback analyzed and added.", "success");
    }, 1800);
  };

  const handleExport = () => {
    const lines = [
      "ID,Guest,Date,Source,Rating,Sentiment,Responded,Text",
      ...feedback.map((f) => `"${f.id}","${f.guest}","${f.date}","${f.source}",${f.rating},"${f.sentiment}",${f.responded},"${f.text}"`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Report exported.", "info");
  };

  // ─── Helpers ──────────────────────────────────────────────

  const getSentimentIcon = (s: string) => {
    switch (s) {
      case "positive": return <Smile className="w-4 h-4 text-[#10B981]" />;
      case "negative": return <Frown className="w-4 h-4 text-[#EF4444]" />;
      default: return <Meh className="w-4 h-4 text-[#F59E0B]" />;
    }
  };

  const getSentimentStyle = (s: string) => {
    switch (s) {
      case "positive": return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20";
      case "negative": return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20";
      default: return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
    }
  };

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
          toastType === "success" ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
            : toastType === "warning" ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
            : "bg-white/10 text-white border-white/20"
        }`}>
          <div className="flex items-center gap-2">
            {toastType === "success" && <CheckCircle2 className="w-4 h-4" />}
            {toastType === "warning" && <AlertCircle className="w-4 h-4" />}
            {toastType === "info" && <Sparkles className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Customer Feedback</h1>
          <p className="text-neutral-400 mt-2">AI-powered sentiment analysis and actionable recommendations from guest reviews.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Reviews", value: totalReviews.toString(), icon: <MessageSquare className="w-5 h-5" />, color: "text-white", bg: "bg-white/5" },
          { label: "Avg Rating", value: avgRating.toFixed(1), icon: <Star className="w-5 h-5" />, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
          { label: "Positive", value: positiveCount.toString(), icon: <ThumbsUp className="w-5 h-5" />, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          { label: "Negative", value: negativeCount.toString(), icon: <ThumbsDown className="w-5 h-5" />, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          { label: "Responded", value: `${respondedCount}/${totalReviews}`, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-5">
            <div className={`${kpi.bg} ${kpi.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              {kpi.icon}
            </div>
            <div className="text-2xl font-light text-white font-mono">{kpi.value}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ─── Left: Analyze Panel ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24 self-start">
          {/* Custom Analysis */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-neutral-400" /> Smart Analysis
              </h2>
              <p className="text-xs text-neutral-500 mt-1">Paste any review for instant AI sentiment breakdown.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Customer Feedback Text</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste a customer review here..."
                  rows={4}
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-colors resize-none placeholder-neutral-500"
                />
              </div>
              <button
                onClick={handleAnalyzeCustom}
                disabled={isAnalyzingCustom}
                className="w-full py-3 bg-white text-black hover:bg-neutral-200 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isAnalyzingCustom ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analyze Feedback</>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1F1F28] bg-[#0D0D12]">
              <h2 className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reviews..."
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 placeholder-neutral-500"
                />
              </div>

              {/* Sentiment Filter */}
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Sentiment</label>
                <div className="flex gap-2 flex-wrap">
                  {(["all", "positive", "mixed", "negative"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterSentiment(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                        filterSentiment === s
                          ? s === "positive" ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                            : s === "negative" ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30"
                            : s === "mixed" ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
                            : "bg-white/10 text-white border-white/20"
                          : "bg-[#1F1F28] text-neutral-500 border-[#2D2D3A] hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Source</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterSource("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      filterSource === "all" ? "bg-white/10 text-white border-white/20" : "bg-[#1F1F28] text-neutral-500 border-[#2D2D3A] hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  {sources.map((src) => (
                    <button
                      key={src}
                      onClick={() => setFilterSource(src)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filterSource === src ? "bg-white/10 text-white border-white/20" : "bg-[#1F1F28] text-neutral-500 border-[#2D2D3A] hover:text-white"
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setSortField("date"); setSortDir((d) => (sortField === "date" ? (d === "asc" ? "desc" : "asc") : "desc")); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${
                    sortField === "date" ? "bg-white/10 text-white border-white/20" : "bg-[#1F1F28] text-neutral-500 border-[#2D2D3A]"
                  }`}
                >
                  <Clock className="w-3 h-3" /> Date {sortField === "date" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </button>
                <button
                  onClick={() => { setSortField("rating"); setSortDir((d) => (sortField === "rating" ? (d === "asc" ? "desc" : "asc") : "desc")); }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${
                    sortField === "rating" ? "bg-white/10 text-white border-white/20" : "bg-[#1F1F28] text-neutral-500 border-[#2D2D3A]"
                  }`}
                >
                  <Star className="w-3 h-3" /> Rating {sortField === "rating" && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: Feedback Cards ─────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs text-neutral-500 mb-2">{filtered.length} reviews found</div>

          {filtered.length === 0 && (
            <div className="bg-[#111116] border border-dashed border-[#2D2D3A] rounded-2xl p-12 text-center">
              <MessageSquare className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No reviews match your filters.</p>
            </div>
          )}

          {filtered.map((item) => (
            <div key={item.id} className={`bg-[#111116] border rounded-2xl overflow-hidden transition-all ${
              item.sentiment === "negative" ? "border-[#EF4444]/15" : item.sentiment === "positive" ? "border-[#10B981]/15" : "border-[#1F1F28]"
            }`}>
              {/* Card Header */}
              <div className="px-6 py-4 flex justify-between items-start cursor-pointer" onClick={() => toggleExpand(item.id)}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-1">{getSentimentIcon(item.sentiment)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-medium text-sm">{item.guest}</span>
                      <span className="text-[10px] text-neutral-600">•</span>
                      <span className="text-xs text-neutral-500">{item.date}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-[#1F1F28] text-neutral-400 border-[#2D2D3A]">{item.source}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${getSentimentStyle(item.sentiment)}`}>
                        {item.sentiment}
                      </span>
                      {item.responded && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">Responded</span>
                      )}
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= item.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-neutral-700"}`} />
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-sm text-neutral-300 leading-relaxed line-clamp-2">
                      <Quote className="w-3 h-3 text-neutral-600 inline-block mr-1 -mt-0.5" />
                      {item.text}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-500 flex-shrink-0 mt-2 transition-transform ${item.expanded ? "rotate-180" : ""}`} />
              </div>

              {/* Expanded Analysis */}
              {item.expanded && (
                <div className="px-6 py-5 border-t border-[#1F1F28] bg-[#0D0D12] space-y-5">
                  {/* Complaints */}
                  {item.complaints.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                        <span className="text-xs font-medium text-[#EF4444] uppercase tracking-wider">Complaints</span>
                      </div>
                      <ul className="space-y-1.5">
                        {item.complaints.map((c, i) => (
                          <li key={i} className="text-sm text-neutral-400 pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-[#EF4444]">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Compliments */}
                  {item.compliments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp className="w-4 h-4 text-[#10B981]" />
                        <span className="text-xs font-medium text-[#10B981] uppercase tracking-wider">Compliments</span>
                      </div>
                      <ul className="space-y-1.5">
                        {item.compliments.map((c, i) => (
                          <li key={i} className="text-sm text-neutral-400 pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-[#10B981]">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {item.recommendations.length > 0 && (
                    <div className="p-4 bg-[#111116] border border-[#1F1F28] rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-xs font-medium text-[#F59E0B] uppercase tracking-wider">AI Recommendations</span>
                      </div>
                      <ul className="space-y-1.5">
                        {item.recommendations.map((r, i) => (
                          <li key={i} className="text-sm text-neutral-300 pl-6 relative before:content-['→'] before:absolute before:left-1 before:text-[#F59E0B]">
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {!item.responded && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markResponded(item.id); }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-xs border border-[#2D2D3A] flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Responded
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); showToast("Follow-up email drafted.", "info"); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors text-xs border border-[#2D2D3A] flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Draft Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
