import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface AddNewItemProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: FormData) => void;
  initialData?: FormData;
  title?: string;
  submitButtonText?: string;
}

interface FormData {
  model: string;
  powerRate: string;
  serialNumber: string;
  category: string;
  notes: string;
}

const AddNewItem: React.FC<AddNewItemProps> = ({ 
  isOpen = true, 
  onClose = () => {}, 
  onSubmit = () => {},
  initialData,
  title = "Add New Used Stock Item",
  submitButtonText = "Add Stock Item"
}) => {
  const [formData, setFormData] = useState<FormData>({
    model: '',
    powerRate: '',
    serialNumber: '',
    category: '',
    notes: ''
  });
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = ['12V', '24V', '48V'];

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Reset form when no initial data (add mode)
      setFormData({
        model: '',
        powerRate: '',
        serialNumber: '',
        category: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
    setCategoryDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setCategoryDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg rounded-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-[var(--light-green-2)]">
            {initialData ? 'Update the details for the stock item.' : 'Enter the details for the used stock item.'}
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="model-input"
            >
              Model
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., SE5000H, iPhone 12"
              id="model-input"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="power-rate-input"
            >
              Power Rate
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., 5kW, 300W, 12V/2A"
              id="power-rate-input"
              name="powerRate"
              value={formData.powerRate}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="serial-number-input"
            >
              Serial Number
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter unique S/N"
              id="serial-number-input"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="category-select"
            >
              Category (Optional)
            </label>
            <div className="relative">
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                id="category-select"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              >
                <span>
                  {formData.category || 'Select a category'}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
              
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-[var(--orange)] hover:text-white focus:bg-gray-100"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <span className="text-sm text-[var(--gray)]">{category}</span>
                      {formData.category === category && (
                        <Check className="w-4 h-4 text-[var(--light-green)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="notes-input"
            >
              Notes (Optional)
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="e.g., Condition, source, specific details"
              rows={3}
              name="notes"
              id="notes-input"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[var(--light-green)] text-white hover:bg-[var(--light-green-2)] h-10 px-4 py-2"
            type="submit"
          >
            {submitButtonText}
          </button>
        </form>
        
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:pointer-events-none"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>
  );
};

export default AddNewItem;