import React, { useState } from 'react';
import { User, PenLine, Save, X } from 'lucide-react';
import { Repair } from '../../types/repair';
import useToast from '../../toast/useToast';
import ToastContainer from '../../toast/ToastContainer';

interface CustomerDetailsCardProps {
  repair: Repair;
  onUpdate: (updates: Partial<Repair>) => Promise<void>;
  isLocked: boolean;
}

const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({ repair, onUpdate, isLocked }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    customer_name: repair.customer_name,
    contact: repair.contact || ''
  });
  const { toasts, showToast, hideToast } = useToast();


  const handleSave = async () => {
    // Validate character limits
    if (editedData.customer_name.length > 40) {
      showToast({
        type: 'error',
        title: 'Customer name cannot exceed 40 characters',
        description: `Error updating customer: ${editedData.customer_name}`,
      });
      return;
    }

    if (editedData.contact.length > 50) {
      showToast({
        type: 'error',
        title: 'Contact information cannot exceed 50 characters',
        description: `Error updating customer: ${editedData.contact}`,
      });
      return;
    }

    // Validate required fields
    if (!editedData.customer_name.trim()) {
      showToast({
        type: 'error',
        title: 'Customer name is required',
        description: `Error updating customer: ${editedData.customer_name}`,
      });
      return;
    }

    if (!editedData.contact.trim()) {
      showToast({
        type: 'error',
        title: 'Contact information is required',
        description: `Error updating customer: ${editedData.contact}`,
      });
      return;
    }

    await onUpdate(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({
      customer_name: repair.customer_name,
      contact: repair.contact || ''
    });
    setIsEditing(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 40) {
      showToast({
        type: 'error',
        title: 'Customer name cannot exceed 40 characters',
        description: `Error updating customer: ${value}`,
      });
      return;
    }
    setEditedData({ ...editedData, customer_name: value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 50) {
      showToast({
        type: 'error',
        title: 'Contact information cannot exceed 50 characters',
        description: `Error updating customer: ${value}`,
      });
      return;
    }
    setEditedData({ ...editedData, contact: value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Details
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLocked}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
          >
            <PenLine className="h-4 w-4 mr-2" />
            Edit Customer
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus:ring-2 focus:ring-[var(--light-green)] transition-colors focus-visible:outline-none focus-visible:ring-2   disabled:pointer-events-none disabled:opacity-50 bg-[var(--orange)] text-white hover:bg-orange-600 h-9 rounded-md px-3"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Customer
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center focus:ring-2 focus:ring-[var(--light-green)] justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border hover:bg-gray-100 h-9 rounded-md px-3 hover:text-[var(--red)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {!isEditing ? (
        <div>
          <p><strong>Name:</strong> {repair.customer_name}</p>
          <p><strong>Contact:</strong> {repair.contact || 'Not provided'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name * <span className="text-xs text-gray-500">({editedData.customer_name.length}/40)</span>
            </label>
            <input
              type="text"
              value={editedData.customer_name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border focus:outline-none border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent ${editedData.customer_name.length > 40 ? 'border-red-500' : ''
                }`}
              maxLength={40}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact * <span className="text-xs text-gray-500">({editedData.contact.length}/50)</span>
            </label>
            <input
              type="text"
              value={editedData.contact}
              onChange={handleContactChange}
              className={`w-full px-3 py-2 border focus:outline-none border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent ${editedData.contact.length > 50 ? 'border-red-500' : ''
                }`}
              maxLength={50}
            />
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
};

export default CustomerDetailsCard;