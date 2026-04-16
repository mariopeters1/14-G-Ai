export const employees = [
  {
    id: "EMP-001",
    name: "Eleanor Vance",
    role: "Executive Chef",
    department: "Back of House",
    location: "Terra Bleu",
    payType: "Salary",
    status: "Active",
    primaryRate: 95000,
    hireDate: "2023-01-15",
  },
  {
    id: "EMP-002",
    name: "Marcus Thorne",
    role: "Sous Chef",
    department: "Back of House",
    location: "Gator & Flamingo",
    payType: "Hourly",
    status: "Active",
    primaryRate: 28.50,
    hireDate: "2023-03-22",
  },
  {
    id: "EMP-003",
    name: "Sophia Lin",
    role: "Sommelier",
    department: "Front of House",
    location: "Kan'n Rum Bar & Grill",
    payType: "Hourly",
    status: "Active",
    primaryRate: 15.00, // Plus tips
    hireDate: "2024-06-10",
  },
  {
    id: "EMP-004",
    name: "Julian Alvarez",
    role: "Line Cook",
    department: "Back of House",
    location: "Terra Bleu",
    payType: "Hourly",
    status: "Active",
    primaryRate: 22.00,
    hireDate: "2025-01-05",
  },
  {
    id: "EMP-005",
    name: "Mia Rodriguez",
    role: "Server",
    department: "Front of House",
    location: "Terra Bleu",
    payType: "Hourly",
    status: "Active",
    primaryRate: 10.00, // Plus tips
    hireDate: "2024-11-15",
  },
];

export const dashboardStats = {
  payrollReadiness: 85,
  overtimeRisk: 1240.50,
  laborCostTrend: "+2.4%",
  projectedPayroll: 45200,
};

export const overtimeAlerts = [
  { id: 1, employee: "Julian Alvarez", hours: "38.5 (Approaching 40)", reason: "Late close - Friday" },
  { id: 2, employee: "Marcus Thorne", hours: "42.0 (In Overtime)", reason: "Covered sick shift" },
];

export const pendingApprovals = [
  { id: 1, type: "Time Edit", user: "Mia Rodriguez", description: "Forgot to clock out 3/14" },
  { id: 2, type: "Shift Premium", user: "Eleanor Vance", description: "Banquet bonus payout" },
];

export const timeEntries = [
  {
    id: "TE-101",
    employeeName: "Marcus Thorne",
    role: "Sous Chef",
    date: "2026-03-15",
    clockIn: "08:00 AM",
    clockOut: "04:30 PM",
    totalHours: 8.5,
    status: "approved",
    issues: [],
  },
  {
    id: "TE-102",
    employeeName: "Julian Alvarez",
    role: "Line Cook",
    date: "2026-03-15",
    clockIn: "09:15 AM",
    clockOut: "09:45 PM",
    totalHours: 12.0, // Deduct 0.5 break
    status: "flagged",
    issues: ["Meal penalty", "Approaching OT"],
  },
  {
    id: "TE-103",
    employeeName: "Mia Rodriguez",
    role: "Server",
    date: "2026-03-15",
    clockIn: "04:00 PM",
    clockOut: "--:--",
    totalHours: 0,
    status: "pending",
    issues: ["Missed Punch Out"],
  },
  {
    id: "TE-104",
    employeeName: "Sophia Lin",
    role: "Sommelier",
    date: "2026-03-15",
    clockIn: "03:30 PM",
    clockOut: "11:30 PM",
    totalHours: 8.0,
    status: "approved",
    issues: [],
  }
];

export const tipPools = [
  {
    id: "TP-001",
    date: "2026-03-15",
    poolName: "AM Bar Tip Pool",
    totalAmount: 450.00,
    totalHours: 24,
    status: "calculated",
    allocations: [
      { employeeName: "Sophia Lin", role: "Sommelier", hours: 8, points: 1.0, amount: 150.00 },
      { employeeName: "Oliver Chen", role: "Bartender", hours: 8, points: 1.0, amount: 150.00 },
      { employeeName: "Emma Davis", role: "Barback", hours: 8, points: 1.0, amount: 150.00 }
    ]
  },
  {
    id: "TP-002",
    date: "2026-03-15",
    poolName: "PM Dining Room Pool",
    totalAmount: 2150.75,
    totalHours: 55,
    status: "pending_review",
    allocations: [
      { employeeName: "Mia Rodriguez", role: "Server", hours: 8, points: 2.0, amount: 469.25 },
      { employeeName: "Liam Johnson", role: "Server", hours: 8, points: 2.0, amount: 469.25 },
      { employeeName: "Noah Williams", role: "Food Runner", hours: 8, points: 1.0, amount: 234.62 },
      { employeeName: "Ava Brown", role: "Busser", hours: 8, points: 1.0, amount: 234.62 },
      { employeeName: "James Garcia", role: "Host", hours: 6, points: 0.5, amount: 88.00 }
    ]
  }
];

export const scheduleVariances = [
  {
    employeeId: "EMP-004",
    employeeName: "Julian Alvarez",
    department: "Back of House",
    role: "Line Cook",
    scheduledHours: 40.0,
    actualHours: 48.5,
    variance: 8.5,
    impact: "+$187.00",
    status: "over",
  },
  {
    employeeId: "EMP-005",
    employeeName: "Mia Rodriguez",
    department: "Front of House",
    role: "Server",
    scheduledHours: 35.0,
    actualHours: 32.0,
    variance: -3.0,
    impact: "-$30.00",
    status: "under",
  },
  {
    employeeId: "EMP-002",
    employeeName: "Marcus Thorne",
    department: "Back of House",
    role: "Sous Chef",
    scheduledHours: 45.0,
    actualHours: 45.5,
    variance: 0.5,
    impact: "+$14.25",
    status: "expected",
  }
];

export const payrollRuns = [
  {
    id: "PR-2026-03-A",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-15",
    type: "Regular",
    status: "Draft",
    metrics: {
      totalGross: 45240.50,
      totalTaxes: 8143.29,
      totalNet: 37097.21,
      totalEmployees: 24,
    },
    employees: [
      {
        id: "EMP-004",
        name: "Julian Alvarez",
        role: "Line Cook",
        basePay: 880.00, // 40h * $22
        overtimePay: 280.50, // 8.5h * $33
        tips: 0,
        grossPay: 1160.50,
        status: "Review Required"
      },
      {
        id: "EMP-005",
        name: "Mia Rodriguez",
        role: "Server",
        basePay: 320.00, // 32 * $10
        overtimePay: 0,
        tips: 1240.25,
        grossPay: 1560.25,
        status: "Ready"
      }
    ]
  },
  {
    id: "PR-2026-02-B",
    periodStart: "2026-02-16",
    periodEnd: "2026-02-28",
    type: "Regular",
    status: "Approved",
    metrics: {
      totalGross: 42100.00,
      totalTaxes: 7578.00,
      totalNet: 34522.00,
      totalEmployees: 23,
    },
    employees: [] // empty for older runs in this mock
  }
];

// --- Phase 3 Mock Data ---

export const intelligenceTrends = {
  laborCostVsSales: [
    { date: "Mon 4/05", sales: 8500, laborCost: 2800 },
    { date: "Tue 4/06", sales: 7200, laborCost: 2600 },
    { date: "Wed 4/07", sales: 9100, laborCost: 3100 },
    { date: "Thu 4/08", sales: 11500, laborCost: 3800 },
    { date: "Fri 4/09", sales: 18200, laborCost: 5200 },
    { date: "Sat 4/10", sales: 21000, laborCost: 5800 },
    { date: "Sun 4/11", sales: 15400, laborCost: 4600 }
  ],
  kpis: {
    laborPercentage: 30.5,
    projectedOvertime: 45.5, // hours
    topLeakDepartment: "Kitchen", // department name
    topLeakAmount: 850 // dollars
  }
};

export const complianceDocuments = [
  { id: "DOC-001", employeeName: "Julian Alvarez", type: "I-9 Form", status: "Missing", dueDate: "2026-04-15" },
  { id: "DOC-002", employeeName: "Mia Rodriguez", type: "Food Handler Cert", status: "Expiring Soon", dueDate: "2026-05-01" },
  { id: "DOC-003", employeeName: "Liam Johnson", type: "W-4 Form", status: "Completed", dueDate: "2026-01-10" },
  { id: "DOC-004", employeeName: "Sarah Chen", type: "Anti-Harassment Training", status: "Missing", dueDate: "2026-04-20" }
];

export const systemSettings = {
  companyName: "Gastronomic LLC",
  locations: ["Terra Bleu", "Gator & Flamingo", "Kan'n Rum Bar & Grill", "Gastronomic AI Test Kitchen"],
  integrations: [
    { name: "Toast POS", status: "Connected", lastSync: "10 mins ago" },
    { name: "QuickBooks", status: "Connected", lastSync: "2 hours ago" },
    { name: "Gastronomic AI Core", status: "Pending SSO Setup", lastSync: "N/A" }
  ],
  payPeriods: "Bi-Weekly",
  overtimeRule: "Over 40 hours/week"
};
