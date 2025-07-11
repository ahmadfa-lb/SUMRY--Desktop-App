import React, { useState, useEffect } from 'react';
import { X, Settings, ShieldQuestion, Check, ChevronDown } from 'lucide-react';
import ManageCustomSuggestions from './ManageCustomSuggestions';
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';

interface LogNewRepairProps {
  onClose: () => void;
  onRepairAdded?: () => void;
}

const LogNewRepair: React.FC<LogNewRepairProps> = ({ onClose, onRepairAdded }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    contact: '',
    itemBrand: '',
    itemModel: '',
    serialNumber: '',
    underWarranty: false,
    problemDescription: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isManageSuggestionsOpen, setIsManageSuggestionsOpen] = useState(false);

  // Suggestions state
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<string[]>([]);

  // Custom dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [filteredBrandSuggestions, setFilteredBrandSuggestions] = useState<string[]>([]);
  const [filteredModelSuggestions, setFilteredModelSuggestions] = useState<string[]>([]);

  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomerSuggestions, setFilteredCustomerSuggestions] = useState<Customer[]>([]);
  const [serialSuggestions, setSerialSuggestions] = useState<string[]>([]);
  const [showSerialDropdown, setShowSerialDropdown] = useState(false);

  // Character limits
  const CHARACTER_LIMITS = {
    customerName: 40,
    contact: 50,
    itemBrand: 50,
    itemModel: 50,
    serialNumber: 30,
    problemDescription: 500
  };

  // Load suggestions on component mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    const filtered = brandSuggestions.filter(brand =>
      brand.toLowerCase().includes(formData.itemBrand.toLowerCase())
    );
    setFilteredBrandSuggestions(filtered);
  }, [formData.itemBrand, brandSuggestions]);

  useEffect(() => {
    const filtered = modelSuggestions.filter(model =>
      model.toLowerCase().includes(formData.itemModel.toLowerCase())
    );
    setFilteredModelSuggestions(filtered);
  }, [formData.itemModel, modelSuggestions]);

  useEffect(() => {
    const filtered = customerSuggestions.filter(customer =>
      customer.customer_name.toLowerCase().includes(formData.customerName.toLowerCase())
    );
    setFilteredCustomerSuggestions(filtered);
  }, [formData.customerName, customerSuggestions]);

  const loadSuggestions = async () => {
    try {
      const api = (window as any).electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }
      const [brands, models, customers] = await Promise.all([
        api.getAllSuggestions('brand'),
        api.getAllSuggestions('model'),
        api.getAllCustomers()
      ]);
      setBrandSuggestions(brands);
      setModelSuggestions(models);
      setCustomerSuggestions(customers);

      // console.log(brands);
      // console.log(models);

    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleCheckWarranty = async () => {
    if (!formData.serialNumber.trim()) {
      return;
    }

    try {
      const warrantyUrl = `https://sumrylebanon.com/certificate.php?serial_number=${formData.serialNumber.trim()}`;
      const result = await (window as any).electronAPI.openExternal(warrantyUrl);

      if (result.success) {
        // Warranty page opened successfully
        // console.log('Warranty page opened successfully');
      } else {
        console.error('Failed to open warranty page');
      }
    } catch (error) {
      console.error('Error opening warranty page:', error);
    }
  };

  const handleCustomerSuggestionClick = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.customer_name,
      contact: customer.contact || ''
    }));
    setShowCustomerDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Apply character limits
    let limitedValue = value;
    if (name in CHARACTER_LIMITS) {
      const limit = CHARACTER_LIMITS[name as keyof typeof CHARACTER_LIMITS];
      limitedValue = value.slice(0, limit);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : limitedValue
    }));
  };

  const handleWarrantyChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      underWarranty: checked
    }));
  };

  // Add serial number search function
  const searchSerialNumbers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSerialSuggestions([]);
      return;
    }

    try {
      const api = (window as any).electronAPI;
      const repairs = await api.getAllRepairs();
      const uniqueSerials: string[] = [...new Set<string>(
        repairs
          .filter(repair => repair.serial_number &&
            repair.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(repair => repair.serial_number)
      )];
      setSerialSuggestions(uniqueSerials.slice(0, 10)); // Limit to 10 suggestions
    } catch (error) {
      console.error('Error searching serial numbers:', error);
    }
  };

  // Add to serial number input onChange
  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange(e);
    searchSerialNumbers(value);
  };

  const handleSerialSuggestionClick = (serial: string) => {
    setFormData(prev => ({
      ...prev,
      serialNumber: serial
    }));
    setShowSerialDropdown(false);
  };

  const handleSuggestionClick = (field: 'itemBrand' | 'itemModel', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'itemBrand') {
      setShowBrandDropdown(false);
    } else {
      setShowModelDropdown(false);
    }
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setSubmitError('Customer name is required');
      return false;
    }
    if (formData.customerName.length > CHARACTER_LIMITS.customerName) {
      setSubmitError(`Customer name must be ${CHARACTER_LIMITS.customerName} characters or less`);
      return false;
    }
    if (formData.contact.length > CHARACTER_LIMITS.contact) {
      setSubmitError(`Contact must be ${CHARACTER_LIMITS.contact} characters or less`);
      return false;
    }
    if (!formData.itemBrand.trim()) {
      setSubmitError('Item brand/type is required');
      return false;
    }
    if (formData.itemBrand.length > CHARACTER_LIMITS.itemBrand) {
      setSubmitError(`Item brand/type must be ${CHARACTER_LIMITS.itemBrand} characters or less`);
      return false;
    }
    if (formData.itemModel.length > CHARACTER_LIMITS.itemModel) {
      setSubmitError(`Item model must be ${CHARACTER_LIMITS.itemModel} characters or less`);
      return false;
    }
    if (formData.serialNumber.length > CHARACTER_LIMITS.serialNumber) {
      setSubmitError(`Serial number must be ${CHARACTER_LIMITS.serialNumber} characters or less`);
      return false;
    }
    if (!formData.problemDescription.trim()) {
      setSubmitError('Problem description is required');
      return false;
    }
    if (formData.problemDescription.length > CHARACTER_LIMITS.problemDescription) {
      setSubmitError(`Problem description must be ${CHARACTER_LIMITS.problemDescription} characters or less`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Map form data to database schema
      const repairData = {
        customer_name: formData.customerName.trim(),
        contact: formData.contact.trim() || null,
        item_brand: formData.itemBrand.trim(),
        item_model: formData.itemModel.trim() || null,
        serial_number: formData.serialNumber.trim() || null,
        under_warranty: formData.underWarranty,
        problem_description: formData.problemDescription.trim(),
        status: 'pending-diagnosis',
        repair_cost: 0,
        amount_paid: 0,
        parts_used: '[]',
        is_unlocked: false,
      };

      // console.log('Submitting repair data:', repairData);

      // Check if electronAPI is available
      const api = (window as any).electronAPI;
      // console.log(api);
      if (!api) {
        throw new Error('Electron API not available');
      }

      const repairId = await api.addRepair(repairData);

      // console.log('Repair added successfully with ID:', repairId);

      if (onRepairAdded) {
        onRepairAdded();
      }

      onClose();

    } catch (error) {
      console.error('Error adding repair:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to add repair. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCount = (field: keyof typeof CHARACTER_LIMITS) => {
    const current = formData[field].length;
    const limit = CHARACTER_LIMITS[field];
    return { current, limit, remaining: limit - current };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--light-green)]">Log New Repair</h2>
            <p className="text-[var(--light-green-2)]">Fill in the details below to log a new repair job.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:ring-2 focus:ring-[var(--light-green)] rounded-full"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-0 pb-4 px-4">
          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {submitError}
            </div>
          )}

          <div className="space-y-6">
            {/* Customer Details Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className='relative'>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name * ({getCharacterCount('customerName').current}/{CHARACTER_LIMITS.customerName})
                  </label>
                  <div className='relative'>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      maxLength={CHARACTER_LIMITS.customerName}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent outline-none"
                      disabled={isSubmitting}
                      required
                      autoComplete="off"
                    />
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 text-gray-500 ${showCustomerDropdown ? 'rotate-180' : ''}`}
                      size={16}
                    />

                    {showCustomerDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {filteredCustomerSuggestions.length > 0 ? (
                          filteredCustomerSuggestions.map((customer, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 hover:text-[var(--light-green)] hover:bg-green-50"
                              onClick={() => handleCustomerSuggestionClick(customer)}
                            >
                              <div className="font-medium">{customer.customer_name}</div>
                              {customer.contact && (
                                <div className="text-xs text-gray-500">{customer.contact}</div>
                              )}
                              <div className="text-xs text-gray-400">
                                {customer.repair_count} repair{customer.repair_count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-center text-gray-500 italic text-sm">
                            No matching customers found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact (Phone/Email) ({getCharacterCount('contact').current}/{CHARACTER_LIMITS.contact})
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    maxLength={CHARACTER_LIMITS.contact}
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com or 555-1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Item Information Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Item Information</h3>
                <button
                  type="button"
                  className="flex items-center border space-x-1 text-sm text-gray-600 hover:text-white hover:bg-[var(--orange)] transition-colors duration-200 px-2 py-1 rounded-md"
                  disabled={isSubmitting}
                  onClick={() => setIsManageSuggestionsOpen(true)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Manage Brand/Model Suggestions</span>
                </button>
                <ManageCustomSuggestions
                  isOpen={isManageSuggestionsOpen}
                  onClose={() => setIsManageSuggestionsOpen(false)}
                  onSuggestionsUpdated={loadSuggestions}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Custom Brand Datalist */}
                <div className="relative">
                  <label htmlFor="itemBrand" className="block text-sm font-medium text-gray-700 mb-2">
                    Item Brand/Type * ({getCharacterCount('itemBrand').current}/{CHARACTER_LIMITS.itemBrand})
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="itemBrand"
                      name="itemBrand"
                      maxLength={CHARACTER_LIMITS.itemBrand}
                      value={formData.itemBrand}
                      onChange={handleInputChange}
                      onFocus={() => setShowBrandDropdown(true)}
                      onBlur={() => setTimeout(() => setShowBrandDropdown(false), 150)}
                      placeholder="e.g., SolarEdge, iPhone, Dell Laptop"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent outline-none"
                      disabled={isSubmitting}
                      required
                      autoComplete="off"
                    />
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 text-gray-500 ${showBrandDropdown ? 'rotate-180' : ''}`}
                      size={16}
                    />

                    {showBrandDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {filteredBrandSuggestions.length > 0 ? (
                          filteredBrandSuggestions.map((brand, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 cursor-pointer text-sm flex items-center border-b border-gray-100 last:border-b-0 truncate hover:text-[var(--light-green)] hover:bg-green-50"
                              onClick={() => handleSuggestionClick('itemBrand', brand)}
                            >
                              {brand}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-center text-gray-500 italic text-sm">
                            No matching brands found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Model Datalist */}
                <div className="relative">
                  <label htmlFor="itemModel" className="block text-sm font-medium text-gray-700 mb-2">
                    Item Model (Optional) ({getCharacterCount('itemModel').current}/{CHARACTER_LIMITS.itemModel})
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="itemModel"
                      name="itemModel"
                      maxLength={CHARACTER_LIMITS.itemModel}
                      value={formData.itemModel}
                      onChange={handleInputChange}
                      onFocus={() => setShowModelDropdown(true)}
                      onBlur={() => setTimeout(() => setShowModelDropdown(false), 150)}
                      placeholder="e.g., SE5000H, 15 Pro, XPS 13"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent outline-none"
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 text-gray-500 ${showModelDropdown ? 'rotate-180' : ''}`}
                      size={16}
                    />

                    {showModelDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {filteredModelSuggestions.length > 0 ? (
                          filteredModelSuggestions.map((model, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 cursor-pointer text-sm flex items-center border-b border-gray-100 last:border-b-0 truncate hover:text-[var(--light-green)] hover:bg-green-50"
                              onClick={() => handleSuggestionClick('itemModel', model)}
                            >
                              {model}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-center text-gray-500 italic text-sm">
                            No matching models found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Serial Number */}
              <div className="space-y-2 mb-4">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="serialNumber"
                >
                  Item S/N ({getCharacterCount('serialNumber').current}/{CHARACTER_LIMITS.serialNumber})
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent outline-none"
                      placeholder="C02XXXXXX"
                      id="serialNumber"
                      maxLength={CHARACTER_LIMITS.serialNumber}
                      value={formData.serialNumber}
                      onChange={handleSerialChange}
                      onFocus={() => setShowSerialDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSerialDropdown(false), 150)}
                      name="serialNumber"
                      disabled={isSubmitting}
                      autoComplete="off"
                    />
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 text-gray-500 ${showSerialDropdown ? 'rotate-180' : ''}`}
                      size={16}
                    />

                    {showSerialDropdown && serialSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {serialSuggestions.map((serial, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 hover:text-[var(--light-green)] hover:bg-green-50"
                            onClick={() => handleSerialSuggestionClick(serial)}
                          >
                            {serial}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCheckWarranty}
                    type="button"
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-[var(--orange)] hover:text-white h-9 rounded-md px-3"
                    disabled={isSubmitting}
                    title="Check warranty for this S/N on your provider's website"
                  >
                    <ShieldQuestion className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Warranty Status */}
              <div className="flex flex-row items-start space-x-3 rtl:space-x-reverse rounded-md border p-4 shadow mb-4">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={formData.underWarranty}
                  data-state={formData.underWarranty ? "checked" : "unchecked"}
                  onClick={() => handleWarrantyChange(!formData.underWarranty)}
                  value="on"
                  className={`peer h-5 w-5 shrink-0 rounded-full border border-[var(--light-green)]
                       focus-visible:outline-none focus-visible:ring-2 
                      focus-visible:ring-[var(--light-green)] focus-visible:ring-offset-2 
                      disabled:cursor-not-allowed disabled:opacity-50 
                      transition-colors
                      ${formData.underWarranty ? 'bg-[var(--light-green)] text-white' : 'bg-transparent'}
                    `}
                  id="under-warranty-form-item"
                  aria-describedby="under-warranty-form-item-description"
                  aria-invalid="false"
                  disabled={isSubmitting}
                >
                  {formData.underWarranty && (
                    <span
                      data-state="checked"
                      className="flex items-center justify-center text-current pointer-events-none"
                    >
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>

                <div className="space-y-1 leading-none">
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="under-warranty-form-item"
                  >
                    Device Under Warranty?
                  </label>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Problem Description</h3>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="problemDescription"
                >
                  Describe the issue * ({getCharacterCount('problemDescription').current}/{CHARACTER_LIMITS.problemDescription})
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--light-green)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Describe the problem in detail..."
                  id="problemDescription"
                  name="problemDescription"
                  maxLength={CHARACTER_LIMITS.problemDescription}
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--light-green)] border border-transparent rounded-lg hover:bg-[var(--light-green)]/90 focus:ring-2 focus:ring-[var(--light-green)] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding Repair...' : 'Add Repair'}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer toasts={[]} onHideToast={() => { }} />
    </div>
  );
};

export default LogNewRepair;