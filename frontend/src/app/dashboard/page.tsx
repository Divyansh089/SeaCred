"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import MetaMaskConnect from "@/components/ui/MetaMaskConnect";
import ExportReportButton from "@/components/ui/ExportReportButton";
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const stats = [
  {
    name: "Total Projects",
    stat: "247",
    previousStat: "223",
    change: "10.7%",
    changeType: "increase",
    icon: DocumentTextIcon,
  },
  {
    name: "Active Credits",
    stat: "1,234,567",
    previousStat: "1,187,432",
    change: "4.0%",
    changeType: "increase",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Verified Projects",
    stat: "156",
    previousStat: "142",
    change: "9.9%",
    changeType: "increase",
    icon: CheckCircleIcon,
  },
  {
    name: "Pending Reviews",
    stat: "23",
    previousStat: "31",
    change: "25.8%",
    changeType: "decrease",
    icon: ClockIcon,
  },
];

const chartData = [
  { name: "Jan", credits: 4000, projects: 24 },
  { name: "Feb", credits: 3000, projects: 13 },
  { name: "Mar", credits: 2000, projects: 18 },
  { name: "Apr", credits: 2780, projects: 29 },
  { name: "May", credits: 1890, projects: 21 },
  { name: "Jun", credits: 2390, projects: 35 },
];

const recentActivity = [
  {
    id: "1",
    type: "project_approved" as const,
    description: "Solar Farm Project in Maharashtra",
    userName: "John Admin",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "success" as const,
  },
  {
    id: "2",
    type: "credits_issued" as const,
    description: "50,000 credits for Wind Energy Project",
    userName: "Jane Officer",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: "info" as const,
  },
  {
    id: "3",
    type: "verification_completed" as const,
    description: "Forest Conservation Project verified",
    userName: "Mike Project",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: "success" as const,
  },
  {
    id: "4",
    type: "project_created" as const,
    description: "Biogas Plant Project pending review",
    userName: "Sarah Wilson",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "warning" as const,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();

  const roleSpecificStats = useMemo(() => {
    switch (user?.role) {
      case "admin":
        return stats;
      case "officer":
        return stats.filter((stat) => stat.name !== "Total Projects");
      case "project_authority":
        return stats.filter(
          (stat) =>
            stat.name === "Total Projects" || stat.name === "Active Credits"
        );
      default:
        return stats;
    }
  }, [user?.role]);

  const handleExportReport = useCallback(() => {
    // This is now handled by the ExportReportButton component
    console.log(
      "Export report functionality moved to ExportReportButton component"
    );
  }, []);

  const handleNewProject = useCallback(() => {
    router.push("/projects/new");
  }, [router]);

  const actionButtonText = useMemo(() => {
    return user?.role === "project_authority" ? "New Project" : "Export Report";
  }, [user?.role]);

  const actionButtonHandler = useMemo(() => {
    return user?.role === "project_authority"
      ? handleNewProject
      : handleExportReport;
  }, [user?.role, handleNewProject, handleExportReport]);

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name}! Here&apos;s what&apos;s happening with
              your carbon credits.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
            {user?.role === "project_authority" ? (
              <button
                type="button"
                onClick={handleNewProject}
                className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors duration-200"
              >
                <PlusIcon
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  aria-hidden="true"
                />
                New Project
              </button>
            ) : (
              <ExportReportButton
                data={{
                  stats: roleSpecificStats,
                  chartData: chartData,
                  activities: recentActivity,
                }}
                variant="dropdown"
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roleSpecificStats.map((item) => (
              <StatsCard
                key={item.name}
                title={item.name}
                value={item.stat}
                change={{
                  value: item.change,
                  type: item.changeType as "increase" | "decrease",
                }}
                icon={<item.icon className="h-6 w-6" />}
              />
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Credits Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Credits Issued Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="credits"
                  stroke="#059669"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Projects by Month */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Projects by Month
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="projects" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MetaMask Connection */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Blockchain Wallet Connection
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your MetaMask wallet to manage carbon credits on the
              blockchain.
            </p>
            <MetaMaskConnect />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>
    </DashboardLayout>
  );
}
