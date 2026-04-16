import { EmployeeService } from "@/lib/services/employee.service";
import { EmployeeDirectory } from "@/components/employees/EmployeeDirectory";

export default async function EmployeesPage() {
  const employees = await EmployeeService.getEmployees();

  return (
    <div className="p-8 pb-20 font-sans max-w-7xl mx-auto">
      <EmployeeDirectory initialEmployees={employees} />
    </div>
  );
}
