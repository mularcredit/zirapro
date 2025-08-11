import { useState } from 'react';
import { Eye, Download, Edit, Briefcase, X } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { StatusBadge } from './StatusBadge';

interface ApplicationsTableProps {
  applications: any[];
  setSelectedApplication: (app: any) => void;
}

export const ApplicationsTable = ({ applications, setSelectedApplication }: ApplicationsTableProps) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicationForSchedule, setSelectedApplicationForSchedule] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    duration: '30',
    interviewType: 'virtual',
    location: '',
    meetingLink: '',
    notes: ''
  });

  const getResumeFileName = (application: any) => {
    if (application.resume_file_name) {
      return application.resume_file_name;
    }
    if (application.resume_file_url) {
      const urlParts = application.resume_file_url.split('/');
      return urlParts[urlParts.length - 1];
    }
    return 'resume.pdf';
  };

  const handleOpenScheduleModal = (application: any) => {
    setSelectedApplicationForSchedule(application);
    setScheduleData({
      date: '',
      time: '',
      duration: '30',
      interviewType: 'virtual',
      location: '',
      meetingLink: '',
      notes: ''
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Scheduling interview for:', selectedApplicationForSchedule.id, scheduleData);
    setShowScheduleModal(false);
  };

  return (
    <>
      {/* Main Table Container - Responsive height based on screen size */}
      <div className="flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)] xl:h-fit xl:max-h-[85vh] bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Job Applications</h2>
              <p className="text-gray-600 text-xs sm:text-sm">{applications.length} applications found</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <GlowButton variant="secondary" icon={Download} size="sm">Export</GlowButton>
            </div>
          </div>
        </div>
        
        {/* Table Container - Scrollable */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-xs sm:text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[120px] sm:min-w-[160px]">
                  Applicant
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[100px] sm:min-w-[120px]">
                  Position
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[80px] sm:min-w-[100px]">
                  Branch
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[80px] sm:min-w-[100px]">
                  Department
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[70px] sm:min-w-[80px]">
                  Resume
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[70px] sm:min-w-[80px]">
                  Status
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[80px] sm:min-w-[100px]">
                  Date Applied
                </th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-semibold min-w-[120px] sm:min-w-[140px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application, index) => (
                <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="space-y-1">
                      <p className="text-gray-900 font-semibold text-xs sm:text-sm truncate">
                        {application.first_name} {application.last_name}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{application.email}</p>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <p className="text-gray-700 text-xs sm:text-sm truncate" title={application.position || 'N/A'}>
                      {application.position || 'N/A'}
                    </p>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <p className="text-gray-700 text-xs sm:text-sm truncate" title={application.preferred_location || 'N/A'}>
                      {application.preferred_location || 'N/A'}
                    </p>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <p className="text-gray-700 text-xs sm:text-sm truncate" title={application.department || 'N/A'}>
                      {application.department || 'N/A'}
                    </p>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    {application.resume_file_url && (
                      <div className="flex">
                        <button
                          onClick={() => window.open(application.resume_file_url, '_blank')}
                          className="px-1.5 sm:px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs flex items-center gap-1 whitespace-nowrap"
                          title="View Resume"
                        >
                          <Eye className="w-3 h-3 flex-shrink-0" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <StatusBadge status={application.status || 'New'} />
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <p className="text-gray-700 text-xs sm:text-sm">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="flex justify-center gap-1 flex-col sm:flex-row">
                      <GlowButton 
                        variant="secondary" 
                        icon={Edit} 
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                        className="text-xs whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Review</span>
                        <span className="sm:hidden">Rev</span>
                      </GlowButton>
                      <GlowButton 
                        variant="secondary" 
                        icon={Briefcase} 
                        size="sm"
                        onClick={() => handleOpenScheduleModal(application)}
                        className="text-xs whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">Schedule</span>
                        <span className="sm:hidden">Sch</span>
                      </GlowButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty state for small tables */}
          {applications.length === 0 && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <p className="text-gray-500 text-sm">No applications found</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal - Fully responsive */}
      {showScheduleModal && selectedApplicationForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto my-4 sm:my-0 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule Interview
                </h3>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-500 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 sm:mt-4">
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {selectedApplicationForSchedule.first_name} {selectedApplicationForSchedule.last_name}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {selectedApplicationForSchedule.position}
                </p>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
                      value={scheduleData.time}
                      onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
                    value={scheduleData.duration}
                    onChange={(e) => setScheduleData({...scheduleData, duration: e.target.value})}
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="virtual"
                        name="interviewType"
                        type="radio"
                        className="h-4 w-4 text-[#47d475] focus:ring-[#47d475] border-gray-300"
                        checked={scheduleData.interviewType === 'virtual'}
                        onChange={() => setScheduleData({...scheduleData, interviewType: 'virtual'})}
                      />
                      <label htmlFor="virtual" className="ml-2 block text-sm text-gray-700">
                        Virtual
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="in-person"
                        name="interviewType"
                        type="radio"
                        className="h-4 w-4 text-[#47d475] focus:ring-[#47d475] border-gray-300"
                        checked={scheduleData.interviewType === 'in-person'}
                        onChange={() => setScheduleData({...scheduleData, interviewType: 'in-person'})}
                      />
                      <label htmlFor="in-person" className="ml-2 block text-sm text-gray-700">
                        In-person
                      </label>
                    </div>
                  </div>
                </div>

                {scheduleData.interviewType === 'in-person' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
                      placeholder="Office address or meeting room"
                      value={scheduleData.location}
                      onChange={(e) => setScheduleData({...scheduleData, location: e.target.value})}
                      required={scheduleData.interviewType === 'in-person'}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
                      placeholder="Zoom, Google Meet, etc."
                      value={scheduleData.meetingLink}
                      onChange={(e) => setScheduleData({...scheduleData, meetingLink: e.target.value})}
                      required={scheduleData.interviewType === 'virtual'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475] resize-none"
                    placeholder="Any special instructions or agenda items"
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                  />
                </div>

                {/* Modal Footer - Fixed */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#47d475] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#47d475] hover:bg-[#58cc8b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#47d475] transition-colors"
                  >
                    Schedule Interview
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};