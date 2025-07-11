import React, { useState } from 'react';
import { Package, PenLine, Save, X } from 'lucide-react';
import { Repair } from '../../types/repair';
import useToast from '../../toast/useToast';
import ToastContainer from '../../toast/ToastContainer';

interface ItemInformationCardProps {
  repair: Repair;
  onUpdate: (updates: Partial<Repair>) => Promise<void>;
  isLocked: boolean;
}

const ItemInformationCard: React.FC<ItemInformationCardProps> = ({ repair, onUpdate, isLocked }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    item_brand: repair.item_brand,
    item_model: repair.item_model || '',
    serial_number: repair.serial_number || ''
  });
  const { toasts, showToast, hideToast } = useToast();

  const handleSave = async () => {
    // Validate character limits
    if (editedData.item_brand.length > 50) {
      showToast({
        type: 'error',
        title: 'Item Brand/Type cannot exceed 50 characters',
        description: `Error updating item: ${editedData.item_brand}`,
      });
      return;
    }

    if (editedData.item_model.length > 50) {
      showToast({
        type: 'error',
        title: 'Item Model cannot exceed 50 characters',
        description: `Error updating item: ${editedData.item_model}`,
      });
      return;
    }

    if (editedData.serial_number.length > 30) {
      showToast({
        type: 'error',
        title: 'Serial Number cannot exceed 30 characters',
        description: `Error updating item: ${editedData.serial_number}`,
      });
      return;
    }

    // Validate required fields
    if (!editedData.item_brand.trim() || !editedData.item_model.trim() || !editedData.serial_number.trim()) {
      showToast({
        type: 'error',
        title: 'Item Brand/Type/Serial Number are required',
        description: `Error updating item: ${editedData.item_brand}`,
      });
      return;
    }

    await onUpdate(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({
      item_brand: repair.item_brand,
      item_model: repair.item_model || '',
      serial_number: repair.serial_number || ''
    });
    setIsEditing(false);
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 50) {
      showToast({
        type: 'error',
        title: 'Item Brand/Type cannot exceed 50 characters',
        description: `Error updating item: ${value}`,
      });
      return;
    }
    setEditedData({ ...editedData, item_brand: value });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 50) {
      showToast({
        type: 'error',
        title: 'Item Model cannot exceed 50 characters',
        description: `Error updating item: ${value}`,
      });
      return;
    }
    setEditedData({ ...editedData, item_model: value });
  };

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > 30) {
      showToast({
        type: 'error',
        title: 'Serial Number cannot exceed 30 characters',
        description: `Error updating item: ${value}`,
      });
      return;
    }
    setEditedData({ ...editedData, serial_number: value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5" />
          Item Information
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLocked}
            className="inline-flex items-center focus:ring-2 focus:ring-[var(--light-green)] justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3"
          >
            <PenLine className="h-4 w-4 mr-2" />
            Edit Item Info
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 focus:ring-2 focus:ring-[var(--light-green)] whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-[var(--orange)] text-white hover:bg-orange-600 h-9 rounded-md px-3"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Item Info
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex focus:ring-2 focus:ring-[var(--light-green)] items-center justify-center gap-2 whitespace-nowrap text-sm font-medium  transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border hover:bg-gray-100 h-9 rounded-md px-3 hover:text-[var(--red)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {!isEditing ? (
        <div>
          <p><strong>Item Brand/Type:</strong> {repair.item_brand}</p>
          <p><strong>Item Model (Optional):</strong> {repair.item_model || 'Not specified'}</p>
          <p><strong>Item S/N:</strong> {repair.serial_number || 'Not provided'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Brand/Type * <span className="text-xs text-gray-500">({editedData.item_brand.length}/50)</span>
            </label>
            <input
              type="text"
              value={editedData.item_brand}
              onChange={handleBrandChange}
              className={`w-full px-3 py-2 border focus:outline-none border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent ${editedData.item_brand.length > 50 ? 'border-red-500' : ''
                }`}
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Model (Optional) <span className="text-xs text-gray-500">({editedData.item_model.length}/50)</span>
            </label>
            <input
              type="text"
              value={editedData.item_model}
              onChange={handleModelChange}
              className={`w-full px-3 py-2 focus:outline-none border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent ${editedData.item_model.length > 50 ? 'border-red-500' : ''
                }`}
              placeholder="e.g., SE2000I, 15 Pro, XPS 13"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item S/N <span className="text-xs text-gray-500">({editedData.serial_number.length}/30)</span>
            </label>
            <input
              type="text"
              value={editedData.serial_number}
              onChange={handleSerialChange}
              className={`w-full px-3 py-2 border focus:outline-none border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent ${editedData.serial_number.length > 30 ? 'border-red-500' : ''
                }`}
              maxLength={30}
            />
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </div>
  );
};

export default ItemInformationCard;