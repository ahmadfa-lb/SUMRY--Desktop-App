import React from 'react';

interface OverviewCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    loading?: boolean;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon, loading = false }) => {
    return (
        <div className="bg-white rounded-lg border border-[var(--light-green-2)] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                <div className="text-[var(--light-green-2)]">{icon}</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
                {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                    value
                )}
            </div>
        </div>
    );
};

export default OverviewCard;