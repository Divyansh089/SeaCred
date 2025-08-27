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
}

const StatsCard = memo(function StatsCard({
  title,
  value,
  change,
  icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <div
      className={clsx(
        "bg-white overflow-hidden shadow rounded-lg transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-gray-400">{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {change && (
                <dd
                  className={clsx(
                    "text-sm font-semibold",
                    change.type === "increase"
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {change.type === "increase" ? "↗" : "↘"} {change.value}
                </dd>
              )}
              {description && (
                <dd className="text-sm text-gray-500 mt-1">{description}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StatsCard;
