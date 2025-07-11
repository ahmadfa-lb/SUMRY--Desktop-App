import React, { useState, useEffect } from 'react';
import { X, CirclePlus, Trash, Trash2 } from 'lucide-react';
import useToast from '../toast/useToast';
import ToastContainer from '../toast/ToastContainer';

interface ManageCustomSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionsUpdated?: () => void; // Callback to refresh suggestions in parent
}

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-[60]"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="fixed left-[50%] top-[50%] z-[70] w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg rounded-lg border">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white hover:bg-gray-50 h-9 px-4 py-2"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-9 px-4 py-2"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const ManageCustomSuggestions: React.FC<ManageCustomSuggestionsProps> = ({
  isOpen,
  onClose,
  onSuggestionsUpdated
}) => {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const { toasts, showToast, hideToast } = useToast();

  // Load suggestions from database when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const api = (window as any).electronAPI;
      if (api) {
        const [brandSuggestions, modelSuggestions] = await Promise.all([
          api.getAllSuggestions('brand'),
          api.getAllSuggestions('model')
        ]);
        setBrands(brandSuggestions);
        setModels(modelSuggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBrand = async () => {
    if (newBrand.trim() && !brands.includes(newBrand.trim())) {
      try {
        const api = (window as any).electronAPI;
        if (api) {
          const result = await api.addSuggestion('brand', newBrand.trim());
          if (result !== null) {
            showToast({
              type: 'success',
              title: 'Suggestion Added',
              description: `Brand "${newBrand.trim()}" has been added to brand suggestions.`,
              duration: 5000
            });
            setBrands([...brands, newBrand.trim()].sort());
            setNewBrand('');
            onSuggestionsUpdated?.();
          }
        }
      } catch (error) {
        console.error('Error adding brand suggestion:', error);
      }
    }
  };

  const removeBrand = async (index: number) => {
    const brandToRemove = brands[index];
    try {
      const api = (window as any).electronAPI;
      if (api) {
        showToast({
          type: 'success',
          title: 'Suggestion Removed',
          description: `Brand "${brandToRemove.trim()}" has been removed from brand suggestions.`,
          duration: 5000
        });
        const success = await api.removeSuggestion('brand', brandToRemove);
        if (success) {
          setBrands(brands.filter((_, i) => i !== index));
          onSuggestionsUpdated?.();
        }
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Suggestion Removal Failed',
        description: `Brand "${brandToRemove.trim()}" could not be removed from brand suggestions.`,
        duration: 5000
      });
      console.error('Error removing brand suggestion:', error);
    }
  };

  const clearAllBrands = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Clear All ❓',
      message: 'Are you sure you want to remove all custom brand suggestions? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const api = (window as any).electronAPI;
          if (api) {
            const success = await api.clearAllSuggestions('brand');
            if (success) {
              showToast({
                type: 'success',
                title: 'Suggestions Cleared',
                description: 'All brand suggestions have been cleared.',
                duration: 5000
              });
              setBrands([]);
              onSuggestionsUpdated?.();
            }
          }
        } catch (error) {
          showToast({
            type: 'error',
            title: 'Suggestions Clearing Failed',
            description: 'All brand suggestions could not be cleared.',
            duration: 5000
          });
          console.error('Error clearing brand suggestions:', error);
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const addModel = async () => {
    if (newModel.trim() && !models.includes(newModel.trim())) {
      try {
        const api = (window as any).electronAPI;
        if (api) {
          const result = await api.addSuggestion('model', newModel.trim());
          if (result !== null) {
            showToast({
              type: 'success',
              title: 'Suggestion Added',
              description: `Model "${newModel.trim()}" has been added to model suggestions.`,
              duration: 5000
            });
            setModels([...models, newModel.trim()].sort());
            setNewModel('');
            onSuggestionsUpdated?.();
          }
        }
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Suggestion Addition Failed',
          description: `Model "${newModel.trim()}" could not be added to model suggestions.`,
          duration: 5000
        });
        console.error('Error adding model suggestion:', error);
      }
    }
  };

  const removeModel = async (index: number) => {
    const modelToRemove = models[index];
    try {
      const api = (window as any).electronAPI;
      if (api) {
        showToast({
          type: 'success',
          title: 'Suggestion Removed',
          description: `Model "${modelToRemove.trim()}" has been removed from model suggestions.`,
          duration: 5000
        });
        const success = await api.removeSuggestion('model', modelToRemove);
        if (success) {
          setModels(models.filter((_, i) => i !== index));
          onSuggestionsUpdated?.();
        }
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Suggestion Removal Failed',
        description: `Model "${modelToRemove.trim()}" could not be removed from model suggestions.`,
        duration: 5000
      });
      console.error('Error removing model suggestion:', error);
    }
  };

  const clearAllModels = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Clear All ❓',
      message: 'Are you sure you want to remove all custom model suggestions? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const api = (window as any).electronAPI;
          if (api) {
            const success = await api.clearAllSuggestions('model');
            if (success) {
              showToast({
                type: 'success',
                title: 'Suggestions Cleared',
                description: 'All model suggestions have been cleared.',
                duration: 5000
              });
              setModels([]);
              onSuggestionsUpdated?.();
            }
          }
        } catch (error) {
          showToast({
            type: 'error',
            title: 'Suggestions Clearing Failed',
            description: 'All model suggestions could not be cleared.',
            duration: 5000
          });
          console.error('Error clearing model suggestions:', error);
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-80 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg sm:max-w-lg"
        tabIndex={-1}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Manage Custom Suggestions
          </h2>
          <p className="text-sm text-[var(--light-green)]">
            Add or remove custom suggestions for item brands, models, and part
            items. These will appear in the suggestion lists on the forms.
          </p>
        </div>

        {/* Content */}
        <div className="relative overflow-hidden max-h-[60vh] py-2 pr-4">
          <div className="h-full w-full rounded-[inherit]" style={{ overflow: 'hidden scroll' }}>
            <div style={{ minWidth: '100%', display: 'table' }}>
              <div className="space-y-6">
                {/* Brands Section */}
                <div className="space-y-2">
                  <h3 className="text-md font-semibold text-foreground">
                    Defined Brands:
                  </h3>
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="brandsToAddInput"
                  >
                    Add Brand Suggestion
                  </label>
                  <div className="flex gap-2 px-1">
                    <input
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-[var(--light-green)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-green)] placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      id="brandsToAddInput"
                      placeholder="Enter brand name"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addBrand)}
                      disabled={loading}
                    />
                    <button
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-green-200 text-green-700 hover:bg-green-200/80 h-10 px-4 py-2"
                      onClick={addBrand}
                      disabled={loading}
                      aria-label="Add"
                    >
                      <CirclePlus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-3 mb-1">
                    <h4 className="font-medium text-sm">Defined Brands:</h4>
                    <button
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border hover:bg-orange-500 hover:text-white rounded-md px-3 text-xs h-7"
                      onClick={clearAllBrands}
                      disabled={loading}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Clear All
                    </button>
                  </div>
                  <div className="relative overflow-hidden h-32 rounded-md border p-2">
                    <div className="h-full w-full rounded-[inherit]" style={{ overflow: 'hidden scroll' }}>
                      <div style={{ minWidth: '100%', display: 'table' }}>
                        <ul className="space-y-1">
                          {loading ? (
                            <div>
                              <p className="text-sm text-[var(--light-green-2)] italic">Loading...</p>
                            </div>
                          ) : brands.length === 0 ? (
                            <div>
                              <p className="text-sm text-[var(--light-green-2)] italic">No custom brands defined yet.</p>
                            </div>
                          ) : (
                            brands.map((brand, index) => (
                              <li key={index} className="flex justify-between items-center text-sm p-1 hover:bg-gray-100 rounded-sm">
                                <span>{brand}</span>
                                <button
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-orange-500 h-6 w-6 text-red-500 hover:text-white"
                                  onClick={() => removeBrand(index)}
                                  disabled={loading}
                                  title={`Remove "${brand}" from custom suggestions`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </li>
                            )))
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="shrink-0 bg-gray-200 h-[1px] w-full"></div>

                {/* Models Section */}
                <div className="space-y-2">
                  <h3 className="text-md font-semibold text-foreground">
                    Defined Models:
                  </h3>
                  <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    htmlFor="modelsToAddInput"
                  >
                    Add Model Suggestion
                  </label>
                  <div className="flex gap-2 p-1">
                    <input
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-[var(--light-green)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--light-green)] placeholder:text-[var(--light-green-2)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      id="modelsToAddInput"
                      placeholder="Enter model name"
                      value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addModel)}
                      disabled={loading}
                    />
                    <button
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-green-200 text-green-700 hover:bg-green-200/80 h-10 px-4 py-2"
                      onClick={addModel}
                      disabled={loading}
                      aria-label="Add"
                    >
                      <CirclePlus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-3 mb-1">
                    <h4 className="font-medium text-sm">Defined Models:</h4>
                    <button
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 border bg-white hover:bg-orange-500 hover:text-white rounded-md px-3 text-xs h-7"
                      onClick={clearAllModels}
                      disabled={loading}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Clear All
                    </button>
                  </div>
                  <div className="relative overflow-hidden h-32 rounded-md border p-2">
                    <div className="h-full w-full rounded-[inherit]" style={{ overflow: 'hidden scroll' }}>
                      <div style={{ minWidth: '100%', display: 'table' }}>
                        <ul className="space-y-1">
                          {loading ? (
                            <div>
                              <p className="text-sm text-[var(--light-green-2)] italic">Loading...</p>
                            </div>
                          ) : models.length === 0 ? (
                            <div>
                              <p className="text-sm text-[var(--light-green-2)] italic">No custom models defined yet.</p>
                            </div>
                          ) : (
                            models.map((model, index) => (
                              <li key={index} className="flex justify-between items-center text-sm p-1 hover:bg-gray-100 rounded-sm">
                                <span>{model}</span>
                                <button
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-orange-500 h-6 w-6 text-[var(--red)] hover:text-white"
                                  onClick={() => removeModel(index)}
                                  disabled={loading}
                                  title={`Remove "${model}" from custom suggestions`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-orange-500 hover:text-white h-10 px-4 py-2"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </button>
        </div>

        {/* Close button (X) */}
        <button
          type="button"
          className="absolute right-4 top-4 opacity-70 focus:ring-2 focus:ring-[var(--light-green)] rounded-full transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
          onClick={onClose}
          disabled={loading}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      
      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
      
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
    </>
  );
};

export default ManageCustomSuggestions;