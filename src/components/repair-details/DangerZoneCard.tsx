import React from 'react';
import { CircleAlert, Trash2 } from 'lucide-react';
import { Repair } from '../../types/repair';

interface DangerZoneCardProps {
  repair: Repair;
  onDelete?: () => void;
}

const DangerZoneCard: React.FC<DangerZoneCardProps> = ({ repair, onDelete }) => {
  return (
    <div className="rounded-lg border text-[var(--light-gray)] shadow-lg border-[var(--red)]">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="font-semibold tracking-tight text-xl font-headline text-[var(--red)] flex items-center gap-2">
          <CircleAlert className="h-5 w-5" />
          Danger Zone
        </div>
        <div className="text-sm text-[var(--light-green-2)]">
          Actions in this section are permanent and cannot be undone.
        </div>
      </div>
      <div className="p-6 pt-0">
        <button 
          onClick={onDelete}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md focus:ring-2 focus:ring-[var(--light-green)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring  disabled:pointer-events-none disabled:opacity-50 bg-[var(--red)] text-white hover:bg-red-600/90 h-10 px-4 py-2 w-full sm:w-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete This Repair
        </button>
        <p className="text-xs text-[var(--light-green-2)] mt-2">
          Warning: Deleting a repair with status "{repair.status}" is permanent. Ensure this is intended.
        </p>
      </div>
    </div>
  );
};

export default DangerZoneCard;