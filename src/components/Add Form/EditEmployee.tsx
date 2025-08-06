import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { X, Save, PrinterIcon, Download, ArrowLeft, Plus, Upload, AlertCircle, Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlowButton from '../UI/GlowButton';
import { User, Briefcase, CreditCard, Phone, Mail, MapPin } from 'lucide-react';

type Employee = Database['public']['Tables']['employees']['Row'];

type DropdownOptions = {
  employmentTypes: string[];
  branches: string[];
  jobLevels: string[];
  jobGroup: string[];
  office: string[];
  jobTitles: string[];
  supervisors: string[];
  paymentMethods: string[];
  genders: string[];
};

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
};

type Dependent = {
  name: string;
  relationship: string;
  dateOfBirth?: string;
};

type StatutoryDeduction = {
  name: string;
  number: string;
  isActive: boolean;
};

const EditEmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Partial<Employee>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    employmentTypes: [],
    branches: [],
    jobLevels: [],
    jobGroup: [],
    office: [],
    jobTitles: [],
    supervisors: [],
    paymentMethods: ['Bank Transfer', 'Cash', 'Mobile Money'],
    genders: ['Male', 'Female', 'Other']
  });
  const [activeTab, setActiveTab] = useState('personal');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [statutoryDeductions, setStatutoryDeductions] = useState<StatutoryDeduction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch employee data
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('Employee Number', id)
          .single();

        if (empError) throw empError;
        if (!empData) throw new Error('Employee not found');

        // Fetch dropdown options
        const { data: empTypes } = await supabase
          .from('employees')
          .select('"Employee Type"')
          .not('Employee Type', 'is', null)
          .order('"Employee Type"', { ascending: true });

        const { data: branches } = await supabase
          .from('employees')
          .select('"Branch"')
          .not('Branch', 'is', null)
          .order('"Branch"', { ascending: true });

        const { data: jobLevels } = await supabase
          .from('employees')
          .select('"Job Level"')
          .not('Job Level', 'is', null)
          .order('"Job Level"', { ascending: true });

        const { data: jobGroup } = await supabase
          .from('employees')
          .select('"Job Group"')
          .not('Job Group', 'is', null)
          .order('"Job Group"', { ascending: true });

        const { data: office } = await supabase
          .from('employees')
          .select('"Town"')
          .not('Town', 'is', null)
          .order('"Town"', { ascending: true });

        const { data: jobTitles } = await supabase
          .from('employees')
          .select('"Job Title"')
          .not('Job Title', 'is', null)
          .order('"Job Title"', { ascending: true });

        const { data: supervisors } = await supabase
          .from('employees')
          .select('"Leave Approver"')
          .order('"Leave Approver"', { ascending: true });

        // Fetch emergency contacts
        const { data: contacts } = await supabase
          .from('emergency_contact')
          .select('*')
          .eq('Employee Number', id);

        // Fetch dependents
        const { data: deps } = await supabase
          .from('dependents')
          .select('*')
          .eq('Employee Number', id);

        // Fetch statutory deductions
        const { data: deductions } = await supabase
          .from('statutory_deductions')
          .select('*')
          .eq('employee_id', id);

        // Set default statutory deductions if none exist
        const defaultDeductions = [
          { name: 'KRA PIN', number: empData['Tax PIN'] || '', isActive: !!empData['Tax PIN'] },
          { name: 'NHIF', number: empData['NHIF'] || '', isActive: !!empData['NHIF'] },
          { name: 'NSSF', number: empData['NSSF'] || '', isActive: !!empData['NSSF'] },
          { name: 'HELB', number: '', isActive: false },
          { name: 'NITA', number: '', isActive: false }
        ];

        setDropdownOptions(prev => ({
          ...prev,
          employmentTypes: [...new Set(empTypes?.map(item => item['Employee Type'] as string))],
          branches: [...new Set(branches?.map(item => item.Branch as string))],
          jobLevels: [...new Set(jobLevels?.map(item => item['Job Level'] as string))],
          jobGroup: [...new Set(jobGroup?.map(item => item['Job Group'] as string))],
          office: [...new Set(office?.map(item => item.Town as string))],
          jobTitles: [...new Set(jobTitles?.map(item => item['Job Title'] as string))],
          supervisors: [...new Set(supervisors?.map(item => item['Leave Approver'] as string))],
        }));

        setEmployee(empData);
        setEmergencyContacts(contacts?.map(c => ({
          name: c.full_name,
          relationship: c.relationship,
          phone: c.phone_number,
          email: c.email || undefined
        })) || [{ name: '', relationship: '', phone: '' }]);

        setDependents(deps?.map(d => ({
          name: d.full_name,
          relationship: d.relationship,
          dateOfBirth: d.date_birth || undefined
        })) || [{ name: '', relationship: '' }]);

        setStatutoryDeductions(deductions?.length ? deductions.map(d => ({
          name: d.type,
          number: d.number,
          isActive: d.is_active
        })) : defaultDeductions);

        if (empData['Profile Image']) {
          setPreviewImage(empData['Profile Image']);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, value: string) => {
    setEmployee(prev => ({
      ...prev,
      [name]: value || null
    }));
  };

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value
    };
    setEmergencyContacts(updatedContacts);
  };

  const handleDependentChange = (index: number, field: keyof Dependent, value: string) => {
    const updatedDependents = [...dependents];
    updatedDependents[index] = {
      ...updatedDependents[index],
      [field]: value
    };
    setDependents(updatedDependents);
  };

  const handleStatutoryDeductionChange = (index: number, field: keyof StatutoryDeduction, value: string | boolean) => {
    const updatedDeductions = [...statutoryDeductions];
    updatedDeductions[index] = {
      ...updatedDeductions[index],
      [field]: value
    };
    setStatutoryDeductions(updatedDeductions);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '' }]);
  };

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      const updatedContacts = [...emergencyContacts];
      updatedContacts.splice(index, 1);
      setEmergencyContacts(updatedContacts);
    }
  };

  const addDependent = () => {
    setDependents([...dependents, { name: '', relationship: '' }]);
  };

  const removeDependent = (index: number) => {
    if (dependents.length > 1) {
      const updatedDependents = [...dependents];
      updatedDependents.splice(index, 1);
      setDependents(updatedDependents);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!employee['First Name'] || !employee['Last Name']) {
        throw new Error('First Name and Last Name are required');
      }

      let imageUrl = employee['Profile Image'] || null;
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${employee['Employee Number']}.${fileExt}`;
        const filePath = `profile_images/${fileName}`;

        // First delete existing image if it exists
        if (employee['Profile Image']) {
          const { error: deleteError } = await supabase.storage
            .from('employeeavatar')
            .remove([filePath]);
          
          if (deleteError && deleteError.message !== 'Object not found') {
            throw deleteError;
          }
        }

        // Upload new image
        const { error: uploadError } = await supabase.storage
          .from('employeeavatar')
          .upload(filePath, profileImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('employeeavatar')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Update employee data
      const { error: employeeError } = await supabase
        .from('employees')
        .update({
          ...employee,
          'Profile Image': imageUrl,
          'Tax PIN': statutoryDeductions.find(d => d.name === 'KRA PIN')?.number || null,
          'NHIF': statutoryDeductions.find(d => d.name === 'NHIF')?.number || null,
          'NSSF': statutoryDeductions.find(d => d.name === 'NSSF')?.number || null
        })
        .eq('"Employee Number"', id);
      
      if (employeeError) throw employeeError;
      
      // Update emergency contacts
      // First delete all existing contacts
      const { error: deleteContactsError } = await supabase
        .from('emergency_contact')
        .delete()
        .eq('Employee Number', id);

      if (deleteContactsError) throw deleteContactsError;

      // Then insert updated contacts if they exist
      if (emergencyContacts.length > 0 && emergencyContacts[0].name) {
        const contactsToInsert = emergencyContacts.map(contact => ({
          "Employee Number": id,
          full_name: contact.name,
          relationship: contact.relationship,
          phone_number: contact.phone,
          email: contact.email || null
        }));

        const { error: contactsError } = await supabase
          .from('emergency_contact')
          .insert(contactsToInsert);

        if (contactsError) throw contactsError;
      }

      // Update dependents
      // First delete all existing dependents
      const { error: deleteDependentsError } = await supabase
        .from('dependents')
        .delete()
        .eq('Employee Number', id);

      if (deleteDependentsError) throw deleteDependentsError;

      // Then insert updated dependents if they exist
      if (dependents.length > 0 && dependents[0].name) {
        const dependentsToInsert = dependents.map(dependent => ({
          "Employee Number": id,
          full_name: dependent.name,
          relationship: dependent.relationship,
          date_birth: dependent.dateOfBirth || null
        }));

        const { error: dependentsError } = await supabase
          .from('dependents')
          .insert(dependentsToInsert);

        if (dependentsError) throw dependentsError;
      }

      // Update statutory deductions
      // First delete all existing deductions
      const { error: deleteDeductionsError } = await supabase
        .from('statutory_deductions')
        .delete()
        .eq('employee_id', id);

      if (deleteDeductionsError) throw deleteDeductionsError;

      // Then insert updated deductions if they exist
      const deductionsToInsert = statutoryDeductions
        .filter(deduction => deduction.isActive && deduction.number)
        .map(deduction => ({
          employee_id: id,
          type: deduction.name,
          number: deduction.number,
          is_active: deduction.isActive
        }));

      if (deductionsToInsert.length > 0) {
        const { error: deductionsError } = await supabase
          .from('statutory_deductions')
          .insert(deductionsToInsert);

        if (deductionsError) throw deductionsError;
      }
      
      navigate(`/employees/view/${id}`, { state: { success: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 max-w-6xl mx-auto flex justify-center items-center min-h-[60vh] text-sm"
      >
        <div className="text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-50 to-green-200 rounded-full mb-6"></div>
            <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-64 mb-4"></div>
            <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-48"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 max-w-6xl mx-auto flex justify-center items-center min-h-[60vh] text-sm"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Employee</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <GlowButton
            onClick={() => navigate('/employees')}
            icon={ArrowLeft}
            className="w-full max-w-xs mx-auto text-sm"
          >
            Back to Employee List
          </GlowButton>
        </div>
      </motion.div>
    );
  }

  if (!employee || !employee['Employee Number']) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 max-w-6xl mx-auto flex justify-center items-center min-h-[60vh] text-sm"
      >
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-yellow-100">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-6">The requested employee could not be found.</p>
          <GlowButton
            onClick={() => navigate('/employees')}
            icon={ArrowLeft}
            className="w-full max-w-xs mx-auto text-sm"
          >
            Back to Employee List
          </GlowButton>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-6xl mx-auto text-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/employees`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group text-sm"
        >
          <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="ml-2 font-medium hidden sm:inline">Back to View</span>
        </button>
        
        <div className="flex space-x-2">
          <GlowButton 
            onClick={handleSave}
            icon={Save}
            loading={saving}
            className="bg-green-200 hover:green-100  text-black"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </GlowButton>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 md:p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-100 to-emerald-200 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-emerald-800">
                  {employee['First Name']?.[0]}{employee['Last Name']?.[0]}
                </div>
                {previewImage && (
                  <img 
                    src={previewImage} 
                    alt="Profile" 
                    className="absolute inset-0 w-16 h-16 rounded-full object-cover"
                  />
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Edit: {employee['First Name']} {employee['Last Name']}
                </h1>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Employee ID:</span> {employee['Employee Number']}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium mt-4 md:mt-0 ${
              employee['Termination Date'] 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {employee['Termination Date'] ? 'Inactive' : 'Active'}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'personal' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User className="w-4 h-4 mr-2" />
              Personal
            </button>
            <button
              onClick={() => setActiveTab('employment')}
              className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'employment' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Employment
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'contact' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'financial' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Financial
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'emergency' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Emergency
            </button>
            <button
              onClick={() => setActiveTab('dependents')}
              className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'dependents' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users className="w-4 h-4 mr-2" />
              Dependents
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-8">
              {/* Profile Image Section */}
              <div>
                <SectionHeader 
                  title="Profile Image" 
                  icon={User} 
                />
                <div className="mt-4 flex flex-col md:flex-row items-start gap-8">
                  {/* Photo Upload Card */}
                  <div className="w-full md:w-auto">
                    <div className="relative group">
                      <div 
                        className="relative w-40 h-40 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border-2 border-gray-200 shadow-sm cursor-pointer transition-all duration-300 hover:border-emerald-300 hover:shadow-md"
                        onClick={triggerFileInput}
                      >
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="relative">
                              <div className="bg-gradient-to-br from-green-100 to-emerald-200 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-emerald-800">
                                {employee['First Name']?.[0]}{employee['Last Name']?.[0]}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-1" />
                            <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-2">
                              {previewImage ? 'Change Photo' : 'Upload Photo'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={triggerFileInput}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Upload className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{previewImage ? 'Change' : 'Upload'}</span>
                      </button>
                      {previewImage && (
                        <button 
                          onClick={() => {
                            setPreviewImage(null);
                            setProfileImage(null);
                          }}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm text-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">JPG, PNG or GIF (Max 5MB)</p>
                    {error && error.includes('File size') && (
                      <p className="mt-1 text-xs text-red-500">{error}</p>
                    )}
                  </div>

                  {/* Employee Number and Basic Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Employee Number"
                      name="Employee Number"
                      value={employee['Employee Number'] || ''}
                      onChange={handleInputChange}
                      disabled
                    />
                    <FormField
                      label="First Name *"
                      name="First Name"
                      value={employee['First Name'] || ''}
                      onChange={handleInputChange}
                      required
                    />
                    <FormField
                      label="Middle Name"
                      name="Middle Name"
                      value={employee['Middle Name'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Last Name *"
                      name="Last Name"
                      value={employee['Last Name'] || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SectionHeader 
                    title="Personal Information" 
                    icon={User} 
                  />
                  <div className="grid grid-cols-1 gap-6 mt-4">
                    <FormField
                      label="Date of Birth"
                      name="Date of Birth"
                      type="date"
                      value={employee['Date of Birth'] || ''}
                      onChange={(e) => handleDateChange('Date of Birth', e.target.value)}
                    />
                    <FormField
                      label="Gender"
                      name="Gender"
                      type="select"
                      value={employee.Gender || ''}
                      onChange={handleInputChange}
                      options={dropdownOptions.genders}
                    />
                    <FormField
                      label="National ID"
                      name="ID Number"
                      type="number"
                      value={employee['ID Number'] ? String(employee['ID Number']) : ''}
                      onChange={(e) => {
                        const numValue = e.target.value ? parseInt(e.target.value) : null;
                        setEmployee(prev => ({
                          ...prev,
                          "ID Number": numValue
                        }));
                      }}
                    />
                    <FormField
                      label="Passport Number"
                      name="passport_number"
                      value={employee.passport_number || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <SectionHeader 
                    title="Additional Details" 
                    icon={User} 
                  />
                  <div className="grid grid-cols-1 gap-6 mt-4">
                    <FormField
                      label="Marital Status"
                      name="Marital Status"
                      type="select"
                      value={employee['Marital Status'] || ''}
                      onChange={handleInputChange}
                      options={['Single', 'Married', 'Divorced', 'Widowed']}
                    />
                    <FormField
                      label="Blood Group"
                      name="blood_group"
                      type="select"
                      value={employee.blood_group || ''}
                      onChange={handleInputChange}
                      options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                    />
                    <FormField
                      label="Disability Status"
                      name="Disability Cert No"
                      type="select"
                      value={employee['Disability Cert No'] || ''}
                      onChange={handleInputChange}
                      options={['None', 'Physical', 'Visual', 'Hearing', 'Other']}
                    />
                    <FormField
                      label="Religion"
                      name="religion"
                      value={employee.religion || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Nationality"
                      name="Country"
                      value={employee.Country || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employment Information Tab */}
          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 gap-6">
              <SectionHeader 
                title="Employment Information" 
                icon={Briefcase} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  label="Employee Type"
                  name="Employee Type"
                  type="select"
                  value={employee['Employee Type'] || ''}
                  onChange={handleInputChange}
                  options={dropdownOptions.employmentTypes}
                />
                <FormField
                  label="Employment Start Date"
                  name="Start Date"
                  type="date"
                  value={employee['Start Date'] || ''}
                  onChange={(e) => handleDateChange('Start Date', e.target.value)}
                />
                <FormField
                  label="Department"
                  name="Job Level"
                  type="select"
                  value={employee['Job Level'] || ''}
                  onChange={handleInputChange}
                  options={dropdownOptions.jobLevels}
                />
                <FormField
                  label="Job Title"
                  name="Job Title"
                  type="select"
                  value={employee['Job Title'] || ''}
                  onChange={handleInputChange}
                  options={dropdownOptions.jobTitles}
                />
                <FormField
                  label="Branch"
                  name="Branch"
                  type="select"
                  value={employee.Branch || ''}
                  onChange={handleInputChange}
                  options={dropdownOptions.branches}
                />
                <FormField
                  label="Office"
                  name="Town"
                  type="select"
                  value={employee.Town || ''}
                  onChange={handleInputChange}
                  options={dropdownOptions.office}
                />
                <FormField
                  label="Manager"
                  name="Manager"
                  type="select"
                  value={employee['Manager'] || ''}
                  onChange={handleInputChange}
                  options={dropdownOptions.supervisors}
                />
                <FormField
                  label="Work Email"
                  name="Work Email"
                  type="email"
                  value={employee['Work Email'] || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <SectionHeader 
                    title="Leave Approvers" 
                    icon={User} 
                  />
                  <div className="grid grid-cols-1 gap-6 mt-4">
                    <FormField
                      label="Leave Approver"
                      name="Leave Approver"
                      type="select"
                      value={employee['Leave Approver'] || ''}
                      onChange={handleInputChange}
                      options={dropdownOptions.supervisors}
                    />
                    <FormField
                      label="Alternate Leave Approver"
                      name="Alternate Approver"
                      type="select"
                      value={employee['Alternate Approver'] || ''}
                      onChange={handleInputChange}
                      options={dropdownOptions.supervisors}
                    />
                    <FormField
                      label="Second Level Leave Approver"
                      name="second_level_leave_approver"
                      type="select"
                      value={employee['second_level_leave_approver'] || ''}
                      onChange={handleInputChange}
                      options={dropdownOptions.supervisors}
                    />
                    <FormField
                      label="Alternate Second Level Leave Approver"
                      name="alternate_second_level_approver"
                      type="select"
                      value={employee['alternate_second_level_approver'] || ''}
                      onChange={handleInputChange}
                      options={dropdownOptions.supervisors}
                    />
                    <FormField
                      label="Internship Start Date"
                      name="internship_start_date"
                      type="date"
                      value={employee['internship_start_date'] || ''}
                      onChange={(e) => handleDateChange('internship_start_date', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <SectionHeader 
                    title="Contract Dates" 
                    icon={Briefcase} 
                  />
                  <div className="grid grid-cols-1 gap-6 mt-4">
                    <FormField
                      label="Internship End Date"
                      name="Internship End Date"
                      type="date"
                      value={employee['Internship End Date'] || ''}
                      onChange={(e) => handleDateChange('Internship End Date', e.target.value)}
                    />
                    <FormField
                      label="Probation Start Date"
                      name="Probation Start Date"
                      type="date"
                      value={employee['Probation Start Date'] || ''}
                      onChange={(e) => handleDateChange('Probation Start Date', e.target.value)}
                    />
                    <FormField
                      label="Probation End Date"
                      name="Probation End Date"
                      type="date"
                      value={employee['Probation End Date'] || ''}
                      onChange={(e) => handleDateChange('Probation End Date', e.target.value)}
                    />
                    <FormField
                      label="Contract Start Date"
                      name="Contract Start Date"
                      type="date"
                      value={employee['Contract Start Date'] || ''}
                      onChange={(e) => handleDateChange('Contract Start Date', e.target.value)}
                    />
                    <FormField
                      label="Contract End Date"
                      name="Contract End Date"
                      type="date"
                      value={employee['Contract End Date'] || ''}
                      onChange={(e) => handleDateChange('Contract End Date', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SectionHeader 
                  title="Contact Information" 
                  icon={Phone} 
                />
                <div className="grid grid-cols-1 gap-6 mt-4">
                  <FormField
                    label="Personal Email"
                    name="Personal Email"
                    type="email"
                    value={employee['Personal Email'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Mobile Number"
                    name="Mobile Number"
                    type="tel"
                    value={employee['Mobile Number'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Alternative Mobile"
                    name="Alternative Mobile Number"
                    type="tel"
                    value={employee['Alternative Mobile Number'] || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <SectionHeader 
                  title="Address Information" 
                  icon={MapPin} 
                />
                <div className="grid grid-cols-1 gap-6 mt-4">
                  <FormField
                    label="Physical Address"
                    name="Area"
                    value={employee.Area || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="City/Town"
                    name="City"
                    value={employee.City || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Postal Code"
                    name="Postal Code"
                    value={employee['Postal Code'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Country"
                    name="Country"
                    value={employee.Country || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial Information Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-8">
              <div>
                <SectionHeader 
                  title="Banking Information" 
                  icon={CreditCard} 
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <FormField
                    label="Bank"
                    name="Bank"
                    value={employee['Bank'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Account Number"
                    name="Account Number"
                    value={employee['Account Number'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Account Name"
                    name="account_number_name"
                    value={employee.account_number_name || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Branch Name"
                    name="Bank Branch"
                    value={employee['Bank Branch'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Payment Method"
                    name="payment_method"
                    type="select"
                    value={employee['payment_method'] || ''}
                    onChange={handleInputChange}
                    options={['Bank Transfer', 'Cash', 'MPESA']}
                  />
                </div>
              </div>

              <div>
                <SectionHeader 
                  title="Salary Information" 
                  icon={CreditCard} 
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <FormField
                    label="Job Group"
                    name="Job Group"
                    type="select"
                    value={employee['Job Group'] || ''}
                    onChange={handleInputChange}
                    options={dropdownOptions.jobGroup}
                  />
                  <FormField
                    label="Basic Salary"
                    name="Basic Salary"
                    type="number"
                    value={employee['Basic Salary'] ? String(employee['Basic Salary']) : ''}
                    onChange={(e) => {
                      const numValue = e.target.value ? parseFloat(e.target.value) : null;
                      setEmployee(prev => ({
                        ...prev,
                        "Basic Salary": numValue
                      }));
                    }}
                  />
                  <FormField
                    label="Currency"
                    name="Currency"
                    type="select"
                    value={employee['Currency'] || 'KES'}
                    onChange={handleInputChange}
                    options={['KES', 'USD', 'EUR', 'GBP']}
                  />
                </div>
              </div>

              <div>
                <SectionHeader 
                  title="Statutory Deductions" 
                  icon={CreditCard} 
                />
                <div className="grid grid-cols-1 gap-6 mt-4">
                  {statutoryDeductions.map((deduction, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`w-6 h-6 rounded flex items-center justify-center border ${deduction.isActive ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}
                          onClick={() => handleStatutoryDeductionChange(index, 'isActive', !deduction.isActive)}
                        >
                          {deduction.isActive && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <span className="ml-2 font-medium min-w-[100px]">{deduction.name}</span>
                      </div>
                      {deduction.isActive && (
                        <input
                          type="text"
                          value={deduction.number}
                          onChange={(e) => handleStatutoryDeductionChange(index, 'number', e.target.value)}
                          className="flex-1 h-11 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                          placeholder={`Enter ${deduction.name}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'emergency' && (
            <div>
              <SectionHeader 
                title="Emergency Contacts" 
                icon={AlertCircle} 
              />
              <p className="text-gray-600 mb-6">Add at least one emergency contact for this employee</p>
              
              <div className="space-y-6">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-700">Contact #{index + 1}</h3>
                      {emergencyContacts.length > 1 && (
                        <button
                          onClick={() => removeEmergencyContact(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Full Name"
                        value={contact.name}
                        onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                      />
                      <FormField
                        label="Relationship"
                        value={contact.relationship}
                        onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                      />
                      <FormField
                        label="Phone Number"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                      />
                      <FormField
                        label="Email (Optional)"
                        type="email"
                        value={contact.email || ''}
                        onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addEmergencyContact}
                className="mt-4 flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another Emergency Contact
              </button>
            </div>
          )}

          {/* Dependents Tab */}
          {activeTab === 'dependents' && (
            <div>
              <SectionHeader 
                title="Dependents" 
                icon={Users} 
              />
              <p className="text-gray-600 mb-6">Add dependents for this employee (spouse, children, etc.)</p>
              
              <div className="space-y-6">
                {dependents.map((dependent, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-700">Dependent #{index + 1}</h3>
                      {dependents.length > 1 && (
                        <button
                          onClick={() => removeDependent(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Full Name"
                        value={dependent.name}
                        onChange={(e) => handleDependentChange(index, 'name', e.target.value)}
                      />
                      <FormField
                        label="Relationship"
                        value={dependent.relationship}
                        onChange={(e) => handleDependentChange(index, 'relationship', e.target.value)}
                      />
                      <FormField
                        label="Date of Birth (Optional)"
                        type="date"
                        value={dependent.dateOfBirth || ''}
                        onChange={(e) => handleDependentChange(index, 'dateOfBirth', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={addDependent}
                className="mt-4 flex items-center text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another Dependent
              </button>
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
          <GlowButton 
            variant="secondary" 
            onClick={() => navigate(`/employees/view/${id}`)}
            disabled={saving}
          >
            Cancel
          </GlowButton>
          <GlowButton 
            onClick={handleSave}
            icon={Save}
            loading={saving}
            className="bg-green-200 hover:green-100  text-black"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </GlowButton>
        </div>
      </div>
    </motion.div>
  );
};

// Reusable Section Header Component
const SectionHeader = ({ title, icon: Icon }: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-center mb-2">
    <div className="p-1.5 mr-2 rounded-full bg-gray-100">
      <Icon className="w-5 h-5 text-gray-500" />
    </div>
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
  </div>
);

// Reusable Form Field Component
const FormField = ({
  label,
  value,
  onChange,
  name,
  type = 'text',
  required = false,
  options = [],
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  name?: string;
  type?: string;
  required?: boolean;
  options?: string[];
  disabled?: boolean;
}) => (
  <div className="space-y-1">
    <label className="block font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full h-11 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full h-11 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      />
    )}
  </div>
);

export default EditEmployeePage;