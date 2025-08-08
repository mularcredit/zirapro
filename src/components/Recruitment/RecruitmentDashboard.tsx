import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, Filter } from 'lucide-react';
import { StatusBadge } from './components/StatusBadge';
import { SummaryCard } from './components/SummaryCard';
import { GlowButton } from './components/GlowButton';
import { FiltersSection } from './components/FiltersSection';
import { TabsNavigation } from './components/TabsNavigation';
import { PositionsTable } from './components/PositionsTable';
import { ApplicationsTable } from './components/ApplicationsTable';
import { BranchesSection } from './components/BranchesSection';
import { NewPositionModal } from './components/NewPositionModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { branches } from './components/constants/branches';
import { jobPositions } from './components/constants/jobPositions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RecruitmentDashboard() {
  const [selectedTab, setSelectedTab] = useState('positions');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPositionModal, setShowNewPositionModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*');
      
      if (!error) {
        setApplications(data);
      } else {
        console.error('Error fetching applications:', error);
      }
      setLoading(false);
    };

    fetchApplications();
  }, []);

  const filteredPositions = jobPositions.filter(position => {
    const matchesBranch = selectedBranch === 'all' || position.branch === selectedBranch;
    const matchesDepartment = selectedDepartment === 'All Departments' || position.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'All Statuses' || position.status === selectedStatus;
    const matchesType = selectedType === 'All Types' || position.type === selectedType;
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBranch && matchesDepartment && matchesStatus && matchesType && matchesSearch;
  });

  const filteredApplications = applications.filter(application => {
    const matchesBranch = selectedBranch === 'all' || 
      application.preferred_location?.toLowerCase().includes(selectedBranch.toLowerCase());
    const matchesDepartment = selectedDepartment === 'All Departments' || 
      application.department?.toLowerCase().includes(selectedDepartment.toLowerCase());
    const matchesStatus = selectedStatus === 'All Statuses' || application.status === selectedStatus;
    const matchesSearch = 
      `${application.first_name} ${application.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
      application.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBranch && matchesDepartment && matchesStatus && matchesSearch;
  });

  const statusCounts = {
    'Critically Needed': jobPositions.filter(p => p.status === 'Critically Needed').length,
    'Urgent': jobPositions.filter(p => p.status === 'Urgent').length,
    'Normal': jobPositions.filter(p => p.status === 'Normal').length,
  };

  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen max-w-screen-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Employee Recruitment Portal</h1>
            <p className="text-gray-600 text-sm">Manage open positions, applications, and hiring needs across all branches</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <GlowButton 
              icon={Users} 
              size="sm"
              onClick={() => setShowNewPositionModal(true)}
            >
              Create New Position
            </GlowButton>
            <GlowButton 
              variant="secondary"
              icon={Filter}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </GlowButton>
          </div>
        </div>
      </div>

      {showNewPositionModal && (
        <NewPositionModal onClose={() => setShowNewPositionModal(false)} />
      )}

      {showFilters && (
        <FiltersSection
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      <TabsNavigation 
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        jobPositionsCount={jobPositions.length}
        applicationsCount={applications.length}
        branchesCount={branches.length}
      />

      {selectedTab === 'positions' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard 
            label="Critically Needed Positions" 
            value={statusCounts['Critically Needed']} 
            icon="AlertCircle" 
            color="red"
            isCount={true}
          />
          <SummaryCard 
            label="Urgent Positions" 
            value={statusCounts['Urgent']} 
            icon="Clock" 
            color="orange"
            isCount={true}
          />
          <SummaryCard 
            label="Total Open Positions" 
            value={jobPositions.length} 
            icon="Briefcase" 
            color="blue"
            isCount={true}
          />
        </div>
      )}

      {selectedTab === 'positions' && (
        <PositionsTable positions={filteredPositions} />
      )}

      {selectedTab === 'applications' && (
        <ApplicationsTable 
          applications={filteredApplications} 
          setSelectedApplication={setSelectedApplication} 
        />
      )}

      {selectedTab === 'branches' && (
        <BranchesSection />
      )}

      {selectedApplication && (
        <ApplicationDetailModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)} 
        />
      )}
    </div>
  );
}