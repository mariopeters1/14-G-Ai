import { DashboardService } from "@/lib/services/dashboard.service";
import { AlertCircle, CheckCircle2, Clock, TrendingUp, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const dashboardStats = await DashboardService.getKPIs();
  const overtimeAlerts = await DashboardService.getOvertimeAlerts();
  const pendingApprovals = await DashboardService.getPendingApprovals();

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-neutral-400 mt-2">Current Pay Period: <span className="text-white">Mar 15 - Mar 31, 2026</span></p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2.5 bg-[#1F1F28] hover:bg-[#2A2A36] text-white rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A]">
            Download Report
          </button>
          <button className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium">
            Run Draft Payroll
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Payroll Readiness</h3>
            <CheckCircle2 className="text-[#10B981] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">{dashboardStats.payrollReadiness}%</div>
            <p className="text-xs text-[#10B981]">Ready for submission</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Overtime Risk</h3>
            <AlertCircle className="text-[#F59E0B] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">${dashboardStats.overtimeRisk.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <p className="text-xs text-[#F59E0B]">Action recommended</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Labor vs Sales</h3>
            <TrendingUp className="text-[#EF4444] w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">{dashboardStats.laborCostTrend}</div>
            <p className="text-xs text-[#EF4444]">Above ideal target</p>
          </div>
        </div>

        <div className="bg-[#111116] border border-[#1F1F28] p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Projected Est.</h3>
            <DollarSign className="text-neutral-300 w-5 h-5" />
          </div>
          <div>
            <div className="text-4xl font-light text-white mb-1">${dashboardStats.projectedPayroll.toLocaleString()}</div>
            <p className="text-xs text-neutral-400">Total Employer Burden</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overtime Alerts */}
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-400" /> Overtime Alerts
            </h2>
            <span className="text-xs text-[#F59E0B] font-medium bg-[#F59E0B]/10 px-2.5 py-1 rounded-full">{overtimeAlerts.length} Issues</span>
          </div>
          <div className="space-y-4">
            {overtimeAlerts.map((alert: any) => (
              <div key={alert.id} className="p-4 bg-[#1C1C24] rounded-xl flex justify-between items-center border border-[#2D2D3A]">
                <div>
                  <p className="text-white font-medium">{alert.employee}</p>
                  <p className="text-sm text-neutral-400 mt-0.5">{alert.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#F59E0B] font-semibold text-sm">{alert.hours}</p>
                  <button className="text-xs text-white underline underline-offset-4 opacity-70 hover:opacity-100 mt-2 transition-opacity">Review Schedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neutral-400" /> Pending Approvals
            </h2>
            <button className="text-sm text-neutral-400 hover:text-white transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {pendingApprovals.map((approval: any) => (
              <div key={approval.id} className="p-4 bg-[#1C1C24] rounded-xl flex justify-between items-center border border-[#2D2D3A]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 bg-black/50 px-2 py-0.5 rounded">{approval.type}</span>
                    <p className="text-white font-medium text-sm">{approval.user}</p>
                  </div>
                  <p className="text-sm text-neutral-400">{approval.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-[#EF4444]/20 text-[#EF4444] transition-colors flex items-center justify-center font-medium">✕</button>
                  <button className="w-8 h-8 rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors flex items-center justify-center font-medium">✓</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
