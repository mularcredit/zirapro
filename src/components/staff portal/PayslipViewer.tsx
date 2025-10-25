import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  FileText, 
  Download, 
  Printer, 
  ArrowLeft, 
  ArrowRight, 
  X,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

// PayslipModal Component for Staff Portal
const PayslipModal = ({
  record,
  onClose,
  onPrevious,
  onNext,
  companyInfo
}) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payslip - ${record["Employee Name"]}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                line-height: 1.6; 
                color: #1f2937; 
                background: white;
                padding: 20px;
              }
              .payslip-container { 
                max-width: 900px; 
                margin: 0 auto; 
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                overflow: hidden;
                position: relative;
              }
              .header-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 120px;
                position: relative;
              }
              .header-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.1);
              }
              .header-content {
                position: relative;
                z-index: 2;
                padding: 30px 40px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: white;
              }
              .company-info {
                display: flex;
                align-items: center;
                gap: 20px;
              }
              .company-logo { 
                width: 60px; 
                height: 60px; 
                border-radius: 12px; 
                background: rgba(255, 255, 255, 0.2);
                padding: 8px;
                backdrop-filter: blur(10px);
              }
              .company-details h1 { 
                font-size: 28px; 
                font-weight: 800; 
                margin-bottom: 4px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .company-tagline { 
                font-size: 14px; 
                opacity: 0.9;
                font-weight: 500;
              }
              .payslip-title {
                text-align: right;
              }
              .payslip-title h2 { 
                font-size: 24px; 
                font-weight: 700; 
                margin-bottom: 8px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .pay-period { 
                font-size: 14px; 
                opacity: 0.9;
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
              }
              .content {
                padding: 40px;
              }
              .employee-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 2px solid #f3f4f6;
              }
              .info-card {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                padding: 25px;
                border-radius: 16px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
              }
              .info-card h3 {
                font-size: 14px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #6366f1;
                margin-bottom: 15px;
              }
              .info-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
              }
              .info-label {
                color: #6b7280;
                font-weight: 500;
              }
              .info-value {
                font-weight: 600;
                color: #1f2937;
              }
              .section {
                margin-bottom: 35px;
              }
              .section-header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 12px;
                margin-bottom: 20px;
                font-weight: 700;
                font-size: 16px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .earnings-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
              }
              .earning-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: #f8fafc;
                border-radius: 10px;
                border-left: 4px solid #10b981;
                transition: all 0.3s ease;
              }
              .earning-item:hover {
                background: #ecfdf5;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
              }
              .earning-label {
                font-weight: 500;
                color: #374151;
              }
              .earning-amount {
                font-weight: 700;
                color: #059669;
                font-size: 16px;
              }
              .deduction-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: #fef2f2;
                border-radius: 10px;
                border-left: 4px solid #ef4444;
                margin-bottom: 12px;
                transition: all 0.3s ease;
              }
              .deduction-item:hover {
                background: #fee2e2;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
              }
              .deduction-label {
                font-weight: 500;
                color: #374151;
              }
              .deduction-amount {
                font-weight: 700;
                color: #dc2626;
                font-size: 16px;
              }
              .summary-section {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white;
                padding: 30px;
                border-radius: 16px;
                margin-bottom: 30px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              }
              .summary-row:last-child {
                border-bottom: none;
                border-top: 2px solid rgba(255, 255, 255, 0.2);
                margin-top: 15px;
                font-size: 20px;
                font-weight: 800;
              }
              .net-pay {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-size: 24px;
              }
              .signature-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 50px;
                padding-top: 30px;
                border-top: 2px solid #f3f4f6;
              }
              .signature-box {
                text-align: center;
              }
              .signature-line {
                border-top: 2px solid #374151;
                margin-bottom: 10px;
                width: 200px;
                margin: 40px auto 10px;
              }
              .signature-label {
                font-weight: 600;
                color: #6b7280;
                margin-bottom: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding: 25px;
                background: #f8fafc;
                border-radius: 12px;
                color: #6b7280;
                font-size: 12px;
                border: 1px solid #e5e7eb;
              }
              .footer-line {
                margin-bottom: 5px;
              }
              @media print {
                body { 
                  background: white;
                  padding: 0;
                }
                .no-print { display: none !important; }
                .payslip-container { 
                  box-shadow: none;
                  border-radius: 0;
                }
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

  const handleDownloadPDF = () => {
    const element = document.getElementById('payslip-content');
    const opt = {
      margin: 0.5,
      filename: `payslip_${record["Employee ID"]}_${record["Pay Period"]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-900">Payslip</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Download size={16} />
              Download PDF
            </button>
            {/* <button
              onClick={handlePrint}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </button> */}
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        <div className="p-2 bg-gray-50 payslip-container">
          <div id="payslip-content" className="bg-white rounded-lg shadow-lg overflow-hidden text-xs leading-tight">
            
            {/* Header */}
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                {companyInfo?.image_url && (
                  <img src={companyInfo.image_url} alt="Company Logo" className="h-12 w-12 mr-3 bg-white p-1 rounded" />
                )}
                <div>
                  <h1 className="text-lg font-bold">{companyInfo?.company_name || 'Your Company Name'}</h1>
                  <div className="text-gray-300 text-xs">{companyInfo?.company_tagline || 'Excellence in Service'}</div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold">PAYSLIP</h2>
                <div className="text-gray-300 text-xs">
                  {record["Pay Period"] ? new Date(record["Pay Period"] + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Employee Info */}
                <div className="border p-3 rounded">
                  <h3 className="font-semibold border-b mb-2">EMPLOYEE INFORMATION</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>Full Name:</span><span>{record["Employee Name"] || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Employee No:</span><span>{record["Employee ID"] || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Department:</span><span>{record["Department"] || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Position:</span><span>{record["Position"] || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border p-3 rounded">
                  <h3 className="font-semibold border-b mb-2">PAYMENT DETAILS</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>Pay Period:</span><span>{record["Pay Period"] || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Gross Pay:</span><span>KSh {parseFloat(record["Gross Pay"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Total Deductions:</span><span>KSh {parseFloat(record["Total Deductions"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Net Pay:</span><span>KSh {parseFloat(record["Net Pay"] || '0').toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Earnings + Deductions */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Earnings */}
                <div className="border rounded">
                  <div className="bg-gray-200 font-semibold p-2">EARNINGS</div>
                  <div className="p-2 space-y-1">
                    <div className="flex justify-between"><span>Basic Salary:</span><span>KSh {parseFloat(record["Basic Salary"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>House Allowance:</span><span>KSh {parseFloat(record["House Allowance"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Transport Allowance:</span><span>KSh {parseFloat(record["Transport Allowance"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Medical Allowance:</span><span>KSh {parseFloat(record["Medical Allowance"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Overtime Pay:</span><span>KSh {parseFloat(record["Overtime Pay"] || '0').toLocaleString()}</span></div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border rounded">
                  <div className="bg-gray-200 font-semibold p-2">DEDUCTIONS</div>
                  <div className="p-2 space-y-1">
                    <div className="flex justify-between"><span>PAYE Tax:</span><span>KSh {parseFloat(record["PAYE Tax"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>NHIF:</span><span>KSh {parseFloat(record["NHIF"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>NSSF:</span><span>KSh {parseFloat(record["NSSF"] || '0').toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Housing Levy:</span><span>KSh {parseFloat(record["Housing Levy"] || '0').toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="border p-3 rounded mb-4">
                <div className="flex justify-between border-b pb-1">
                  <span>Gross Pay</span>
                  <span>KSh {parseFloat(record["Gross Pay"] || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Total Deductions</span>
                  <span className="text-red-600">KSh {parseFloat(record["Total Deductions"] || '0').toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-green-700">
                  <span>NET PAY</span>
                  <span>KSh {parseFloat(record["Net Pay"] || '0').toLocaleString()}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-center text-xs">
                <div className="border border-dashed p-2">Employee Signature<br/>Date: __________</div>
                <div className="border border-dashed p-2">Authorized Signatory<br/>Date: __________</div>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-xs">
                Generated on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()} • {companyInfo?.company_name || 'Company'} • Confidential
              </div>
            </div>
          </div>
        </div>

        {(onPrevious || onNext) && (
          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-between">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2 ml-auto"
              >
                Next
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// PayslipViewer Component for Staff Portal
const PayslipViewer = () => {
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [currentPayslipIndex, setCurrentPayslipIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchPayslips();
    fetchCompanyInfo();
  }, []);

  const fetchPayslips = async () => {
    try {
      setIsLoading(true);
      
      // Get current user's employee ID from their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      // Get employee number from user email
      const { data: employeeData } = await supabase
        .from('employees')
        .select('"Employee Number"')
        .eq('"Work Email"', user.email)
        .single();

      if (!employeeData) return;

      // Fetch payslips for this employee
      const { data, error } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('"Employee ID"', employeeData["Employee Number"])
        .order('"Pay Period"', { ascending: false });

      if (error) throw error;

      setPayslips(data || []);
    } catch (error) {
      console.error('Error fetching payslips:', error);
      toast.error('Failed to load payslips');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('company_logo')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching company info:', error);
        return;
      }

      if (data) {
        setCompanyInfo(data);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleViewPayslip = (payslip, index) => {
    setSelectedPayslip(payslip);
    setCurrentPayslipIndex(index);
  };

  const handleNavigatePayslip = (direction) => {
    if (currentPayslipIndex === null || !selectedPayslip) return;

    const newIndex = direction === 'prev' ? currentPayslipIndex - 1 : currentPayslipIndex + 1;
    
    if (newIndex >= 0 && newIndex < filteredPayslips.length) {
      setSelectedPayslip(filteredPayslips[newIndex]);
      setCurrentPayslipIndex(newIndex);
    }
  };

  const toggleRowExpand = (id, e) => {
    e.stopPropagation();
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  };

  // Filter payslips based on search and period
  const filteredPayslips = payslips.filter(payslip => {
    const matchesSearch = !searchTerm.trim() || 
      (payslip["Employee Name"] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payslip["Employee ID"] || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Fixed the period filtering logic
    const matchesPeriod = selectedPeriod === 'all' || 
      (payslip["Pay Period"] && payslip["Pay Period"] === selectedPeriod);
    
    return matchesSearch && matchesPeriod;
  });

  // Fixed getUniquePeriods function
  const getUniquePeriods = () => {
    const periods = [...new Set(payslips.map(p => p["Pay Period"]).filter(Boolean))];
    return periods.sort((a, b) => new Date(b + '-01') - new Date(a + '-01')); // Sort by date descending
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">My Payslips</h2>
        <div className="flex items-center mt-2">
          <div className="h-1 w-8 bg-green-500 rounded-full mr-2"></div>
          <p className="text-xs text-green-600">View and download your payslips</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payslips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Pay Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Periods</option>
              {getUniquePeriods().map(period => (
                <option key={period} value={period}>
                  {new Date(period + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">Total Records</label>
            <div className="px-4 py-2 text-xs bg-gray-50 rounded-lg border border-gray-300">
              {filteredPayslips.length} payslip{filteredPayslips.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">Pay Period</th>
                <th className="px-4 py-3 text-left text-gray-700 font-semibold">Employee</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">Gross Pay</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">Deductions</th>
                <th className="px-4 py-3 text-right text-gray-700 font-semibold">Net Pay</th>
                <th className="px-4 py-3 text-center text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No payslips found. {payslips.length === 0 ? 'You have no payslip records yet.' : 'Try adjusting your search filters.'}
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((payslip, index) => {
                  const isExpanded = expandedRows.has(payslip.id);
                  
                  return (
                    <React.Fragment key={payslip.id}>
                      <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button 
                              onClick={(e) => toggleRowExpand(payslip.id, e)}
                              className="mr-2 text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <div className="font-medium text-gray-900">
                                {payslip["Pay Period"] ? new Date(payslip["Pay Period"] + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{payslip["Employee Name"] || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{payslip["Employee ID"] || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-green-600">
                          KSh {parseFloat(payslip["Gross Pay"] || '0').toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right text-red-600">
                          KSh {parseFloat(payslip["Total Deductions"] || '0').toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-green-700">
                          KSh {parseFloat(payslip["Net Pay"] || '0').toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleViewPayslip(payslip, index)}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1 mx-auto"
                          >
                            <FileText size={12} />
                            View
                          </button>
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Earnings</h4>
                                <div className="flex justify-between">
                                  <span>Basic Salary:</span>
                                  <span>KSh {parseFloat(payslip["Basic Salary"] || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>House Allowance:</span>
                                  <span>KSh {parseFloat(payslip["House Allowance"] || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Transport Allowance:</span>
                                  <span>KSh {parseFloat(payslip["Transport Allowance"] || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Overtime Pay:</span>
                                  <span>KSh {parseFloat(payslip["Overtime Pay"] || '0').toLocaleString()}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Deductions</h4>
                                <div className="flex justify-between">
                                  <span>PAYE Tax:</span>
                                  <span className="text-red-600">KSh {parseFloat(payslip["PAYE Tax"] || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>NHIF:</span>
                                  <span className="text-red-600">KSh {parseFloat(payslip["NHIF"] || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>NSSF:</span>
                                  <span className="text-red-600">KSh {parseFloat(payslip["NSSF"] || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Housing Levy:</span>
                                  <span className="text-red-600">KSh {parseFloat(payslip["Housing Levy"] || '0').toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <PayslipModal
          record={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          onPrevious={currentPayslipIndex !== null && currentPayslipIndex > 0 ? 
            () => handleNavigatePayslip('prev') : undefined}
          onNext={currentPayslipIndex !== null && currentPayslipIndex < filteredPayslips.length - 1 ? 
            () => handleNavigatePayslip('next') : undefined}
          companyInfo={companyInfo}
        />
      )}
    </div>
  );
};

export default PayslipViewer;