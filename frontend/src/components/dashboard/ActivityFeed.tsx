import { memo, useMemo } from "react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface Activity {
  id: string;
  type:
    | "project_created"
    | "project_approved"
    | "credits_issued"
    | "transaction_completed"
    | "verification_completed";
  description: string;
  userName: string;
  createdAt: Date;
  status?: "success" | "warning" | "info";
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
}

const activityIcons = {
  project_created: ClockIcon,
  project_approved: CheckCircleIcon,
  credits_issued: CheckCircleIcon,
  transaction_completed: CheckCircleIcon,
  verification_completed: CheckCircleIcon,
};

const ActivityFeed = memo(function ActivityFeed({
  activities,
  title = "Recent Activity",
  maxItems = 5,
}: ActivityFeedProps) {
  const displayActivities = useMemo(
    () => activities.slice(0, maxItems),
    [activities, maxItems]
  );

  const activityElements = useMemo(
    () =>
      displayActivities.map((activity, activityIdx) => {
        const Icon = activityIcons[activity.type];
        return (
          <li key={activity.id}>
            <div className="relative pb-8">
              {activityIdx !== displayActivities.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={clsx(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
                      activity.status === "success"
                        ? "bg-green-500"
                        : activity.status === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">
                        {activity.description}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      by {activity.userName}
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time>{activity.createdAt.toLocaleDateString('en-US')}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      }),
    [displayActivities]
  );

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activityElements}
          </ul>
        </div>
      </div>
    </div>
  );
});

export default ActivityFeed;
