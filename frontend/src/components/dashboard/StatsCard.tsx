import { ReactNode, memo } from "react";
import { clsx } from "clsx";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: "increase" | "decrease";
  };
  icon: ReactNode;
  description?: string;
  className?: string;
  trend?: {
    data: number[];
    color?: string;
  };
  variant?: "default" | "gradient" | "outlined";
}

const StatsCard = memo(function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  className,
  trend,
  variant = "default",
}: StatsCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-green-50 to-blue-50 border border-green-200";
      case "outlined":
        return "bg-white border-2 border-gray-200";
      default:
        return "bg-white shadow-lg";
    }
  };

  const renderTrendChart = () => {
    if (!trend || trend.data.length === 0) return null;
    
    const maxValue = Math.max(...trend.data);
    const minValue = Math.min(...trend.data);
    const range = maxValue - minValue || 1;
    
    return (
      <div className="mt-3 h-12 flex items-end space-x-1">
        {trend.data.map((point, index) => {
          const height = ((point - minValue) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-green-400 to-green-600 rounded-t"
              style={{
                height: `${Math.max(height, 10)}%`,
                opacity: 0.7 + (index / trend.data.length) * 0.3
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105",
        getVariantClasses(),
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 text-green-600">
                {icon}
              </div>
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-600 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-bold text-gray-900">{value}</dd>
              {change && (
                <dd
                  className={clsx(
                    "text-sm font-semibold flex items-center mt-1",
                    change.type === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  <span className="mr-1">
                    {change.type === "increase" ? "↗" : "↘"}
                  </span>
                  {change.value}
                </dd>
              )}
              {description && (
                <dd className="text-xs text-gray-500 mt-1">{description}</dd>
              )}
            </div>
          </div>
        </div>
        {renderTrendChart()}
      </div>
    </div>
  );
});

export default StatsCard;
