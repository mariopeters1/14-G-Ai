"use client";

import { BarChart3, DollarSign, TrendingUp, Apple, Receipt, Users, Trophy } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="legacy-dashboard-scope container mx-auto py-10">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
                <h2 className="section-title" style={{ marginBottom: '0.5rem' }}><BarChart3 style={{ color: 'hsl(var(--accent))', width: '28px', height: '28px', marginRight: '8px' }} /> Reports & Analytics</h2>
                <p style={{ color: 'hsl(var(--muted-foreground))', margin: 0 }}>Key performance indicators and data visualizations for your restaurant.</p>
            </div>
            <select style={{ padding: '0.5rem 1rem', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', color: '#fff', borderRadius: '8px', outline: 'none', appearance: 'none', cursor: 'pointer', paddingRight: '2rem', backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center' }}>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Quarter</option>
            </select>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
            <div className="kpi-card kpi-card-success">
                <div className="kpi-header"><h3 className="kpi-title">Total Revenue</h3><DollarSign className="kpi-icon" /></div>
                <p className="kpi-value text-success">$<span className="animate-number">29606.00</span></p>
                <p className="kpi-subtext" style={{ color: 'hsl(var(--success, 142.1 76.2% 36.3%))', opacity: 0.9 }}><TrendingUp style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline-block' }} />+15.2% from last week</p>
            </div>
            <div className="kpi-card kpi-card-danger">
                <div className="kpi-header"><h3 className="kpi-title">Food Cost</h3><Apple className="kpi-icon" /></div>
                <p className="kpi-value text-danger">$<span className="animate-number">8141.65</span></p>
                <p className="kpi-subtext" style={{ color: 'hsl(var(--destructive))', opacity: 0.9 }}><TrendingUp style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline-block' }} />+3.1% from last week (27.5% of rev)</p>
            </div>
            <div className="kpi-card highlight">
                <div className="kpi-header"><h3 className="kpi-title">Total Orders</h3><Receipt className="kpi-icon" /></div>
                <p className="kpi-value" style={{ color: 'hsl(var(--accent))' }}>+<span className="animate-number">852</span></p>
                <p className="kpi-subtext" style={{ color: 'hsl(var(--accent))', opacity: 0.9 }}><TrendingUp style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline-block' }} />+18.5% from last week</p>
            </div>
            <div className="kpi-card highlight">
                <div className="kpi-header"><h3 className="kpi-title">Avg. Guests per Day</h3><Users className="kpi-icon" /></div>
                <p className="kpi-value" style={{ color: 'hsl(var(--accent))' }}><span className="animate-number">122</span></p>
                <p className="kpi-subtext" style={{ color: 'hsl(var(--accent))', opacity: 0.9 }}><TrendingUp style={{ width: '12px', height: '12px', marginRight: '4px', display: 'inline-block' }} />+8% from last week</p>
            </div>
            <div className="kpi-card" style={{ borderColor: 'hsl(var(--accent))', background: 'rgba(212,163,115,0.05)', gridColumn: 'span 2' }}>
                <div className="kpi-header"><h3 className="kpi-title">Top Selling Item</h3><Trophy className="kpi-icon" style={{ color: 'hsl(var(--accent))' }} /></div>
                <p className="kpi-value" style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingTop: '0.5rem', paddingBottom: '0.25rem' }}>Pan-Seared Snapper</p>
                <p className="kpi-subtext" style={{ color: 'hsl(var(--muted-foreground))' }}>120 units sold this week</p>
            </div>
        </div>

        {/* Charts Area: CSS Mockups */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            
            {/* Graph 1: Daily Revenue */}
            <div className="legacy-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="legacy-card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Daily Revenue</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Revenue for the last 7 days.</p>
                </div>
                <div className="legacy-card-content" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: '2rem', position: 'relative' }}>
                    {/* Y-axis guide lines mock */}
                    <div style={{ position: 'absolute', left: '1.5rem', right: '1.5rem', top: '1rem', bottom: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, opacity: 0.1 }}>
                        <div style={{ borderBottom: '1px dashed #fff', position: 'relative' }}><span style={{ position: 'absolute', left: '-2rem', top: '-0.5rem', fontSize: '0.7rem' }}>$10k</span></div>
                        <div style={{ borderBottom: '1px dashed #fff', position: 'relative' }}><span style={{ position: 'absolute', left: '-2rem', top: '-0.5rem', fontSize: '0.7rem' }}>$7.5k</span></div>
                        <div style={{ borderBottom: '1px dashed #fff', position: 'relative' }}><span style={{ position: 'absolute', left: '-2rem', top: '-0.5rem', fontSize: '0.7rem' }}>$5k</span></div>
                        <div style={{ borderBottom: '1px dashed #fff', position: 'relative' }}><span style={{ position: 'absolute', left: '-2rem', top: '-0.5rem', fontSize: '0.7rem' }}>$2.5k</span></div>
                    </div>
                    
                    {/* bars */}
                    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '40px', height: '40%', background: 'hsl(var(--accent))', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Mon</span>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '40px', height: '45%', background: 'hsl(var(--accent))', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Tue</span>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '40px', height: '35%', background: 'hsl(var(--accent))', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Wed</span>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '40px', height: '60%', background: 'hsl(var(--accent))', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Thu</span>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '40px', height: '85%', background: 'hsl(var(--success, 142.1 76.2% 36.3%))', borderRadius: '4px 4px 0 0' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>Fri</span>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '40px', height: '95%', background: 'hsl(var(--success, 142.1 76.2% 36.3%))', borderRadius: '4px 4px 0 0' }}></div>
                        <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>Sat</span>
                    </div>
                    <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width: '40px', height: '65%', background: 'hsl(var(--accent))', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Sun</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Graph 2: Sales by Category */}
                <div className="legacy-card">
                    <div className="legacy-card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Sales by Category</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Click a category to drill down into items.</p>
                    </div>
                    <div className="legacy-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}><span style={{ color: '#fff' }}>Main Courses (45%)</span><span style={{ fontFamily: 'monospace' }}>$13.3k</span></div>
                            <div style={{ width: '100%', height: '8px', background: 'hsl(var(--secondary))', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '45%', height: '100%', background: 'hsl(var(--accent))' }}></div></div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}><span style={{ color: '#fff' }}>Beverages (25%)</span><span style={{ fontFamily: 'monospace' }}>$7.4k</span></div>
                            <div style={{ width: '100%', height: '8px', background: 'hsl(var(--secondary))', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '25%', height: '100%', background: 'hsl(var(--success, 142.1 76.2% 36.3%))' }}></div></div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}><span style={{ color: '#fff' }}>Appetizers (20%)</span><span style={{ fontFamily: 'monospace' }}>$5.9k</span></div>
                            <div style={{ width: '100%', height: '8px', background: 'hsl(var(--secondary))', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '20%', height: '100%', background: '#fbbf24' }}></div></div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}><span style={{ color: '#fff' }}>Desserts (10%)</span><span style={{ fontFamily: 'monospace' }}>$3.0k</span></div>
                            <div style={{ width: '100%', height: '8px', background: 'hsl(var(--secondary))', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: '10%', height: '100%', background: 'rgba(255,255,255,0.5)' }}></div></div>
                        </div>
                    </div>
                </div>

                {/* Graph 3: Revenue vs Labor Cost */}
                <div className="legacy-card">
                    <div className="legacy-card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Rev vs Labor Cost</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))' }}>Comparison over last 7 days.</p>
                    </div>
                    <div className="legacy-card-content" style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'flex-end', paddingTop: '0.5rem' }}>
                        <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <path d="M0,70 L50,60 L100,75 L150,40 L200,10 L250,5 L300,30" fill="none" stroke="hsl(var(--success, 142.1 76.2% 36.3%))" strokeWidth="3" />
                            <path d="M0,80 L50,75 L100,82 L150,60 L200,50 L250,45 L300,55" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" strokeDasharray="4" />
                        </svg>
                        <div style={{ position: 'absolute', bottom: '0.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
