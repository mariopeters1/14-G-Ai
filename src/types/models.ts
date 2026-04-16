// User & Identity
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'manager' | 'employee';
  locationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Organization Structure
export interface Location {
  id: string;
  name: string;
  address: string;
  managerId: string;
}

export interface Department {
  id: string;
  locationId: string;
  name: string; // e.g., 'Front of House', 'Back of House', 'Banquet'
}

// Compensation & Roster
export interface PayRate {
  id: string;
  employeeId: string;
  roleName: string; // e.g., 'Line Cook', 'Server'
  departmentId: string;
  rate: number; // Decimal representing dollar amount
  isPrimary: boolean;
  type: 'hourly' | 'salary';
  isTipEligible: boolean;
}

export interface Employee {
  id: string;
  userId?: string; // Optional link to auth user if they have portal access
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: 'active' | 'terminated' | 'on_leave';
  hireDate: string; // ISO Date String
  primaryLocationId: string;
  // Relationships joined at runtime
  payRates?: PayRate[];
  createdAt: Date;
  updatedAt: Date;
}

// Time & Attendance
export interface TimeEntry {
  id: string;
  employeeId: string;
  locationId: string;
  payRateId: string; // Must map to exactly one role/rate for this punch
  clockIn: Date;
  clockOut: Date | null;
  isEdited: boolean;
  editedByUserId: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  flaggedReason?: string; // e.g., 'Missed Punch', 'Early Clock In'
}

export interface Break {
  id: string;
  timeEntryId: string;
  startTime: Date;
  endTime: Date | null;
  isPaid: boolean;
}

// Analytics (Projected Payload)
export interface DashboardKPIs {
  payrollReadinessScore: number;
  overtimeRiskTotal: number;
  laborCostVsSalesTrend: string; // e.g., "+2.4%"
  projectedEmployerBurden: number;
}
