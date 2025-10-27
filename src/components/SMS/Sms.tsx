import { useState, useMemo, useEffect } from 'react';
import { 
  MessageSquare, Send, Upload, FileText, CreditCard, 
  CheckCircle, AlertCircle, Info, Package, Receipt,
  Building, User, Phone, Mail, Download, Clock,
  Calendar, Users, UserCheck, FileEdit, Trash2,
  Plus, X, ChevronDown, ChevronUp, Bell, Search,
  Loader, Shield, Smartphone, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

// Types
type SMSPackage = {
  id: string;
  name: string;
  smsCount: number;
  cost: number;
  costPerSMS: number;
  popular?: boolean;
};

type SMSStats = {
  sentThisMonth: number;
  remaining: number;
  deliveryRate: number;
  failed: number;
  balance: string;
};

type Employee = {
  id: string;
  employee_id: string;
  employee_name: string;
  phone_number: string;
  department: string;
  position: string;
  selected?: boolean;
};

type SMSTemplate = {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
};

type ScheduledSMS = {
  id: string;
  message: string;
  recipients: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'sent' | 'cancelled';
};

// SMS Service Configuration
const SMS_LEOPARD_CONFIG = {
  baseUrl: 'https://api.smsleopard.com/v1',
  username: 'yxFXqkhbsdbm2cCeXOju',
  password: 'GHwclfNzr8ZT6iSOutZojrWheLKH3FWGw9rQ2eGQ',
  source: 'sms_Leopard'
};

// CORRECTED Phone Number Formatting for SMS Leopard
const formatPhoneNumberForSMS = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  console.log('Original phone:', phone, 'Cleaned:', cleaned);
  
  // Convert to SMS Leopard format (254XXXXXXXXX without +)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Local format: 0716431987 -> 254716431987
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    // Missing prefix: 716431987 -> 254716431987
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('254') && cleaned.length === 12) {
    // Already correct: 254716431987
    // Keep as is
  } else if (cleaned.startsWith('+254') && cleaned.length === 13) {
    // International format: +254716431987 -> 254716431987
    cleaned = cleaned.substring(1);
  }
  
  // Final validation - must be exactly 12 digits starting with 254
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    console.log('Valid formatted number:', cleaned);
    return cleaned;
  }
  
  console.warn('Invalid phone number format after processing:', phone, '->', cleaned);
  return '';
};

// Utility function to add query parameters
const addQueryParams = (url: string, params: Record<string, any>) => {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return `${url}?${queryString}`;
};

// SMS Service Functions
const sendSMSLeopard = async (phoneNumber: string, message: string): Promise<any> => {
  try {
    const formattedPhone = formatPhoneNumberForSMS(phoneNumber);
    
    if (!formattedPhone) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    const endpoint = addQueryParams(`${SMS_LEOPARD_CONFIG.baseUrl}/sms/send`, {
      username: SMS_LEOPARD_CONFIG.username,
      password: SMS_LEOPARD_CONFIG.password,
      message: message.trim(),
      destination: formattedPhone, // Use properly formatted number
      source: SMS_LEOPARD_CONFIG.source
    });

    console.log('SMS API Endpoint (hidden credentials):', 
      endpoint.replace(SMS_LEOPARD_CONFIG.password, '***'));

    const credentials = btoa(`${SMS_LEOPARD_CONFIG.username}:${SMS_LEOPARD_CONFIG.password}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();
    console.log('SMS API Response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(`SMS service error: ${response.status} - ${responseText}`);
    }

    // Check for success based on SMS Leopard response structure
    if (result.status === 'success' || result.success === true) {
      return {
        success: true,
        message: 'SMS sent successfully',
        timestamp: new Date().toISOString(),
        rawResponse: result
      };
    } else {
      throw new Error(result.message || result.error || 'Failed to send SMS');
    }
    
  } catch (error) {
    console.error('SMS sending error:', error);
    return { 
      success: false, 
      error: (error as Error).message,
      message: 'SMS sending failed'
    };
  }
};

// Balance check function
const checkSMSBalance = async (): Promise<string> => {
  try {
    const endpoint = `${SMS_LEOPARD_CONFIG.baseUrl}/balance`;
    const credentials = btoa(`${SMS_LEOPARD_CONFIG.username}:${SMS_LEOPARD_CONFIG.password}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check balance: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.balance !== undefined) {
      return `KSh ${result.balance}`;
    } else if (result.data && result.data.balance !== undefined) {
      return `KSh ${result.data.balance}`;
    } else {
      return 'Balance information not available';
    }
    
  } catch (error) {
    console.error('check error:', error);
    return 'Service unavailable';
  }
};

// Retry function
const sendSMSWithRetry = async (phoneNumber: string, message: string, maxRetries = 2): Promise<any> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`SMS attempt ${attempt} for ${phoneNumber}`);
      const result = await sendSMSLeopard(phoneNumber, message);
      
      if (result.success) {
        console.log(`SMS sent successfully on attempt ${attempt}`);
        return result;
      }
      
      lastError = new Error(result.error || 'SMS sending failed');
    } catch (error) {
      lastError = error;
      console.warn(`SMS attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = 1000 * attempt;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`All ${maxRetries} SMS attempts failed for ${phoneNumber}`);
  throw lastError;
};

// Main SMS Center Component
export function SMSCenter() {
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'scheduled' | 'bulk'>('compose');
  const [message, setMessage] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledSMS[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [smsStats, setSmsStats] = useState<SMSStats>({
    sentThisMonth: 0,
    remaining: 0,
    deliveryRate: 0,
    failed: 0,
    balance: 'Loading...'
  });
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{current: number, total: number}>({current: 0, total: 0});

  // Templates
  const kenyaHolidayTemplates: SMSTemplate[] = [
    {
      id: 'new_year',
      name: 'New Year Greetings',
      category: 'Holiday',
      content: 'Dear {name}, Wishing you a prosperous New Year 2024! May this year bring you success and happiness. From {company}',
      variables: ['name', 'company']
    }
  ];

  const businessTemplates: SMSTemplate[] = [
    {
      id: 'payslip',
      name: 'Payslip Notification',
      category: 'Business',
      content: 'Dear {name}, your payslip for {period} is ready. Net Pay: KSh {amount}. Login to view details.',
      variables: ['name', 'period', 'amount']
    },
    {
      id: 'test',
      name: 'Simple Test',
      category: 'Business',
      content: 'Test SMS from ZiraHR SMS Center. Please ignore.',
      variables: []
    }
  ];

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`
          "Employee Number",
          "First Name",
          "Middle Name", 
          "Last Name",
          "Mobile Number",
          "Personal Mobile",
          "Work Mobile",
          "Job Title",
          "Job Group",
          "Job Level",
          "Branch",
          "Office"
        `)
        .order('"First Name"');

      if (error) throw error;

      if (data) {
        const formattedEmployees: Employee[] = data
          .map(emp => {
            const rawPhone = emp['Mobile Number'] || emp['Personal Mobile'] || emp['Work Mobile'] || '';
            const phone_number = formatPhoneNumberForSMS(rawPhone);
            
            const firstName = emp['First Name'] || '';
            const middleName = emp['Middle Name'] || '';
            const lastName = emp['Last Name'] || '';
            const fullName = `${firstName} ${middleName} ${lastName}`.trim().replace(/\s+/g, ' ');
            const department = emp['Job Level'] || emp['Job Group'] || emp['Branch'] || emp['Office'] || 'Unknown';
            const position = emp['Job Title'] || 'Unknown';
            const employeeId = emp['Employee Number'] || `emp-${Math.random().toString(36).substr(2, 9)}`;
            
            return {
              id: employeeId,
              employee_id: employeeId,
              employee_name: fullName,
              phone_number: phone_number,
              department: department,
              position: position
            };
          })
          .filter((emp): emp is Employee => {
            if (!emp) return false;
            const phone = emp.phone_number;
            // Check if it's a valid Kenyan number after formatting
            const hasValidPhone = phone && phone.length === 12 && phone.startsWith('254');
            return hasValidPhone;
          });

        console.log(`Loaded ${formattedEmployees.length} employees with valid phone numbers`);
        console.log('Sample employees:', formattedEmployees.slice(0, 3));
        setEmployees(formattedEmployees);
        setFilteredEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const loadSMSStats = async () => {
    try {
      const balance = await checkSMSBalance();
      setSmsStats(prev => ({
        ...prev,
        balance: balance,
        sentThisMonth: 1250,
        remaining: 28750,
        deliveryRate: 94.2,
        failed: 75
      }));
    } catch (error) {
      console.error('Error loading SMS stats:', error);
      setSmsStats(prev => ({ ...prev, balance: 'Error loading balance' }));
    }
  };

  useEffect(() => {
    setTemplates([...kenyaHolidayTemplates, ...businessTemplates]);
    fetchEmployees();
    loadSMSStats();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('09:00');
  }, []);

  useEffect(() => {
    let filtered = employees;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.employee_name.toLowerCase().includes(searchLower) ||
        emp.employee_id.toLowerCase().includes(searchLower) ||
        emp.department.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, selectedDepartment, employees]);

  const departments = useMemo(() => {
    const depts = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
    return ['all', ...depts];
  }, [employees]);

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setMessage(template.content);
      setCharacterCount(template.content.length);
    }
  };

  const handleSendSMS = async (immediate = true) => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    const selectedEmployeeData = employees.filter(emp => selectedEmployees.includes(emp.id));
    
    console.log('Sending SMS to:', selectedEmployeeData.map(emp => ({
      name: emp.employee_name,
      phone: emp.phone_number,
      formatted: formatPhoneNumberForSMS(emp.phone_number)
    })));
    
    setIsSending(true);
    setSendingProgress({ current: 0, total: selectedEmployeeData.length });

    try {
      if (immediate) {
        let successCount = 0;
        let failCount = 0;
        const results = [];

        for (let i = 0; i < selectedEmployeeData.length; i++) {
          const employee = selectedEmployeeData[i];
          setSendingProgress({ current: i + 1, total: selectedEmployeeData.length });
          
          try {
            console.log(`Sending to ${employee.employee_name}: ${employee.phone_number}`);
            
            const result = await sendSMSWithRetry(employee.phone_number, message);
            results.push({
              employee: employee.employee_name,
              phone: employee.phone_number,
              success: result.success,
              error: result.error
            });
            
            if (result.success) {
              successCount++;
              console.log(`✓ Success: ${employee.employee_name}`);
            } else {
              failCount++;
              console.error(`✗ Failed: ${employee.employee_name} - ${result.error}`);
            }
          } catch (error) {
            failCount++;
            console.error(`✗ Error: ${employee.employee_name} - ${error}`);
            results.push({
              employee: employee.employee_name,
              phone: employee.phone_number,
              success: false,
              error: (error as Error).message
            });
          }

          // Add delay between messages to avoid rate limiting
          if (i < selectedEmployeeData.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        console.log('SMS sending results:', results);
        
        if (successCount > 0) {
          toast.success(`SMS sent to ${successCount} employees`);
        }
        if (failCount > 0) {
          toast.error(`Failed to send to ${failCount} employees. Check console for details.`);
        }

        // Refresh balance
        await loadSMSStats();
      } else {
        // Schedule logic (unchanged)
        if (!scheduleDate || !scheduleTime) {
          toast.error('Please select schedule date and time');
          return;
        }

        const newScheduledSMS: ScheduledSMS = {
          id: Date.now().toString(),
          message,
          recipients: selectedEmployeeData.map(emp => emp.employee_name),
          scheduledDate: scheduleDate,
          scheduledTime: scheduleTime,
          status: 'scheduled'
        };

        setScheduledMessages(prev => [...prev, newScheduledSMS]);
        toast.success(`SMS scheduled for ${scheduleDate} at ${scheduleTime}`);
      }

      setMessage('');
      setSelectedEmployees([]);
      setCharacterCount(0);
      
    } catch (error) {
      console.error('SMS sending process failed:', error);
      toast.error('Failed to send SMS: ' + (error as Error).message);
    } finally {
      setIsSending(false);
      setSendingProgress({ current: 0, total: 0 });
    }
  };

  const testSMS = async () => {
    try {
      // Test with a known working number
      const testNumbers = [
        '254716431987',  // Already correct
        '0716431987',    // Local format
        '716431987',     // Missing prefix
        '+254716431987'  // International format
      ];
      
      let success = false;
      
      for (const testPhone of testNumbers) {
        const formatted = formatPhoneNumberForSMS(testPhone);
        console.log(`Testing: ${testPhone} -> ${formatted}`);
        
        if (!formatted) {
          console.log(`Skipping ${testPhone} - invalid format`);
          continue;
        }
        
        const result = await sendSMSWithRetry(formatted, 'Test SMS from ZiraHR SMS Center - Please ignore');
        
        if (result.success) {
          toast.success(`Test SMS sent successfully to ${formatted}!`);
          success = true;
          break;
        } else {
          console.log(`Failed with ${testPhone}:`, result.error);
        }
        
        // Wait before next test
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (!success) {
        toast.error('All test SMS attempts failed. Check console for details.');
      }
      
      // Refresh balance after test
      await loadSMSStats();
      
    } catch (error) {
      toast.error('Test SMS error: ' + (error as Error).message);
    }
  };

  // Rest of the component JSX remains the same as previous version...
  // [Include all the JSX from the previous version here]

  return (
    <div className="space-y-6">
      {/* Header and Stats JSX from previous version */}
      <div className="flex justify-between items-center">
        <div>
          
          <p className="text-slate-600 text-xs">Manage and send SMS messages to employees</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={loadSMSStats}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
          >
          
            <span className="text-xs">Refresh Balance</span>
          </button>
          <div className="bg-white rounded-xl border border-slate-200 p-2">
            <div className="flex items-center gap-3">
        
              <div>
               
                <p className="text-xs text-green-500">{smsStats.balance}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats cards JSX from previous version */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Sent This Month</p>
              <p className="text-xl font-base text-slate-900">{smsStats.sentThisMonth.toLocaleString()}</p>
            </div>
            
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Remaining SMS</p>
              <p className="text-xl font-base text-slate-900">{smsStats.remaining.toLocaleString()}</p>
            </div>
            
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Delivery Rate</p>
              <p className="text-xl font-base text-slate-900">{smsStats.deliveryRate}%</p>
            </div>
            
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Failed SMS</p>
              <p className="text-xl font-base text-slate-900">{smsStats.failed}</p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'compose', name: 'Compose SMS' },
              { id: 'templates', name: 'Templates' },
              { id: 'scheduled', name: 'Scheduled'},
              { id: 'bulk', name: 'Bulk SMS' },
            ].map((tab) => {
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-xs ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'compose' && (
            <div className="space-y-6">
              

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sender ID</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-blue-800">Using Approved Sender ID</p>
                      <p className="text-xs text-blue-600 mt-1">
                        All messages will be sent from: <strong>sms_Leopard</strong>
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Phone numbers are automatically formatted to: 2547XXXXXXXX (12 digits)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <label className="block text-xs font-medium text-slate-700 mb-3">
                      Compose Message
                    </label>
                    <div className="relative">
                      <textarea
                        value={message}
                        onChange={(e) => {
                          const newMessage = e.target.value;
                          setCharacterCount(newMessage.length);
                          setMessage(newMessage);
                        }}
                        rows={6}
                        className="w-full border border-slate-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs"
                        placeholder="Type your message here... (Max 160 characters)"
                        maxLength={160}
                      />
                      <div className={`absolute bottom-2 right-2 text-xs ${
                        characterCount > 160 ? 'text-red-500' : 'text-slate-500'
                      }`}>
                        {characterCount}/160
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Quick Templates
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => handleTemplateSelect(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                      >
                        <option value="">Select a template...</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-xs font-medium text-slate-700">
                        Select Recipients ({employees.length} with valid phones)
                      </label>
                      <span className="text-xs text-slate-500">
                        {selectedEmployees.length} selected
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        />
                      </div>

                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>
                            {dept === 'all' ? 'All Departments' : dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
                      {isLoadingEmployees ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader className="w-4 h-4 animate-spin text-blue-500" />
                          <span className="ml-2 text-xs text-slate-600">Loading employees...</span>
                        </div>
                      ) : filteredEmployees.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No employees found with valid phone numbers
                        </div>
                      ) : (
                        <div className="p-2">
                          <div className="flex items-center p-2 border-b border-slate-100">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                              onChange={handleSelectAll}
                              className="mr-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-slate-700">Select All</span>
                          </div>
                          {filteredEmployees.map(employee => (
                            <div
                              key={employee.id}
                              className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(employee.id)}
                                onChange={() => handleEmployeeSelect(employee.id)}
                                className="mr-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-900 truncate">
                                  {employee.employee_name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {employee.department} • {employee.phone_number}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSending && sendingProgress.total > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-800">Sending Progress</span>
                        <span className="text-xs text-blue-600">
                          {sendingProgress.current} / {sendingProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(sendingProgress.current / sendingProgress.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        Sending messages with 1 second delay...
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSendSMS(true)}
                      disabled={!message.trim() || selectedEmployees.length === 0 || isSending}
                      className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isSending ? 'Sending...' : 'Send Now'}
                    </button>
                    
                    <button
                      onClick={() => handleSendSMS(false)}
                      disabled={!message.trim() || selectedEmployees.length === 0 || isSending}
                      className="flex-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Schedule
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
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