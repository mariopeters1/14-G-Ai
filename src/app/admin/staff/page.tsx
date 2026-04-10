"use client";

import { CalendarClock, BrainCircuit, UserPlus, Settings, Sparkles, Trash2, CalendarDays, Loader2, DollarSign, Clock } from "lucide-react";
import { useState } from "react";

export default function StaffPage() {
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
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}><CalendarClock style={{ color: 'hsl(var(--accent))', width: '28px', height: '28px', marginRight: '8px' }} /> Staff & Scheduling</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>AI-optimized rostering and team management.</p>
        </div>

        <div className="inventory-grid">
            {/* Left Side: Forms */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* AI Scheduler Form */}
                <div className="legacy-card">
                    <div className="legacy-card-header" style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(212, 163, 115, 0.1)', color: 'hsl(var(--accent))', padding: '12px', borderRadius: '50%' }}>
                            <BrainCircuit style={{ width: '24px', height: '24px' }} />
                        </div>
                        <div>
                            <h3 className="legacy-card-title">Staff Scheduler</h3>
                            <p className="legacy-card-description">Provide data to generate an optimized weekly schedule.</p>
                        </div>
                    </div>
                    <div className="legacy-card-content">
                        <div className="legacy-input-group">
                            <label>Demand Forecast & Peak Hours</label>
                            <textarea rows={3} defaultValue="High traffic expected Friday and Saturday from 7-9 PM. Lunch rush is 12-2 PM daily." />
                        </div>
                        <div className="legacy-input-group">
                            <label>Special Events or Requests</label>
                            <textarea rows={2} defaultValue="Private party for 30 on Saturday requires 2 extra servers and 1 bartender from 6 PM." />
                        </div>
                        <div className="legacy-input-group">
                            <label>Employee Availability, Roles, & Pay Rates</label>
                            <textarea rows={4} style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.5, opacity: 0.9 }} defaultValue="Alice (Chef, $25.00/hr): Mon-Fri 9am-5pm; Bob (Server, $15.50/hr): available weekends; Charlie (Bartender, $18.00/hr): not available Tuesdays; David (Server, $15.50/hr): any day after 5pm." />
                        </div>
                        <button className="legacy-btn-primary" style={{ justifyContent: 'center', width: '100%', marginTop: '0.5rem' }} onClick={handleSimulate}>
                            <Sparkles style={{ width: '18px', height: '18px' }} /> Get AI-Powered Schedule
                        </button>
                    </div>
                </div>

                {/* Add New Hire Form */}
                <div className="legacy-card">
                    <div className="legacy-card-header">
                        <h3 className="legacy-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserPlus style={{ width: '20px', height: '20px' }} /> Add New Hire</h3>
                        <p className="legacy-card-description">Add an employee to use in the AI Scheduler.</p>
                    </div>
                    <div className="legacy-card-content">
                        <div className="legacy-input-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="e.g., Jane Doe" />
                        </div>
                        <div className="legacy-input-group">
                            <label>Role</label>
                            <select style={{ width: '100%', padding: '0.75rem', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', color: '#fff', borderRadius: '8px', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                                <option>Select a role</option>
                                <option>Server</option>
                                <option>Bartender</option>
                                <option>Chef</option>
                            </select>
                        </div>
                        <div className="legacy-input-group">
                            <label>Hourly Pay Rate ($)</label>
                            <input type="number" placeholder="e.g., 25.50" />
                        </div>
                        <div className="legacy-input-group">
                            <label>Availability / Notes</label>
                            <textarea rows={2} placeholder="e.g., Available evenings and weekends."></textarea>
                        </div>
                        <button className="legacy-btn-outline" style={{ justifyContent: 'center', width: '100%' }}>Add Employee to Roster</button>
                    </div>
                </div>

                {/* Manage Roles Form */}
                <div className="legacy-card">
                    <div className="legacy-card-header">
                        <h3 className="legacy-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings style={{ width: '20px', height: '20px' }} /> Manage Roles</h3>
                        <p className="legacy-card-description">Add or remove roles available for scheduling.</p>
                    </div>
                    <div className="legacy-card-content">
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                            <input type="text" placeholder="New role name..." style={{ flex: 1, padding: '0.75rem', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                            <button className="legacy-btn-outline">Add</button>
                        </div>
                        <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '0.5rem' }}>Existing Roles</label>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {["AI Systems Coordinator", "Assistant Manager", "Audio/Visual Technician", "Baker", "Banquet Chef"].map((role, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid hsl(var(--border))', borderRadius: '6px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{role}</span>
                                    <button className="legacy-btn-action" style={{ color: 'hsl(var(--destructive))' }}><Trash2 style={{ width: '16px', height: '16px' }} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Side: AI Results */}
            <div className="ai-resultsbox" id="staff-ai-box" style={ isSimulating !== "idle" ? { alignItems: isSimulating === "loading" ? 'center' : 'flex-start', textAlign: isSimulating === "loading" ? 'center' : 'left', justifyContent: 'flex-start'} : { alignItems: 'center', minHeight: '50vh'} }>
                {isSimulating === "idle" && (
                    <>
                        <div style={{ background: 'hsl(var(--card))', padding: '1.5rem', borderRadius: '50%', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                            <CalendarDays style={{ width: '48px', height: '48px', color: 'hsl(var(--accent))' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Your Optimized Schedule Will Appear Here</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>Fill in your staffing data and let Gastronomic AI create a balanced and cost-effective weekly schedule.</p>
                    </>
                )}

                {isSimulating === "loading" && (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '5rem' }}>
                        <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: 'hsl(var(--accent))', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem' }}>AI is building your schedule...</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>Optimizing shifts based on your forecasts, staff availability, and special events.</p>
                     </div>
                )}

                {isSimulating === "done" && (
                    <div style={{ width: '100%' }}>
                        <div className="legacy-card" style={{ marginBottom: '1.5rem', width: '100%' }}>
                            <div className="legacy-card-header" style={{ paddingBottom: '1rem' }}>
                                <h3 className="legacy-card-title" style={{ fontSize: '1.4rem' }}>AI-Generated Weekly Schedule</h3>
                                <p className="legacy-card-description">Schedule generated successfully, optimizing for peak hours and reducing overlap.</p>
                            </div>
                            <div className="legacy-card-content" style={{ background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--border))' }}>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Weekly Labor Cost:</span>
                                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'hsl(var(--accent))' }}>$1,452.50</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%' }}>
                            <div className="legacy-card">
                                <div className="legacy-card-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Friday</h3>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}><DollarSign style={{ width: '14px', height: '14px', marginBottom: '-2px', display: 'inline-block' }}/>703.50</div>
                                </div>
                                <div className="legacy-card-content" style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'hsl(var(--secondary))', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <div><p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Alice</p><p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Chef</p></div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}><Clock style={{ width: '12px', height: '12px', marginRight: '4px', opacity: 0.6, display: 'inline-block' }} />9:00 AM - 5:00 PM <strong style={{ fontFamily: 'sans-serif', marginLeft: '4px' }}>(8 hrs)</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'hsl(var(--secondary))', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <div><p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Bob</p><p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Server</p></div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}><Clock style={{ width: '12px', height: '12px', marginRight: '4px', opacity: 0.6, display: 'inline-block' }} />11:00 AM - 7:00 PM <strong style={{ fontFamily: 'sans-serif', marginLeft: '4px' }}>(8 hrs)</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'hsl(var(--secondary))', padding: '0.75rem', borderRadius: '6px', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <div><p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Charlie</p><p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Bartender</p></div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}><Clock style={{ width: '12px', height: '12px', marginRight: '4px', opacity: 0.6, display: 'inline-block' }} />5:00 PM - 12:00 AM <strong style={{ fontFamily: 'sans-serif', marginLeft: '4px' }}>(7 hrs)</strong></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'hsl(var(--secondary))', padding: '0.75rem', borderRadius: '6px', alignItems: 'center' }}>
                                        <div><p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>David</p><p style={{ margin: 0, fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Server</p></div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}><Clock style={{ width: '12px', height: '12px', marginRight: '4px', opacity: 0.6, display: 'inline-block' }} />5:00 PM - 11:00 PM <strong style={{ fontFamily: 'sans-serif', marginLeft: '4px' }}>(6 hrs)</strong></div>
                                    </div>
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
