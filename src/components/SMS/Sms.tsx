import { useState, useMemo, useEffect } from 'react';
import { 
  MessageSquare, Send, Upload, FileText, CreditCard, 
  CheckCircle, AlertCircle, Info, Package, Receipt,
  Building, User, Phone, Mail, Download, Clock,
  Calendar, Users, UserCheck, FileEdit, Trash2,
  Plus, X, ChevronDown, ChevronUp, Bell, Search,
  Loader, Shield, Smartphone, RefreshCw, Save
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

type BulkUpload = {
  id: string;
  filename: string;
  totalRecipients: number;
  processed: number;
  status: 'processing' | 'completed' | 'failed';
  uploadedAt: string;
};

// SMS Service Configuration
const SMS_LEOPARD_CONFIG = {
  baseUrl: 'https://api.smsleopard.com/v1',
  username: 'yxFXqkhbsdbm2cCeXOju',
  password: 'GHwclfNzr8ZT6iSOutZojrWheLKH3FWGw9rQ2eGQ',
  source: 'sms_Leopard'
};

// Phone Number Formatting for SMS Leopard
const formatPhoneNumberForSMS = (phone: string): string => {
  if (!phone) return '';
  
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('254') && cleaned.length === 12) {
    // Keep as is
  } else if (cleaned.startsWith('+254') && cleaned.length === 13) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('254')) {
    return cleaned;
  }
  
  return '';
};

// Function to replace template variables with ACTUAL employee data
const replaceTemplateVariables = (template: string, employee: Employee, additionalData?: any): string => {
  let message = template;
  
  // Replace with ACTUAL employee data
  message = message.replace(/{name}/gi, employee.employee_name || 'Employee');
  message = message.replace(/{employee_id}/gi, employee.employee_id || '');
  message = message.replace(/{department}/gi, employee.department || '');
  message = message.replace(/{position}/gi, employee.position || '');
  message = message.replace(/{phone}/gi, employee.phone_number || '');
  
  // Replace company variable
  message = message.replace(/{company}/gi, 'ZiraHR');
  
  // Replace current date variables
  const now = new Date();
  message = message.replace(/{date}/gi, now.toLocaleDateString());
  message = message.replace(/{month}/gi, now.toLocaleDateString('en-US', { month: 'long' }));
  message = message.replace(/{year}/gi, now.getFullYear().toString());
  
  // Replace additional data variables
  if (additionalData) {
    Object.keys(additionalData).forEach(key => {
      const placeholder = new RegExp(`{${key}}`, 'gi');
      message = message.replace(placeholder, additionalData[key] || '');
    });
  }
  
  return message;
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

    const endpoint = `${SMS_LEOPARD_CONFIG.baseUrl}/sms/send?username=${SMS_LEOPARD_CONFIG.username}&password=${SMS_LEOPARD_CONFIG.password}&message=${encodeURIComponent(message.trim())}&destination=${formattedPhone}&source=${SMS_LEOPARD_CONFIG.source}`;

    const credentials = btoa(`${SMS_LEOPARD_CONFIG.username}:${SMS_LEOPARD_CONFIG.password}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(`SMS service error: ${response.status} - ${responseText}`);
    }

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
      const result = await sendSMSLeopard(phoneNumber, message);
      
      if (result.success) {
        return result;
      }
      
      lastError = new Error(result.error || 'SMS sending failed');
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// SMS Packages Data
const smsPackages: SMSPackage[] = [
  {
    id: 'basic',
    name: 'Basic Package',
    smsCount: 100000,
    cost: 50000,
    costPerSMS: 0.5,
  },
  {
    id: 'standard',
    name: 'Standard Package',
    smsCount: 250000,
    cost: 100000,
    costPerSMS: 0.4,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Package',
    smsCount: 666666,
    cost: 200000,
    costPerSMS: 0.3,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Package',
    smsCount: 1500000,
    cost: 300000,
    costPerSMS: 0.2,
  },
];

// Function to parse CSV file
const parseCSV = (file: File): Promise<{phone_number: string, message: string}[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        const results = [];
        
        for (let i = 1; i < lines.length; i++) {
          const [phone_number, message] = lines[i].split(',').map(field => field.trim());
          if (phone_number && message) {
            results.push({ phone_number, message });
          }
        }
        
        resolve(results);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
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
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkUploads, setBulkUploads] = useState<BulkUpload[]>([]);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({name: '', category: 'Business', content: ''});
  const [additionalVariables, setAdditionalVariables] = useState<Record<string, string>>({});
  const [showAdditionalVariablesModal, setShowAdditionalVariablesModal] = useState(false);

  // Templates
  const kenyaHolidayTemplates: SMSTemplate[] = [
    {
      id: 'new_year',
      name: 'New Year Greetings',
      category: 'Holiday',
      content: 'Dear {name}, Wishing you a prosperous New Year {year}! May this year bring you success and happiness. From {company}',
      variables: ['name', 'year', 'company']
    },
    {
      id: 'christmas',
      name: 'Christmas Wishes',
      category: 'Holiday',
      content: 'Dear {name}, Merry Christmas! May this festive season bring joy and prosperity to you and your family. From {company}',
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
      id: 'meeting',
      name: 'Meeting Reminder',
      category: 'Business',
      content: 'Hello {name}, reminder: {meeting_title} on {date} at {time}. Venue: {venue}',
      variables: ['name', 'meeting_title', 'date', 'time', 'venue']
    },
    {
      id: 'birthday',
      name: 'Birthday Wishes',
      category: 'Business',
      content: 'Happy Birthday {name}! Wishing you a wonderful year ahead filled with success and happiness. From {company}',
      variables: ['name', 'company']
    },
    {
      id: 'welcome',
      name: 'Welcome Message',
      category: 'Business',
      content: 'Welcome {name} to {company}! We are excited to have you in the {department} department.',
      variables: ['name', 'company', 'department']
    },
    {
      id: 'test',
      name: 'Simple Test',
      category: 'Business',
      content: 'Test SMS from ZiraHR SMS Center. Please ignore.',
      variables: []
    }
  ];

  // Function to extract variables from message
  const extractVariablesFromMessage = (text: string): string[] => {
    const variableRegex = /{(\w+)}/g;
    const matches = text.match(variableRegex);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  // Check if template needs additional variables beyond employee data
  const getAdditionalVariablesNeeded = (template: SMSTemplate): string[] => {
    const employeeVariables = ['name', 'employee_id', 'department', 'position', 'phone', 'company', 'date', 'month', 'year'];
    return template.variables.filter(variable => !employeeVariables.includes(variable));
  };

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
            const hasValidPhone = phone && phone.length === 12 && phone.startsWith('254');
            return hasValidPhone;
          });

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

  // Template selection with ACTUAL employee data preview
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      
      // Show preview with ACTUAL selected employee data
      if (selectedEmployees.length > 0) {
        const firstEmployee = employees.find(emp => emp.id === selectedEmployees[0]);
        if (firstEmployee) {
          const previewMessage = replaceTemplateVariables(template.content, firstEmployee, additionalVariables);
          setMessage(previewMessage);
          setCharacterCount(previewMessage.length);
        }
      } else {
        setMessage(template.content);
        setCharacterCount(template.content.length);
      }
      
      // Check if we need additional variables
      const additionalVarsNeeded = getAdditionalVariablesNeeded(template);
      if (additionalVarsNeeded.length > 0) {
        const initialVariables: Record<string, string> = {};
        additionalVarsNeeded.forEach(variable => {
          initialVariables[variable] = additionalVariables[variable] || '';
        });
        setAdditionalVariables(initialVariables);
        setShowAdditionalVariablesModal(true);
      }
    }
  };

  // Save current message as template
  const saveCurrentAsTemplate = () => {
    if (!message.trim()) {
      toast.error('Please enter a message first');
      return;
    }

    const variables = extractVariablesFromMessage(message);
    const newTemplateData = {
      id: `template_${Date.now()}`,
      name: `Custom Template ${templates.length + 1}`,
      category: 'Custom',
      content: message,
      variables: variables
    };

    setTemplates(prev => [...prev, newTemplateData]);
    toast.success('Template saved successfully!');
  };

  // Apply template with additional variables
  const applyTemplateWithAdditionalVariables = () => {
    if (selectedEmployees.length > 0 && selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      const firstEmployee = employees.find(emp => emp.id === selectedEmployees[0]);
      if (template && firstEmployee) {
        const previewMessage = replaceTemplateVariables(template.content, firstEmployee, additionalVariables);
        setMessage(previewMessage);
        setCharacterCount(previewMessage.length);
      }
    }
    setShowAdditionalVariablesModal(false);
    toast.success('Additional variables saved!');
  };

  // SMS sending function with PROPER employee data replacement
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
    
    setIsSending(true);
    setSendingProgress({ current: 0, total: selectedEmployeeData.length });

    try {
      if (immediate) {
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selectedEmployeeData.length; i++) {
          const employee = selectedEmployeeData[i];
          setSendingProgress({ current: i + 1, total: selectedEmployeeData.length });
          
          try {
            // Create PERSONALIZED message for EACH employee
            let personalizedMessage = message;
            
            // If using a template, replace variables with ACTUAL employee data
            if (selectedTemplate) {
              personalizedMessage = replaceTemplateVariables(message, employee, additionalVariables);
            }
            
            const result = await sendSMSWithRetry(employee.phone_number, personalizedMessage);
            
            if (result.success) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            failCount++;
          }

          if (i < selectedEmployeeData.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (successCount > 0) {
          toast.success(`SMS sent to ${successCount} employees`);
        }
        if (failCount > 0) {
          toast.error(`Failed to send to ${failCount} employees`);
        }

        await loadSMSStats();
      } else {
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
      setSelectedTemplate('');
      setAdditionalVariables({});
      
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
      const testNumbers = ['254716431987', '0716431987'];
      
      let success = false;
      
      for (const testPhone of testNumbers) {
        const formatted = formatPhoneNumberForSMS(testPhone);
        
        if (!formatted) continue;
        
        const result = await sendSMSWithRetry(formatted, 'Test SMS from ZiraHR SMS Center - Please ignore');
        
        if (result.success) {
          toast.success(`Test SMS sent successfully to ${formatted}!`);
          success = true;
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (!success) {
        toast.error('All test SMS attempts failed.');
      }
      
      await loadSMSStats();
      
    } catch (error) {
      toast.error('Test SMS error: ' + (error as Error).message);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setUploadedFile(file);
        
        const uploadRecord: BulkUpload = {
          id: Date.now().toString(),
          filename: file.name,
          totalRecipients: 0,
          processed: 0,
          status: 'processing',
          uploadedAt: new Date().toISOString()
        };
        
        setBulkUploads(prev => [uploadRecord, ...prev]);
        toast.success('CSV file uploaded successfully.');
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  };

  const processBulkUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a CSV file first');
      return;
    }

    try {
      const records = await parseCSV(uploadedFile);
      if (records.length === 0) {
        toast.error('No valid records found in CSV file');
        return;
      }

      setIsSending(true);
      setSendingProgress({ current: 0, total: records.length });

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        setSendingProgress({ current: i + 1, total: records.length });

        try {
          const formattedPhone = formatPhoneNumberForSMS(record.phone_number);
          if (formattedPhone) {
            const result = await sendSMSWithRetry(formattedPhone, record.message);
            if (result.success) {
              successCount++;
            } else {
              failCount++;
            }
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }

        setBulkUploads(prev => prev.map(upload => 
          upload.filename === uploadedFile.name 
            ? { ...upload, processed: i + 1, totalRecipients: records.length }
            : upload
        ));

        if (i < records.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setBulkUploads(prev => prev.map(upload => 
        upload.filename === uploadedFile.name 
          ? { ...upload, status: 'completed' }
          : upload
      ));

      if (successCount > 0) {
        toast.success(`Bulk SMS completed: ${successCount} sent, ${failCount} failed`);
      } else {
        toast.error('Bulk SMS failed for all recipients');
      }

      await loadSMSStats();

    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Failed to process bulk upload');
      
      setBulkUploads(prev => prev.map(upload => 
        upload.filename === uploadedFile.name 
          ? { ...upload, status: 'failed' }
          : upload
      ));
    } finally {
      setIsSending(false);
      setSendingProgress({ current: 0, total: 0 });
    }
  };

  const handleBuyPackage = (pkg: SMSPackage) => {
    setSelectedPackage(pkg.id);
    setShowPackageModal(true);
  };

  const cancelScheduledSMS = (id: string) => {
    setScheduledMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, status: 'cancelled' } : msg
      )
    );
    toast.success('Scheduled SMS cancelled');
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success('Template deleted');
  };

  // Create new template
  const createNewTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const variables = extractVariablesFromMessage(newTemplate.content);
    const template: SMSTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplate.name,
      category: newTemplate.category,
      content: newTemplate.content,
      variables: variables
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', category: 'Business', content: '' });
    setShowNewTemplateModal(false);
    toast.success('Template created successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SMS Center</h1>
          <p className="text-slate-600 text-xs">Manage and send SMS messages to employees</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={testSMS}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-xs">Test SMS</span>
          </button>
          <button
            onClick={loadSMSStats}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs">Refresh Balance</span>
          </button>
          <div className="bg-white rounded-xl border border-slate-200 p-2">
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-xs text-slate-600">SMS Balance</p>
                <p className="text-xs text-green-500">{smsStats.balance}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Sent This Month</p>
              <p className="text-xl font-base text-slate-900">{smsStats.sentThisMonth.toLocaleString()}</p>
            </div>
            <Send className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Remaining SMS</p>
              <p className="text-xl font-base text-slate-900">{smsStats.remaining.toLocaleString()}</p>
            </div>
            <Package className="w-5 h-5 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Delivery Rate</p>
              <p className="text-xl font-base text-slate-900">{smsStats.deliveryRate}%</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Failed SMS</p>
              <p className="text-xl font-base text-slate-900">{smsStats.failed}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'compose', name: 'Compose SMS', icon: MessageSquare },
              { id: 'templates', name: 'Templates', icon: FileText },
              { id: 'scheduled', name: 'Scheduled', icon: Clock },
              { id: 'bulk', name: 'Bulk SMS', icon: Users },
            ].map((tab) => {
              const IconComponent = tab.icon;
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
                  <IconComponent className="w-4 h-4" />
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
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-medium text-slate-700">
                        Compose Message
                      </label>
                      <button
                        onClick={saveCurrentAsTemplate}
                        className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs hover:bg-slate-200"
                      >
                        <Save className="w-3 h-3" />
                        Save as Template
                      </button>
                    </div>
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
                            {template.name} ({template.category}) - {template.variables.length} variables
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTemplate && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs font-medium text-slate-700 mb-2">Template Variables:</p>
                        <div className="flex flex-wrap gap-1">
                          {templates.find(t => t.id === selectedTemplate)?.variables.map(variable => (
                            <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {variable}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 mt-2">
                          Variables like <strong>name</strong>, <strong>department</strong> will be automatically filled from employee data.
                          {getAdditionalVariablesNeeded(templates.find(t => t.id === selectedTemplate)!).length > 0 && (
                            <span className="text-orange-600"> Some variables need additional input.</span>
                          )}
                        </p>
                      </div>
                    )}
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
                        Sending personalized messages to each employee...
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

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">SMS Templates</h3>
                <button 
                  onClick={() => setShowNewTemplateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">{template.name}</h4>
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs mt-1">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-slate-100 rounded">
                          <FileEdit className="w-4 h-4 text-slate-600" />
                        </button>
                        <button 
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 line-clamp-3">{template.content}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.map(variable => (
                        <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {variable}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {template.variables.length} variables
                      </span>
                      <button 
                        onClick={() => handleTemplateSelect(template.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Scheduled Messages</h3>
              
              {scheduledMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">No scheduled messages</p>
                  <p className="text-slate-400 text-xs mt-1">Schedule your first SMS from the Compose tab</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledMessages.map(sms => (
                    <div key={sms.id} className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              sms.status === 'scheduled' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : sms.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {sms.status.charAt(0).toUpperCase() + sms.status.slice(1)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {sms.scheduledDate} at {sms.scheduledTime}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{sms.message}</p>
                          <p className="text-xs text-slate-500">
                            To: {sms.recipients.join(', ')}
                          </p>
                        </div>
                        {sms.status === 'scheduled' && (
                          <button
                            onClick={() => cancelScheduledSMS(sms.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Bulk SMS Upload</h3>
                  
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-2">Upload CSV file with phone numbers</p>
                    <p className="text-xs text-slate-500 mb-4">
                      Format: phone_number,message (one per line)
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-blue-700"
                    >
                      Choose CSV File
                    </label>
                    {uploadedFile && (
                      <p className="text-xs text-green-600 mt-3">
                        ✓ {uploadedFile.name} uploaded
                      </p>
                    )}
                  </div>

                  <button
                    onClick={processBulkUpload}
                    disabled={!uploadedFile || isSending}
                    className="w-full py-3 bg-green-600 text-white rounded-lg text-xs font-medium disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSending ? 'Processing...' : 'Process Bulk Upload'}
                  </button>

                  {bulkUploads.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-900 mb-3">Upload History</h4>
                      <div className="space-y-2">
                        {bulkUploads.map(upload => (
                          <div key={upload.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="text-xs font-medium text-slate-900">{upload.filename}</p>
                              <p className="text-xs text-slate-500">
                                {upload.processed}/{upload.totalRecipients} recipients
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              upload.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : upload.status === 'processing'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {upload.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">SMS Packages</h3>
                  
                  <div className="space-y-3">
                    {smsPackages.map(pkg => (
                      <div
                        key={pkg.id}
                        className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPackage === pkg.id
                            ? 'border-blue-500 ring-2 ring-blue-100'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${pkg.popular ? 'relative' : ''}`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            POPULAR
                          </span>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-slate-900">{pkg.name}</h4>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">KSh {pkg.cost.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">KSh {pkg.costPerSMS} per SMS</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">
                          {pkg.smsCount.toLocaleString()} SMS
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyPackage(pkg);
                          }}
                          className="w-full py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          Buy Package
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Variables Modal */}
      {showAdditionalVariablesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Additional Information Needed</h3>
              <button
                onClick={() => setShowAdditionalVariablesModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                The selected template requires some additional information that will be used for all recipients:
              </p>
              
              {Object.keys(additionalVariables).map(variable => (
                <div key={variable}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {variable.charAt(0).toUpperCase() + variable.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={additionalVariables[variable]}
                    onChange={(e) => setAdditionalVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${variable}`}
                  />
                </div>
              ))}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAdditionalVariablesModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={applyTemplateWithAdditionalVariables}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Template Modal */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Create New Template</h3>
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({...prev, name: e.target.value}))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({...prev, category: e.target.value}))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Business">Business</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Template Content
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({...prev, content: e.target.value}))}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter template content (use {variable} for dynamic fields)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Use {'{variable}'} for dynamic fields. Employee data: {'{name}'}, {'{department}'}, {'{position}'}, {'{phone}'}
                </p>
              </div>
              
              <button
                onClick={createNewTemplate}
                className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Purchase SMS Package</h3>
              <button
                onClick={() => setShowPackageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 text-sm">
                  {smsPackages.find(p => p.id === selectedPackage)?.name}
                </h4>
                <p className="text-slate-600 text-sm mt-1">
                  {smsPackages.find(p => p.id === selectedPackage)?.smsCount.toLocaleString()} SMS
                </p>
                <p className="text-lg font-bold text-slate-900 mt-2">
                  KSh {smsPackages.find(p => p.id === selectedPackage)?.cost.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select className="w-full border border-slate-300 rounded-lg p-2 text-xs">
                    <option>MPESA</option>
                    <option>Credit Card</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <button className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  Complete Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}