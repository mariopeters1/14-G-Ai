'use client';

import { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from "lucide-react";
import { EmployeeModal } from './EmployeeModal';
import { EmployeeService } from '@/lib/services/employee.service';

interface EmployeeDirectoryProps {
  initialEmployees: any[];
}

export function EmployeeDirectory({ initialEmployees }: EmployeeDirectoryProps) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const handleEditClick = (emp: any) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleSaved = (savedEmp: any) => {
    setEmployees(prev => {
      // If it exists, map to replace it. Otherwise, add to top.
      const index = prev.findIndex(e => e.id === savedEmp.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = savedEmp;
        return next;
      }
      return [savedEmp, ...prev];
    });
  };

  // Safe delete handler with optimistic UI
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      // Optimistically remove from UI
      const previous = [...employees];
      setEmployees(prev => prev.filter(e => e.id !== id));
      try {
        await EmployeeService.deleteEmployee(id);
      } catch (err) {
        // Revert on failure
        setEmployees(previous);
        alert("Failed to delete employee.");
      }
    }
  };

  // Filtering
  const filteredEmployees = employees.filter(emp => 
    (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Employee Command</h1>
          <p className="text-neutral-400 mt-2">Manage roster, roles, and compensation.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleAddClick}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[#1F1F28] flex justify-between items-center bg-[#0D0D12]">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-[#1C1C24] hover:bg-[#2A2A36] text-neutral-300 rounded-lg transition-colors text-sm font-medium border border-[#2D2D3A] flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0A0E] border-b border-[#1F1F28]">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Role & Dept</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Pay Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F28]">
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No employees found matching your criteria.
                  </td>
                </tr>
              )}
              {filteredEmployees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-[#1A1A22] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-300 border border-[#2D2D3A]">
                        {emp.name ? emp.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '?'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{emp.name}</div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-300">{emp.role}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{emp.department}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {emp.location}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-300">{emp.payType === 'Salary' ? `$${(emp.primaryRate || 0).toLocaleString()}/yr` : `$${(emp.primaryRate || 0).toFixed(2)}/hr`}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{emp.type || 'W-2'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      emp.status === 'Active' 
                        ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {emp.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(emp)}
                        className="p-2 text-neutral-400 hover:text-white hover:bg-[#2D2D3A] rounded transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        employee={selectedEmployee}
      />
    </>
  );
}
