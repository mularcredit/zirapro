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
    // Here you would typically send the schedule data to your API
    console.log('Scheduling interview for:', selectedApplicationForSchedule.id, scheduleData);
    // Close the modal after submission
    setShowScheduleModal(false);
    // You might want to update the application status here as well
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Job Applications</h2>
              <p className="text-gray-600 text-sm">{applications.length} applications found</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <GlowButton variant="secondary" icon={Download} size="sm">Export</GlowButton>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Applicant</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Position</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Department</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Resume</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date Applied</th>
                <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-gray-900 font-semibold">
                        {application.first_name} {application.last_name}
                      </p>
                      <p className="text-gray-500 text-xs">{application.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">{application.position || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">{application.preferred_location || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">{application.department || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4">
                    {application.resume_file_url && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => window.open(application.resume_file_url, '_blank')}
                          className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={application.status || 'New'} />
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-1">
                      <GlowButton 
                        variant="secondary" 
                        icon={Edit} 
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        Review
                      </GlowButton>
                      <GlowButton 
                        variant="secondary" 
                        icon={Briefcase} 
                        size="sm"
                        onClick={() => handleOpenScheduleModal(application)}
                      >
                        Schedule
                      </GlowButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedApplicationForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule Interview
                </h3>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="font-medium text-gray-900">
                  {selectedApplicationForSchedule.first_name} {selectedApplicationForSchedule.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedApplicationForSchedule.position}
                </p>
              </div>

              <form onSubmit={handleScheduleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#47d475] focus:border-[#47d475]"
                      placeholder="Any special instructions or agenda items"
                      value={scheduleData.notes}
                      onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#47d475]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#47d475] hover:bg-[#58cc8b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#47d475]"
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