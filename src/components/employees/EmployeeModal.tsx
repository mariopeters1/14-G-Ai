'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EmployeeService } from '@/lib/services/employee.service';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (employee: any) => void;
  employee?: any | null; // null means create new
}

export function EmployeeModal({ isOpen, onClose, onSaved, employee }: EmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    location: '',
    status: 'Active',
    payType: 'Hourly',
    primaryRate: 0,
    type: 'W-2'
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        role: employee.role || '',
        department: employee.department || '',
        location: employee.location || '',
        status: employee.status || 'Active',
        payType: employee.payType || 'Hourly',
        primaryRate: employee.primaryRate || 0,
        type: employee.type || 'W-2'
      });
    } else {
      setFormData({
        name: '',
        role: '',
        department: '',
        location: '',
        status: 'Active',
        payType: 'Hourly',
        primaryRate: 0,
        type: 'W-2'
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let savedEmployee;
      if (employee?.id) {
        savedEmployee = await EmployeeService.updateEmployee(employee.id, formData);
      } else {
        savedEmployee = await EmployeeService.createEmployee(formData);
      }
      onSaved(savedEmployee);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-[#111116] border border-[#1F1F28] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#1F1F28] bg-[#0A0A0E]">
          <h2 className="text-xl font-medium text-white">{employee ? 'Edit Employee' : 'Add Employee'}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white hover:bg-[#1A1A22] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10B981] transition-colors"
                placeholder="e.g. Jane Doe"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Role</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10B981] transition-colors"
                  placeholder="e.g. Server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10B981] transition-colors"
                  placeholder="e.g. Front of House"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Location</label>
                  <select
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10B981] transition-colors appearance-none"
                  >
                    <option value="">Select a Restaurant</option>
                    <option value="Terra Bleu">Terra Bleu</option>
                    <option value="Gator & Flamingo">Gator & Flamingo</option>
                    <option value="Kan'n Rum Bar & Grill">Kan&apos;n Rum Bar & Grill</option>
                    <option value="Gastronomic AI Test Kitchen">Gastronomic AI Test Kitchen</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10B981] transition-colors appearance-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Pay Type</label>
                <select
                  value={formData.payType}
                  onChange={e => setFormData({...formData, payType: e.target.value})}
                  className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10B981] transition-colors appearance-none"
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Salary">Salary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.primaryRate || ''}
                  onChange={e => setFormData({...formData, primaryRate: parseFloat(e.target.value)})}
                  className="w-full bg-[#1C1C24] border border-[#2D2D3A] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#10B981] transition-colors"
                  placeholder="e.g. 15.00"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 mt-8 border-t border-[#1F1F28]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-transparent border border-[#2D2D3A] text-neutral-300 hover:text-white hover:bg-[#1C1C24] rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : employee ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
