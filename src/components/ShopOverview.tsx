import React, { useState, useEffect } from "react";
import OverviewCard from "./OverviewCard";
import WarrantyCheckModal from "./WarrantyCheckModal";
import { Wrench, Clock, ShieldQuestion, ClipboardList } from "lucide-react";
import { useShop } from '../contexts/ShopContext';

interface ShopStats {
  itemsLoggedToday: number;
  totalItemsFixed: number;
  itemsAwaitingFix: number;
}

const ShopOverview: React.FC = () => {
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [stats, setStats] = useState<ShopStats>({
    itemsLoggedToday: 0,
    totalItemsFixed: 0,
    itemsAwaitingFix: 0
  });
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useShop();

  const loadShopStats = async () => {
    try {
      setLoading(true);
      const shopStats = await (window as any).electronAPI.getShopOverviewStats();
      setStats(shopStats);
    } catch (error) {
      console.error('Error loading shop stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopStats();
  }, [refreshTrigger]); // Refresh when trigger changes

  const handleCheckWarrantyClick = () => {
    setIsWarrantyModalOpen(true);
  };

  const handleCloseWarrantyModal = () => {
    setIsWarrantyModalOpen(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[var(--light-green)]">Shop Overview</h2>
        <button 
          onClick={handleCheckWarrantyClick}
          className="inline-flex items-center justify-center text-[var(--light-gray)] gap-2 whitespace-nowrap text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 border hover:bg-[var(--orange)] hover:text-white bg-gray-100 h-9 rounded-md px-3 w-full sm:w-auto"
        >
          <ShieldQuestion className="w-5 h-5" />
          <span className="text-sm">Check Warranty</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Items Logged Today"
          value={loading ? 0 : stats.itemsLoggedToday}
          icon={<ClipboardList className="w-5 h-5" />}
          loading={loading}
        />
        <OverviewCard
          title="Total Items Fixed"
          value={loading ? 0 : stats.totalItemsFixed}
          icon={<Wrench className="w-5 h-5" />}
          loading={loading}
        />
        <OverviewCard
          title="Items Awaiting Fix"
          value={loading ? 0 : stats.itemsAwaitingFix}
          icon={<Clock className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      <WarrantyCheckModal 
        isOpen={isWarrantyModalOpen}
        onClose={handleCloseWarrantyModal}
      />
    </div>
  );
};

export default ShopOverview;