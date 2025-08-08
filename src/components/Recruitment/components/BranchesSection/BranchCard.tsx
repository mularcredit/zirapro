import { StatusBadge } from '../StatusBadge';
import { GlowButton } from '../GlowButton';

interface BranchCardProps {
  branch: any;
  positions: any[];
}

export const BranchCard = ({ branch, positions }: BranchCardProps) => {
  const criticalPositions = positions.filter((p) => p.status === 'Critically Needed').length;
  const urgentPositions = positions.filter((p) => p.status === 'Urgent').length;
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
        <StatusBadge status={branch.hiringStatus} />
      </div>
      <p className="text-gray-600 text-sm mb-3">{branch.location}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Open Positions:</span>
          <span className="font-medium">{positions.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-red-600">Critically Needed:</span>
          <span className="font-medium">{criticalPositions}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-orange-600">Urgent Positions:</span>
          <span className="font-medium">{urgentPositions}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <GlowButton variant="secondary" size="sm">View Positions</GlowButton>
      </div>
    </div>
  );
};