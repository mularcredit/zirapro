import { Download, Edit, Users } from 'lucide-react';
import { GlowButton } from './GlowButton';
import { StatusBadge } from './StatusBadge';
import { branches } from './constants/branches';

interface PositionsTableProps {
  positions: any[];
}

export const PositionsTable = ({ positions }: PositionsTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Open Positions</h2>
            <p className="text-gray-600 text-sm">{positions.length} positions found</p>
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
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Position Title</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Department</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Type</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Branch</th>
              <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
              <th className="text-right py-3 px-4 text-gray-700 font-semibold">Applications</th>
              <th className="text-center py-3 px-4 text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const branch = branches.find(b => b.id === position.branch);
              return (
                <tr key={position.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-gray-900 font-semibold">{position.title}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">{position.department}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">{position.type}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-700">{branch?.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={position.status} />
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">
                    {position.applications}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-1">
                      <GlowButton variant="secondary" icon={Edit} size="sm">Edit</GlowButton>
                      <GlowButton variant="secondary" icon={Users} size="sm">View Apps</GlowButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};