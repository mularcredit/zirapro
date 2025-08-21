import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, FileText, Download, Calendar, TrendingUp, Plus, Edit, Trash2, Users, Upload, X, ChevronDown, ChevronUp, Printer, Share2, ArrowLeft, ArrowRight, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Kenyan Tax Calculation Functions
const calculatePAYE = (taxableIncome) => {
  let tax = 0;
  
  if (taxableIncome <= 24000) {
    tax = taxableIncome * 0.10;
  } else if (taxableIncome <= 32333) {
    tax = 24000 * 0.10 + (taxableIncome - 24000) * 0.25;
  } else if (taxableIncome <= 500000) {
    tax = 24000 * 0.10 + 8333 * 0.25 + (taxableIncome - 32333) * 0.30;
  } else if (taxableIncome <= 800000) {
    tax = 24000 * 0.10 + 8333 * 0.25 + 467667 * 0.30 + (taxableIncome - 500000) * 0.325;
  } else {
    tax = 24000 * 0.10 + 8333 * 0.25 + 467667 * 0.30 + 300000 * 0.325 + (taxableIncome - 800000) * 0.35;
  }

  // Personal relief
  tax = Math.max(0, tax - 2400);
  
  return tax;
};

const calculateNSSF = (grossSalary) => {
  const LOWER_LIMIT = 8000;
  const UPPER_LIMIT = 72000;
  const RATE = 0.06;

  let tier1 = Math.min(grossSalary, LOWER_LIMIT) * RATE;
  let tier2 = 0;

  if (grossSalary > LOWER_LIMIT) {
    const tier2Salary = Math.min(grossSalary - LOWER_LIMIT, UPPER_LIMIT - LOWER_LIMIT);
    tier2 = tier2Salary * RATE;
  }

  return Math.min(tier1 + tier2, 4320); // Cap at 4,320
};

const calculateNHIF = (grossPay) => {
  if (grossPay <= 5999) return 150;
  if (grossPay <= 7999) return 300;
  if (grossPay <= 11999) return 400;
  if (grossPay <= 14999) return 500;
  if (grossPay <= 19999) return 600;
  if (grossPay <= 24999) return 750;
  if (grossPay <= 29999) return 850;
  if (grossPay <= 34999) return 900;
  if (grossPay <= 39999) return 950;
  if (grossPay <= 44999) return 1000;
  if (grossPay <= 49999) return 1100;
  if (grossPay <= 59999) return 1200;
  if (grossPay <= 69999) return 1300;
  if (grossPay <= 79999) return 1400;
  if (grossPay <= 89999) return 1500;
  if (grossPay <= 99999) return 1600;
  return 1700;
};

const calculateHousingLevy = (grossSalary, hasTaxPIN) => {
  if (!hasTaxPIN) return 0;
  return grossSalary * 0.015; // 1.5%
};

const GlowButton = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  size = 'md', 
  onClick, 
  disabled = false 
}) => {
  const baseClasses = "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-300 border";
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const variantClasses = {
    primary: "bg-green-50 border-green-500 text-green-600 hover:bg-green-100 hover:border-green-600 hover:text-green-700 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] focus:shadow-[0_0_25px_rgba(34,197,94,0.6)]",
    secondary: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400",
    danger: "bg-red-50 border-red-500 text-red-600 hover:bg-red-100 hover:border-red-600 hover:text-red-700 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
  };

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  color,
  isCount = false,
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-gray-900 text-xl font-bold">
          {isCount ? value : `KSh ${value.toLocaleString()}`}
        </p>
      </div>
    </div>
  );
};

const StatutoryCard = ({
  label,
  value,
  icon: Icon,
  color,
  rate
}) => {
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
          {rate}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-gray-600 text-xs font-semibold">{label}</p>
        <p className="text-gray-900 text-lg font-bold">KSh {Math.round(value).toLocaleString()}</p>
      </div>
    </div>
  );
};

const PayslipModal = ({
  record,
  onClose,
  onPrevious,
  onNext
}) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payslip - ${record.employee_name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
              .payslip-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
              .payslip-title { font-size: 18px; margin-bottom: 20px; }
              .employee-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f5f5f5; }
              .total-row { font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
              .signature { margin-top: 50px; display: flex; justify-content: space-between; }
              .signature-line { width: 200px; border-top: 1px solid #333; margin-top: 40px; }
              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
                .payslip-container { border: none; padding: 0; }
              }
            </style>
          </head>
          <body>
            ${document.getElementById('payslip-content')?.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleDownload = () => {
    const htmlContent = document.getElementById('payslip-content')?.innerHTML;
    const blob = new Blob([`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${record.employee_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .payslip-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .payslip-title { font-size: 18px; margin-bottom: 20px; }
            .employee-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
            .total-row { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-line { width: 200px; border-top: 1px solid #333; margin-top: 40px; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${record.employee_id}_${record.pay_period}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      const htmlContent = document.getElementById('payslip-content')?.innerHTML;
      const blob = new Blob([htmlContent || ''], { type: 'text/html' });
      const file = new File([blob], `payslip_${record.employee_id}.html`, { type: 'text/html' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Payslip - ${record.employee_name}`,
          text: `Payslip for ${record.employee_name} (${record.pay_period})`,
          files: [file]
        });
      } else {
        // Fallback for browsers that don't support file sharing
        const text = `Payslip for ${record.employee_name}\n\n` +
          `Employee ID: ${record.employee_id}\n` +
          `Period: ${record.pay_period}\n` +
          `Gross Pay: KSh ${record.gross_pay.toLocaleString()}\n` +
          `Net Pay: KSh ${record.net_pay.toLocaleString()}\n\n` +
          `View full payslip in the payroll system.`;
        
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          alert('Payslip information copied to clipboard');
        } else {
          alert('Sharing not supported in this browser');
        }
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Failed to share payslip');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Payslip</h2>
          <div className="flex gap-2">
            <GlowButton 
              variant="secondary" 
              icon={Download} 
              size="sm" 
              onClick={handleDownload}
            >
              Download
            </GlowButton>
            <GlowButton 
              variant="secondary" 
              icon={Printer} 
              size="sm" 
              onClick={handlePrint}
            >
              Print
            </GlowButton>
            <GlowButton 
              variant="secondary" 
              icon={Share2} 
              size="sm" 
              onClick={handleShare}
            >
              Share
            </GlowButton>
            <GlowButton 
              variant="danger" 
              icon={X} 
              size="sm" 
              onClick={onClose}
            >
              Close
            </GlowButton>
          </div>
        </div>

        <div className="p-6">
          <div id="payslip-content" className="payslip-container">
            <div className="header">
              <div className="company-name">Company Name</div>
              <div className="payslip-title">PAYSLIP</div>
              <div>Pay Period: {new Date(record.pay_period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            </div>

            <div className="employee-info">
              <div>
                <div><strong>Employee Name:</strong> {record.employee_name}</div>
                <div><strong>Employee ID:</strong> {record.employee_id}</div>
                <div><strong>Department:</strong> {record.department}</div>
                <div><strong>Position:</strong> {record.position}</div>
              </div>
              <div>
                <div><strong>Payment Method:</strong> {record.payment_method}</div>
                {record.payment_method === 'Bank Transfer' && (
                  <>
                    <div><strong>Bank:</strong> {record.bank_name}</div>
                    <div><strong>Account No:</strong> {record.account_number}</div>
                  </>
                )}
                {record.payment_method === 'M-Pesa' && (
                  <div><strong>Phone:</strong> {record.account_number}</div>
                )}
              </div>
            </div>

            <div className="section">
              <div className="section-title">Earnings</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount (KSh)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary</td>
                    <td>{record.basic_salary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>House Allowance</td>
                    <td>{record.house_allowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Transport Allowance</td>
                    <td>{record.transport_allowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Medical Allowance</td>
                    <td>{record.medical_allowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Other Allowances</td>
                    <td>{record.other_allowances.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Overtime ({record.overtime_hours} hrs @ {record.overtime_rate}/hr)</td>
                    <td>{(record.overtime_hours * record.overtime_rate).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Commission</td>
                    <td>{record.commission.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Bonus</td>
                    <td>{record.bonus.toLocaleString()}</td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Earnings</strong></td>
                    <td><strong>{record.gross_pay.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="section">
              <div className="section-title">Deductions</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount (KSh)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>PAYE Tax</td>
                    <td>{Math.round(record.paye_tax).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>NHIF</td>
                    <td>{record.nhif_deduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>NSSF</td>
                    <td>{record.nssf_deduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Housing Levy</td>
                    <td>{record.housing_levy.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Loan Deduction</td>
                    <td>{record.loan_deduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Advance Deduction</td>
                    <td>{record.advance_deduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Welfare Deduction</td>
                    <td>{record.welfare_deduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Other Deductions</td>
                    <td>{record.other_deductions.toLocaleString()}</td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Deductions</strong></td>
                    <td><strong>{record.total_deductions.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="section">
              <table>
                <tbody>
                  <tr className="total-row">
                    <td><strong>Net Pay</strong></td>
                    <td><strong>KSh {Math.round(record.net_pay).toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="signature">
              <div>
                <div className="signature-line"></div>
                <div>Employee Signature</div>
              </div>
              <div>
                <div className="signature-line"></div>
                <div>Authorized Signatory</div>
              </div>
            </div>

            <div className="footer">
              <div>This is a computer generated payslip and does not require a signature</div>
              <div>Generated on {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {(onPrevious || onNext) && (
          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-between">
            {onPrevious && (
              <GlowButton icon={ArrowLeft} onClick={onPrevious}>
                Previous
              </GlowButton>
            )}
            {onNext && (
              <GlowButton icon={ArrowRight} onClick={onNext} className="ml-auto">
                Next
              </GlowButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function PayrollDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSendingPayslips, setIsSendingPayslips] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState(['all']);
  const [branches, setBranches] = useState([{ value: 'all', label: 'All Branches' }]);
  const [payrollRecords, setPayrollRecords] = useState([]);

  // Get current month in YYYY-MM format
  const getCurrentPeriod = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Get the actual period to use for calculations
  const actualPeriod = selectedPeriod === 'current' ? getCurrentPeriod() : selectedPeriod;

  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*');
        
        if (error) {
          console.error('Error fetching employees:', error);
          return;
        }
        
        if (data) {
          setEmployees(data);
          
          // Extract unique departments and branches
          const uniqueDepartments = [...new Set(data.map(emp => emp.Department || emp['Job Level']))].filter(Boolean);
          const uniqueBranches = [...new Set(data.map(emp => emp.Office))].filter(Boolean);
          
          setDepartments(['all', ...uniqueDepartments]);
          setBranches([
            { value: 'all', label: 'All Branches' },
            ...uniqueBranches.map(branch => ({ value: branch, label: branch }))
          ]);

          // Calculate payroll for each employee
          const payrollData = data.map(employee => {
            // Map Supabase fields to our expected fields
            const basicSalary = employee['Basic Salary'] || 0;
            const employeeId = employee['Employee Number'] || '';
            const firstName = employee['First Name'] || '';
            const lastName = employee['Last Name'] || '';
            const department = employee.Department || employee['Job Level'] || '';
            const position = employee['Job Title'] || '';
            
            // Statutory fields
            const nhifNumber = employee['NHIF Number'] || employee['SHIF Number'] || '';
            const nssfNumber = employee['NSSF Number'] || '';
            const taxPin = employee['Tax PIN'] || '';
            
            // Calculate allowances (you might want to adjust these based on your data)
            const houseAllowance = basicSalary * 0.15;
            const transportAllowance = basicSalary * 0.1;
            const medicalAllowance = basicSalary * 0.05;
            const otherAllowances = 0;
            const overtimeHours = 0;
            const overtimeRate = 0;
            const commission = 0;
            const bonus = 0;
            
            // Calculate gross pay
            const overtimePay = overtimeHours * overtimeRate;
            const grossPay = basicSalary + houseAllowance + transportAllowance + 
                            medicalAllowance + otherAllowances + overtimePay + 
                            commission + bonus;

            // Calculate statutory deductions based on rules
            let nhifDeduction = 0;
            let nssfDeduction = 0;
            let housingLevy = 0;
            
            // Only apply NHIF if number is available
            if (nhifNumber) {
              nhifDeduction = calculateNHIF(grossPay);
            }
            
            // Only apply NSSF if number is available
            if (nssfNumber) {
              nssfDeduction = calculateNSSF(grossPay);
            }
            
            // Only apply Housing Levy if Tax PIN is available
            if (taxPin) {
              housingLevy = calculateHousingLevy(grossPay, true);
            }
            
            // Calculate taxable income (gross - non-taxable deductions)
            const taxableIncome = grossPay - nssfDeduction - housingLevy;
            
            // Calculate PAYE - only if Tax PIN is available
            let payeTax = 0;
            if (taxPin) {
              payeTax = calculatePAYE(taxableIncome);
            }
            
            // Other deductions (you might want to fetch these from your database)
            const loanDeduction = 0;
            const advanceDeduction = 0;
            const welfareDeduction = 0;
            const otherDeductions = 0;

            // Calculate total deductions
            const totalDeductions = payeTax + 
                                   nhifDeduction + 
                                   nssfDeduction + 
                                   housingLevy + 
                                   loanDeduction + 
                                   advanceDeduction + 
                                   welfareDeduction + 
                                   otherDeductions;

            // Calculate net pay
            const netPay = grossPay - totalDeductions;

            return {
              id: employee.id || '',
              employee_id: employeeId,
              employee_name: `${firstName} ${lastName}`,
              department: department,
              position: position,
              basic_salary: basicSalary,
              house_allowance: houseAllowance,
              transport_allowance: transportAllowance,
              medical_allowance: medicalAllowance,
              other_allowances: otherAllowances,
              overtime_hours: overtimeHours,
              overtime_rate: overtimeRate,
              commission: commission,
              bonus: bonus,
              gross_pay: grossPay,
              paye_tax: payeTax,
              nhif_deduction: nhifDeduction,
              nssf_deduction: nssfDeduction,
              housing_levy: housingLevy,
              loan_deduction: loanDeduction,
              advance_deduction: advanceDeduction,
              welfare_deduction: welfareDeduction,
              other_deductions: otherDeductions,
              total_deductions: totalDeductions,
              net_pay: netPay,
              pay_period: actualPeriod,
              payment_method: 'Bank Transfer',
              bank_name: '',
              account_number: ''
            };
          });

          setPayrollRecords(payrollData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [actualPeriod]);

  const handleViewPayslip = (record, index) => {
    setSelectedRecord(record);
    setCurrentRecordIndex(index);
  };

  const handleNavigatePayslip = (direction) => {
    if (currentRecordIndex === null || !selectedRecord) return;

    const newIndex = direction === 'prev' ? currentRecordIndex - 1 : currentRecordIndex + 1;
    
    if (newIndex >= 0 && newIndex < filteredRecords.length) {
      setSelectedRecord(filteredRecords[newIndex]);
      setCurrentRecordIndex(newIndex);
    }
  };

  const toggleRowExpand = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Filter records based on search and filters
  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
    const matchesPaymentMethod = selectedPaymentMethod === 'all' || record.payment_method === selectedPaymentMethod;
    
    return matchesSearch && matchesDepartment && matchesPaymentMethod;
  });

  // Calculate totals
  const totalGrossPay = filteredRecords.reduce((sum, record) => sum + record.gross_pay, 0);
  const totalDeductions = filteredRecords.reduce((sum, record) => sum + record.total_deductions, 0);
  const totalNetPay = filteredRecords.reduce((sum, record) => sum + record.net_pay, 0);
  const totalPAYE = filteredRecords.reduce((sum, record) => sum + record.paye_tax, 0);
  const totalNHIF = filteredRecords.reduce((sum, record) => sum + record.nhif_deduction, 0);
  const totalNSSF = filteredRecords.reduce((sum, record) => sum + record.nssf_deduction, 0);
  const totalHousingLevy = filteredRecords.reduce((sum, record) => sum + record.housing_levy, 0);

  const paymentMethods = ['all', 'Bank Transfer', 'M-Pesa', 'Airtel Money', 'Cash'];
  const payPeriods = [
    { value: 'current', label: 'Current Month' },
    { value: '2024-12', label: 'December 2024' },
    { value: '2024-11', label: 'November 2024' },
    { value: '2024-10', label: 'October 2024' },
    { value: '2024-09', label: 'September 2024' }
  ];

  const formatPeriodDisplay = (period) => {
    if (period === 'current') {
      const currentDate = new Date();
      return `${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    return new Date(period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleSendPayslips = async (method) => {
    setIsSendingPayslips(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Payslips sent successfully via ${method}`);
    } catch (error) {
      console.error('Error sending payslips:', error);
      alert('Failed to send payslips');
    } finally {
      setIsSendingPayslips(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen max-w-screen-2xl mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Kenyan Payroll Management</h1>
            <p className="text-gray-600 text-sm">Complete payroll processing with PAYE, NHIF, NSSF, Housing Levy calculations</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative group">
              <GlowButton 
                icon={FileText} 
                size="sm" 
                disabled={isSendingPayslips}
              >
                {isSendingPayslips ? 'Sending...' : 'Send Payslips'}
                {!isSendingPayslips && (
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </GlowButton>
              {!isSendingPayslips && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
                  <div className="py-1">
                    <button 
                      onClick={() => handleSendPayslips('whatsapp')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => handleSendPayslips('email')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      Email
                    </button>
                  </div>
                </div>
              )}
            </div>
            <GlowButton 
              icon={Plus} 
              size="sm" 
              onClick={() => setShowQuickActions(true)}
              
            >
              Quick Actions
            </GlowButton>
          </div>
        </div>
      </div>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <button 
                onClick={() => setShowQuickActions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <GlowButton icon={Calculator} size="sm" onClick={() => {
                alert("Bulk Calculate initiated");
                setShowQuickActions(false);
              }}>
                Bulk Calculate
              </GlowButton>
              <GlowButton variant="secondary" icon={FileText} size="sm" onClick={() => {
                alert("P9A Forms generation started");
                setShowQuickActions(false);
              }}>
                Generate P9A Forms
              </GlowButton>
              <GlowButton variant="secondary" icon={Download} size="sm" onClick={() => {
                alert("Preparing KRA Returns");
                setShowQuickActions(false);
              }}>
                KRA Returns
              </GlowButton>
            
              <GlowButton variant="secondary" icon={FileText} size="sm" onClick={() => {
                alert("Batch payslip generation started");
                setShowQuickActions(false);
              }}>
                Payslip Batch
              </GlowButton>
              <GlowButton variant="secondary" icon={TrendingUp} size="sm" onClick={() => {
                alert("Tax certificates being prepared");
                setShowQuickActions(false);
              }}>
                Tax Certificates
              </GlowButton>
              <GlowButton variant="secondary" icon={Calendar} size="sm" onClick={() => {
                alert("Payment scheduling opened");
                setShowQuickActions(false);
              }}>
                Schedule Payments
              </GlowButton>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payroll Controls</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Pay Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
            >
              {payPeriods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Branch Location</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
            >
              {branches.map(branch => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Payment Method</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-100 focus:border-green-500"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method === 'all' ? 'All Methods' : method}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Search Employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="name or employee ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs placeholder-gray-500 focus:ring-2 focus:ring-green-100 focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <GlowButton icon={Calculator} size="sm">Process Pay</GlowButton>
          </div>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Total Gross Pay" 
          value={totalGrossPay} 
          icon={DollarSign} 
          color="emerald"
        />
        <SummaryCard 
          label="Total Deductions" 
          value={totalDeductions} 
          icon={TrendingUp} 
          color="red"
        />
        <SummaryCard 
          label="Total Net Pay" 
          value={totalNetPay} 
          icon={Calculator} 
          color="blue"
        />
        <SummaryCard 
          label="Employee Count" 
          value={filteredRecords.length} 
          icon={Users} 
          color="purple" 
          isCount={true}
        />
      </div>

      {/* Statutory Deductions Summary Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statutory Deductions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatutoryCard label="Total PAYE Tax" value={totalPAYE} icon={FileText} color="red" rate="Progressive rates" />
          <StatutoryCard label="Total NSSF" value={totalNSSF} icon={Calculator} color="blue" rate="6% (Tiered)" />
          <StatutoryCard label="Total NHIF" value={totalNHIF} icon={TrendingUp} color="purple" rate="Tiered" />
          <StatutoryCard label="Housing Levy" value={totalHousingLevy} icon={DollarSign} color="yellow" rate="1.5%" />
        </div>
      </div>

      {/* Detailed Payroll Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payroll Report</h2>
              <p className="text-gray-600 text-sm">{filteredRecords.length} records found</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <GlowButton variant="secondary" icon={FileText} size="sm">Payslips</GlowButton>
              <GlowButton variant="secondary" icon={Download} size="sm">Export</GlowButton>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-gray-700 font-semibold">Employee</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">Gross Pay</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">PAYE</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">NHIF</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">NSSF</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">AHL</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">Net Pay</th>
                <th className="sticky right-0 z-10 bg-gray-50 px-4 py-3 text-center text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => {
                const isExpanded = expandedRows.has(record.id);
                const voluntaryDeductions = record.loan_deduction + record.advance_deduction + record.welfare_deduction;
                
                return (
                  <React.Fragment key={record.id}>
                    <tr 
                      className="border-b border-gray-300 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRowExpand(record.id)}
                    >
                      <td className="sticky left-0 z-10 bg-white px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 mr-2 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{record.employee_name}</p>
                            <p className="text-gray-500 text-xs">{record.department} • {record.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-green-600">
                        KSh {record.gross_pay.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-red-600">
                        KSh {Math.round(record.paye_tax).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-purple-600">
                        KSh {record.nhif_deduction.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-blue-600">
                        KSh {record.nssf_deduction.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right text-yellow-600">
                        KSh {record.housing_levy.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-green-700">
                        KSh {Math.round(record.net_pay).toLocaleString()}
                      </td>
                      <td className="sticky right-0 z-10 bg-white px-4 py-4">
                        <div className="flex justify-center gap-1">
                          <GlowButton variant="secondary" icon={Edit} size="sm">Edit</GlowButton>
                          <GlowButton 
                            variant="secondary" 
                            icon={FileText} 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPayslip(record, index);
                            }}
                          >
                            Payslip
                          </GlowButton>
                        </div>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">Earnings</h4>
                              <div className="flex justify-between">
                                <span>Basic Salary:</span>
                                <span>KSh {record.basic_salary.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>House Allowance:</span>
                                <span>KSh {record.house_allowance.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Transport Allowance:</span>
                                <span>KSh {record.transport_allowance.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Overtime:</span>
                                <span>KSh {(record.overtime_hours * record.overtime_rate).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">Statutory Deductions</h4>
                              <div className="flex justify-between">
                                <span>PAYE:</span>
                                <span className="text-red-600">KSh {record.paye_tax.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>NHIF:</span>
                                <span className="text-red-600">KSh {record.nhif_deduction.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>NSSF:</span>
                                <span className="text-red-600">KSh {record.nssf_deduction.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Housing Levy:</span>
                                <span className="text-red-600">KSh {record.housing_levy.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900">Other Deductions</h4>
                              <div className="flex justify-between">
                                <span>Loans:</span>
                                <span className="text-red-600">KSh {record.loan_deduction.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Advances:</span>
                                <span className="text-red-600">KSh {record.advance_deduction.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Welfare:</span>
                                <span className="text-red-600">KSh {record.welfare_deduction.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Total Deductions:</span>
                                <span className="text-red-600">KSh {record.total_deductions.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedRecord && (
        <PayslipModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onPrevious={currentRecordIndex !== null && currentRecordIndex > 0 ? 
            () => handleNavigatePayslip('prev') : undefined}
          onNext={currentRecordIndex !== null && currentRecordIndex < filteredRecords.length - 1 ? 
            () => handleNavigatePayslip('next') : undefined}
        />
      )}
    </div>
  );
}