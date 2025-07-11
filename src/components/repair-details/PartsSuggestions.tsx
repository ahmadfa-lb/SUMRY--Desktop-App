import React, { useState } from 'react';
import { X, CirclePlus, Trash2 } from 'lucide-react';

interface PartsSuggestionsProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: string[];
    onAddSuggestion: (suggestion: string) => void;
    onRemoveSuggestion: (index: number) => void;
    onClearAllSuggestions: () => void;
}

const PartsSuggestions: React.FC<PartsSuggestionsProps> = ({
    isOpen,
    onClose,
    suggestions,
    onAddSuggestion,
    onRemoveSuggestion,
    onClearAllSuggestions
}) => {
    const [newSuggestion, setNewSuggestion] = useState('');

    const handleAddSuggestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSuggestion.trim() && !suggestions.includes(newSuggestion.trim())) {
            
            onAddSuggestion(newSuggestion.trim());
            setNewSuggestion('');
        }
    };

    const handleClose = () => {
        setNewSuggestion('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <div 
                className="fixed inset-0 bg-black/50" 
                onClick={handleClose}
            ></div>
            
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Manage Custom Suggestions
                        </h2>
                        <p className="text-sm text-[var(--light-green-2)] mt-1">
                            Add or remove custom suggestions for item brands, models, and part items. These will appear in the suggestion lists on the forms.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:border-transparent disabled:pointer-events-none"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div>
                        <h3 className="text-md font-semibold text-gray-900 mb-3">
                            Defined Part Items:
                        </h3>
                        
                        {/* Add suggestion form */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Add Part Item Suggestion
                            </label>
                            <form onSubmit={handleAddSuggestion} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSuggestion}
                                    onChange={(e) => setNewSuggestion(e.target.value)}
                                    placeholder="Enter part item name"
                                    className="flex-1 h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:[var(--light-green)] transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!newSuggestion.trim() || suggestions.includes(newSuggestion.trim())}
                                    className="px-4 py-2 bg-[var(--light-green)] text-white text-sm font-medium rounded-md hover:bg-[var(--light-green-2)] focus:outline-none focus:ring-2 focus:ring-[var(--light-green)] focus:ring-offset-2 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <CirclePlus className="h-4 w-4" />
                                    Add
                                </button>
                            </form>
                        </div>

                        {/* Clear all button */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">
                                Defined Part Items:
                            </span>
                            {suggestions.length > 0 && (
                                <button
                                    onClick={onClearAllSuggestions}
                                    className="text-sm p-2 bg-gray-100 border hover:text-white rounded-md hover:bg-[var(--orange)] flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Suggestions list */}
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                            {suggestions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No suggestions defined yet
                                </p>
                            ) : (
                                suggestions.map((suggestion, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border hover:bg-green-50">
                                        <span className="text-sm text-gray-900">{suggestion}</span>
                                        <button
                                            onClick={() => onRemoveSuggestion(index)}
                                            className="text-red-500 hover:text-white rounded-md hover:bg-[var(--orange)]  p-1 transition-colors"
                                            title="Remove suggestion"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal footer */}
                <div className="flex justify-end p-6 border-t bg-gray-50">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-100 border text-sm font-medium rounded-md hover:bg-[var(--orange)] focus:ring-[var(--light-green)] hover:text-white focus:outline-none focus:ring-2 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartsSuggestions;