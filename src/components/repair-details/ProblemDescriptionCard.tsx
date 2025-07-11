import React, { useState } from 'react';
import { ListChecks, PenLine, Save, X } from 'lucide-react';
import { Repair } from '../../types/repair';
import useToast from '../../toast/useToast';
import ToastContainer from '../../toast/ToastContainer';

interface ProblemDescriptionCardProps {
  repair: Repair;
  onUpdate: (updates: Partial<Repair>) => Promise<void>;
  isLocked: boolean;
}

const ProblemDescriptionCard: React.FC<ProblemDescriptionCardProps> = ({ repair, onUpdate, isLocked }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(repair.problem_description);
  const { toasts, showToast, hideToast } = useToast();


  const handleSave = async () => {
    if (editedDescription.length > 500) {
      showToast({
        type: 'error',
        title: 'Problem Description cannot exceed 500 characters',
        description: `Error updating item: ${editedDescription}`,
      });
      return;
    }

    if (!editedDescription.trim()) {
      showToast({
        type: 'error',
        title: 'Problem Description cannot be empty',
        description: `Error updating item: ${editedDescription}`,
      });
      return;
    }

    await onUpdate({ problem_description: editedDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDescription(repair.problem_description);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Problem Description
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLocked}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus:ring-2 focus:ring-[var(--light-green)] transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
          >
            <PenLine className="h-4 w-4 mr-2" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center focus:ring-2 focus:ring-[var(--light-green)] justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-[var(--orange)] text-white hover:bg-orange-600 h-9 rounded-md px-3"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border hover:bg-gray-100 h-9 rounded-md px-3 hover:text-[var(--red)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {!isEditing ? (
        <p className="text-[var(--light-green-2)] whitespace-pre-wrap truncate">
          {repair.problem_description}
        </p>
      ) : (
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border focus:outline-none border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent"
        />
      )}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
};

export default ProblemDescriptionCard;