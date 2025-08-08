import { BranchCard } from './BranchCard';
import { jobPositions } from '../constants/jobPositions';
import { branches } from '../constants/branches';
import { StatusBadge } from '../StatusBadge';
import GlowButton from '../../../UI/GlowButton';
import { Briefcase } from 'lucide-react';

export const BranchesSection = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Hiring Needs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <BranchCard 
              key={branch.id} 
              branch={branch} 
              positions={jobPositions.filter((p) => p.branch === branch.id)} 
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Hiring Status</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Location</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Hiring Status</th>
                <th className="text-right py-3 px-4 text-gray-700 font-semibold">Total Positions</th>
                <th className="text-right py-3 px-4 text-gray-700 font-semibold">Critically Needed</th>
                <th className="text-right py-3 px-4 text-gray-700 font-semibold">Urgent</th>
                <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => {
                const branchPositions = jobPositions.filter(p => p.branch === branch.id);
                const criticalPositions = branchPositions.filter(p => p.status === 'Critically Needed').length;
                const urgentPositions = branchPositions.filter(p => p.status === 'Urgent').length;
                
                return (
                  <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="text-gray-900 font-semibold">{branch.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-700">{branch.location}</p>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={branch.hiringStatus} />
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      {branchPositions.length}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-red-600">
                      {criticalPositions}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-orange-600">
                      {urgentPositions}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center gap-1">
                        <GlowButton variant="secondary" icon={Briefcase} size="sm">Positions</GlowButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};