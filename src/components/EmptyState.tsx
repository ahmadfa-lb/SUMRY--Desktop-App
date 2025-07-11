import React from "react";
import { Package } from "lucide-react";
const EmptyState: React.FC = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4">
          <Package className="w-16 h-16 text-[var(--light-green)] mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-500 max-w-md">
          No items found for the selected statuses. Try adjusting your filters or log a new repair.
        </p>
      </div>
    );
  };

  export default EmptyState;