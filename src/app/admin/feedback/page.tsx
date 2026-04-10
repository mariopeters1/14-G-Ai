"use client";

import { MessageSquare, BrainCircuit, Sparkles, MessageSquarePlus, Loader2, AlertTriangle, ThumbsUp, Lightbulb } from "lucide-react";
import { useState } from "react";

export default function FeedbackPage() {
  const [isSimulating, setIsSimulating] = useState("idle");

  const handleSimulate = () => {
    setIsSimulating("loading");
    setTimeout(() => {
        setIsSimulating("done");
    }, 1800);
  };

  return (
    <div className="legacy-dashboard-scope container mx-auto py-10">
        <div style={{ marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}><MessageSquare style={{ color: 'hsl(var(--accent))', width: '28px', height: '28px', marginRight: '8px' }} /> Customer Feedback</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>Analyze reviews to find actionable insights.</p>
        </div>

        <div className="inventory-grid">
            {/* Left Side: Form */}
            <div className="legacy-card" style={{ position: 'sticky', top: '2rem' }}>
                <div className="legacy-card-header" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(212, 163, 115, 0.1)', color: 'hsl(var(--accent))', padding: '12px', borderRadius: '50%' }}>
                        <BrainCircuit style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                        <h3 className="legacy-card-title">AI Feedback Analysis</h3>
                        <p className="legacy-card-description">Let AI analyze reviews to find actionable insights.</p>
                    </div>
                </div>
                <div className="legacy-card-content">
                    <div className="legacy-input-group">
                        <label>Customer Feedback Text</label>
                        <textarea rows={4} defaultValue="The service was incredibly slow, but the steak was the best I've ever had. The music was a bit too loud." />
                    </div>
                    <div className="legacy-input-group">
                        <label>Attach a Photo (optional)</label>
                        <input type="file" style={{ padding: '0.5rem', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} />
                    </div>
                    <button className="legacy-btn-primary" style={{ justifyContent: 'center', width: '100%', marginTop: '0.5rem' }} onClick={handleSimulate}>
                        <Sparkles style={{ width: '18px', height: '18px' }} /> Get AI Analysis
                    </button>
                </div>
            </div>
            
            {/* Right Side: AI Results */}
            <div className="ai-resultsbox" id="feedback-ai-box" style={ isSimulating !== "idle" ? { alignItems: isSimulating === "loading" ? 'center' : 'flex-start', textAlign: isSimulating === "loading" ? 'center' : 'left', justifyContent: 'flex-start'} : { alignItems: 'center', minHeight: '50vh'} }>
                {isSimulating === "idle" && (
                     <>
                        <div style={{ background: 'hsl(var(--card))', padding: '1.5rem', borderRadius: '50%', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                            <MessageSquarePlus style={{ width: '48px', height: '48px', color: 'hsl(var(--accent))' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Feedback Analysis Will Appear Here</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>Paste a customer review into the form and let Gastronomic AI turn complaints and compliments into opportunities.</p>
                     </>
                )}

                {isSimulating === "loading" && (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '5rem' }}>
                        <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: 'hsl(var(--accent))', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem' }}>AI is analyzing the feedback...</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>Extracting sentiment, identifying key issues, and drafting response suggestions.</p>
                     </div>
                )}

                {isSimulating === "done" && (
                    <div style={{ width: '100%' }}>
                        <div className="legacy-card" style={{ marginBottom: '1.5rem', width: '100%' }}>
                            <div className="legacy-card-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 className="legacy-card-title" style={{ fontSize: '1.4rem' }}>Analysis Results</h3>
                                        <p className="legacy-card-description">Automated sentiment and action item breakdown.</p>
                                    </div>
                                    <span className="badge warning" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem', background: 'rgba(245, 158, 11, 0.1)', color: 'hsl(var(--warning, 37.7 92.1% 50.2%))', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '999px' }}>Mixed Sentiment</span>
                                </div>
                            </div>
                            <div className="legacy-card-content">
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'hsl(var(--destructive))', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle style={{ width: '18px', height: '18px' }} /> Identified Complaints</h4>
                                <ul style={{ margin: '0 0 1.5rem 0', paddingLeft: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                                    <li>Service speed marked as "incredibly slow".</li>
                                    <li>Ambiance issue: "music was a bit too loud".</li>
                                </ul>

                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'hsl(var(--success, 142.1 76.2% 36.3%))', display: 'flex', alignItems: 'center', gap: '8px' }}><ThumbsUp style={{ width: '18px', height: '18px' }} /> Identified Compliments</h4>
                                <ul style={{ margin: '0 0 1.5rem 0', paddingLeft: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                                    <li>Food quality highly praised: "steak was the best I've ever had".</li>
                                </ul>

                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'hsl(var(--accent))', display: 'flex', alignItems: 'center', gap: '8px' }}><Lightbulb style={{ width: '18px', height: '18px' }} /> Actionable Recommendations</h4>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid hsl(var(--border))', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'hsl(var(--foreground))', lineHeight: 1.5 }}>
                                    <strong style={{ color: 'hsl(var(--accent))' }}>Immediate:</strong> Reduce master volume setting by 15% during peak hours.<br /><br />
                                    <strong style={{ color: 'hsl(var(--accent))' }}>Management:</strong> Review table turnaround times and kitchen-to-floor flow on the specific date of this review to address "slow service" bottleneck.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
