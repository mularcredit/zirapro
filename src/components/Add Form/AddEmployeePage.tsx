import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { X, Plus, ArrowLeft, SendToBackIcon, User, Briefcase, Phone, CreditCard, MapPin, Upload, AlertCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlowButton from '../UI/GlowButton';

type Employee = Database['public']['Tables']['employees']['Row'];

type DropdownOptions = {
  employmentTypes: string[];
  branches: string[];
  departments: string[];
  jobLevels: string[];
  categories: string[];
  supervisors: string[];
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

const AddEmployeePage = () => {
  const navigate = useNavigate();
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>({
    employmentTypes: [],
    branches: [],
    departments: [],
    jobLevels: [],
    categories: [],
    supervisors: []
  });
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([{ name: '', relationship: '', phone: '' }]);
  const [dependents, setDependents] = useState<Dependent[]>([{ name: '', relationship: '' }]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setFetchingOptions(true);
        const { data: empTypes } = await supabase
          .from('employees')
          .select('"Employee Type"')
          .not('"Employee Type"', 'is', null)
          .order('"Employee Type"', { ascending: true });

        const { data: branches } = await supabase
          .from('employees')
          .select('"Branch"')
          .not('"Branch"', 'is', null)
          .order('"Branch"', { ascending: true });

        const { data: departments } = await supabase
          .from('departments')
          .select('name')
          .order('name', { ascending: true });

        const { data: jobLevels } = await supabase
          .from('job_levels')
          .select('name')
          .order('name', { ascending: true });

        const { data: categories } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });

        const { data: supervisors } = await supabase
          .from('employees')
          .select('"First Name", "Last Name"')
          .order('"First Name"', { ascending: true });

        setDropdownOptions({
          employmentTypes: [...new Set(empTypes?.map(item => item['Employee Type'] as string))],
          branches: [...new Set(branches?.map(item => item.Branch as string))],
          departments: departments?.map(item => item.name as string) || [],
          jobLevels: jobLevels?.map(item => item.name as string) || [],
          categories: categories?.map(item => item.name as string) || [],
          supervisors: supervisors?.map(item => `${item['First Name']} ${item['Last Name']}`) || []
        });
      } catch (err) {
        console.error('Error fetching dropdown options:', err);
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchDropdownOptions();
  }, []);

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
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
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

  const handleAddEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!newEmployee['First Name'] || !newEmployee['Last Name']) {
        throw new Error('First Name and Last Name are required');
      }

      // Upload profile image if exists
      let imageUrl = null;
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${newEmployee['Employee Number'] || `EMP-${Date.now().toString().slice(-6)}`}.${fileExt}`;
        const filePath = `profile_images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-photos')
          .upload(filePath, profileImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('employee-photos')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('employees')
        .insert([{
          ...newEmployee,
          'Employee Number': newEmployee['Employee Number'] || `EMP-${Date.now().toString().slice(-6)}`,
          'Profile Image': imageUrl,
          'Emergency Contacts': emergencyContacts,
          'Dependents': dependents
        }]);
      
      if (error) throw error;
      
      navigate('/employees', { state: { success: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingOptions) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 max-w-6xl mx-auto text-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/employees')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </div>
          <span className="ml-2 font-medium hidden sm:inline">Back to Employees</span>
        </button>
      </div>

      <motion.div
        ref={formRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Form Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="mr-4">
              <img 
                src="https://i.ibb.co/j9CqXyt6/avatar.png" 
                alt="avatar" 
                className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Add New Employee</h1>
              <p className="text-gray-600 mt-1">Fill in the details below to add a new employee</p>
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

        <div className="p-6 md:p-8">
          {/* Modern Profile Image Section - Only shown on personal tab */}
          {activeTab === 'personal' && (
            <div className="mb-8">
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
                            <img 
                              src="https://i.ibb.co/My2ydmL9/avat.png" 
                              alt="Default avatar" 
                              className="w-50 h-50 opacity-70"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-20 rounded-full" />
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
                    label="Employee Number (Autogenerated)"
                    name="Employee Number"
                    value={newEmployee['Employee Number'] || `EMP-${Date.now().toString().slice(-6)}`}
                    onChange={handleInputChange}
                    disabled
                  />
                  <FormField
                    label="First Name"
                    name="First Name"
                    value={newEmployee['First Name'] || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <FormField
                    label="Middle Name"
                    name="Middle Name"
                    value={newEmployee['Middle Name'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Last Name"
                    name="Last Name"
                    value={newEmployee['Last Name'] || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
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
                      value={newEmployee['Date of Birth'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Gender"
                      name="Gender"
                      type="select"
                      value={newEmployee['Gender'] || ''}
                      onChange={handleInputChange}
                      options={['Male', 'Female', 'Other']}
                    />
                    <FormField
                      label="National ID"
                      name="National ID"
                      value={newEmployee['National ID'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Passport Number"
                      name="Passport Number"
                      value={newEmployee['Passport Number'] || ''}
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
                      value={newEmployee['Marital Status'] || ''}
                      onChange={handleInputChange}
                      options={['Single', 'Married', 'Divorced', 'Widowed']}
                    />
                    <FormField
                      label="Blood Group"
                      name="Blood Group"
                      type="select"
                      value={newEmployee['Blood Group'] || ''}
                      onChange={handleInputChange}
                      options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                    />
                    <FormField
                      label="Disability Status"
                      name="Disability Status"
                      type="select"
                      value={newEmployee['Disability Status'] || ''}
                      onChange={handleInputChange}
                      options={['None', 'Physical', 'Visual', 'Hearing', 'Other']}
                    />
                    <FormField
                      label="Religion"
                      name="Religion"
                      value={newEmployee['Religion'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Nationality"
                      name="Nationality"
                      value={newEmployee['Nationality'] || ''}
                      onChange={handleInputChange}
                    />
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
                    value={newEmployee['Employee Type'] || ''}
                    onChange={handleInputChange}
                    options={dropdownOptions.employmentTypes}
                    required
                  />
                  <FormField
                    label="Employment Start Date"
                    name="Start Date"
                    type="date"
                    value={newEmployee['Start Date'] || ''}
                    onChange={handleInputChange}
                    required
                  />
                  <FormField
                    label="Job Level"
                    name="Job Level"
                    type="select"
                    value={newEmployee['Job Level'] || ''}
                    onChange={handleInputChange}
                    options={dropdownOptions.jobLevels}
                  />
                  <FormField
                    label="Job Title"
                    name="Job Title"
                    value={newEmployee['Job Title'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Job Description"
                    name="Job Description"
                    value={newEmployee['Job Description'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Category"
                    name="Category"
                    type="select"
                    value={newEmployee['Category'] || ''}
                    onChange={handleInputChange}
                    options={dropdownOptions.categories}
                  />
                  <FormField
                    label="Direct Supervisor"
                    name="Direct Supervisor"
                    type="select"
                    value={newEmployee['Direct Supervisor'] || ''}
                    onChange={handleInputChange}
                    options={dropdownOptions.supervisors}
                    required
                  />
                  <FormField
                    label="Office"
                    name="Office"
                    value={newEmployee['Office'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Department"
                    name="Department"
                    type="select"
                    value={newEmployee['Department'] || ''}
                    onChange={handleInputChange}
                    options={dropdownOptions.departments}
                    required
                  />
                  <FormField
                    label="Department Unit"
                    name="Department Unit"
                    value={newEmployee['Department Unit'] || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Work Email"
                    name="Work Email"
                    type="email"
                    value={newEmployee['Work Email'] || ''}
                    onChange={handleInputChange}
                    required
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
                        value={newEmployee['Leave Approver'] || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.supervisors}
                      />
                      <FormField
                        label="Alternate Leave Approver"
                        name="Alternate Leave Approver"
                        type="select"
                        value={newEmployee['Alternate Leave Approver'] || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.supervisors}
                      />
                      <FormField
                        label="Second Level Leave Approver"
                        name="Second Level Leave Approver"
                        type="select"
                        value={newEmployee['Second Level Leave Approver'] || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.supervisors}
                      />
                      <FormField
                        label="Alternate Second Level Leave Approver"
                        name="Alternate Second Level Leave Approver"
                        type="select"
                        value={newEmployee['Alternate Second Level Leave Approver'] || ''}
                        onChange={handleInputChange}
                        options={dropdownOptions.supervisors}
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
                        value={newEmployee['Internship End Date'] || ''}
                        onChange={handleInputChange}
                      />
                      <FormField
                        label="Probation Start Date"
                        name="Probation Start Date"
                        type="date"
                        value={newEmployee['Probation Start Date'] || ''}
                        onChange={handleInputChange}
                      />
                      <FormField
                        label="Probation End Date"
                        name="Probation End Date"
                        type="date"
                        value={newEmployee['Probation End Date'] || ''}
                        onChange={handleInputChange}
                      />
                      <FormField
                        label="Contract Start Date"
                        name="Contract Start Date"
                        type="date"
                        value={newEmployee['Contract Start Date'] || ''}
                        onChange={handleInputChange}
                      />
                      <FormField
                        label="Contract End Date"
                        name="Contract End Date"
                        type="date"
                        value={newEmployee['Contract End Date'] || ''}
                        onChange={handleInputChange}
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
                      value={newEmployee['Personal Email'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Mobile Number"
                      name="Mobile Number"
                      type="tel"
                      value={newEmployee['Mobile Number'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Alternative Mobile"
                      name="Alternative Mobile Number"
                      type="tel"
                      value={newEmployee['Alternative Mobile Number'] || ''}
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
                      value={newEmployee.Area || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="City/Town"
                      name="City"
                      value={newEmployee.City || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Postal Code"
                      name="Postal Code"
                      value={newEmployee['Postal Code'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Country"
                      name="Country"
                      value={newEmployee.Country || ''}
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
                      value={newEmployee['Bank'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Account Number"
                      name="Account Number"
                      value={newEmployee['Account Number'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Account Name"
                      name="Account Name"
                      value={newEmployee['Account Name'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Branch Name"
                      name="Branch Name"
                      value={newEmployee['Branch Name'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Payment Method"
                      name="Payment Method"
                      type="select"
                      value={newEmployee['Payment Method'] || ''}
                      onChange={handleInputChange}
                      options={['Bank Transfer', 'Cash', 'Mobile Money']}
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
                      label="Basic Salary"
                      name="Basic Salary"
                      type="number"
                      value={newEmployee['Basic Salary'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Currency"
                      name="Currency"
                      type="select"
                      value={newEmployee['Currency'] || 'KES'}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <FormField
                      label="KRA PIN"
                      name="Tax PIN"
                      value={newEmployee['Tax PIN'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="NHIF Number"
                      name="NHIF"
                      value={newEmployee['NHIF'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="NSSF Number"
                      name="NSSF"
                      value={newEmployee['NSSF'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="AHL Number"
                      name="AHL"
                      value={newEmployee['AHL'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="HELB Number"
                      name="HELB"
                      value={newEmployee['HELB'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="NITA Number"
                      name="NITA"
                      value={newEmployee['NITA'] || ''}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="PAYE Rate"
                      name="PAYE"
                      type="number"
                      value={newEmployee['PAYE'] || ''}
                      onChange={handleInputChange}
                    />
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
              className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
            <GlowButton 
              variant="secondary" 
              onClick={() => navigate('/employees')}
              disabled={loading}
            >
              Cancel
            </GlowButton>
            <GlowButton 
              onClick={handleAddEmployee}
              icon={Plus}
              loading={loading}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
            >
              {loading ? 'Adding Employee...' : 'Add Employee'}
            </GlowButton>
          </div>
        </div>
      </motion.div>
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

export default AddEmployeePage;