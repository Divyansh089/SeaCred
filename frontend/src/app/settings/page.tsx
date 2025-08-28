"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  UserIcon,
  BellIcon,
  LockClosedIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    projectUpdates: true,
    verificationAlerts: true,
    marketingEmails: false,
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: UserIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: LockClosedIcon },
    { id: "preferences", name: "Preferences", icon: PaintBrushIcon },
    ...(user?.role === "admin"
      ? [{ id: "system", name: "System", icon: ShieldCheckIcon }]
      : []),
  ];

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          {/* Sidebar */}
          <aside className="py-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group rounded-md px-3 py-2 flex items-center text-sm font-medium w-full ${
                      activeTab === tab.id
                        ? "bg-green-50 text-green-700 hover:text-green-700 hover:bg-green-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                        activeTab === tab.id
                          ? "text-green-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Profile Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal information and profile settings.
                  </p>

                  <form className="mt-6 space-y-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="first-name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          defaultValue={user?.name}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label
                          htmlFor="email-address"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email-address"
                          id="email-address"
                          defaultValue={user?.email}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="role"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Role
                        </label>
                        <input
                          type="text"
                          name="role"
                          id="role"
                          defaultValue={user?.role?.replace("_", " ")}
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Notification Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose how you want to be notified about platform
                    activities.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Email Notifications
                        </label>
                        <p className="text-sm text-gray-500">
                          Receive notifications via email
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) =>
                          handleNotificationChange("email", e.target.checked)
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Push Notifications
                        </label>
                        <p className="text-sm text-gray-500">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) =>
                          handleNotificationChange("push", e.target.checked)
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Project Updates
                        </label>
                        <p className="text-sm text-gray-500">
                          Get notified about project status changes
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.projectUpdates}
                        onChange={(e) =>
                          handleNotificationChange(
                            "projectUpdates",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Verification Alerts
                        </label>
                        <p className="text-sm text-gray-500">
                          Alerts for verification requests and updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.verificationAlerts}
                        onChange={(e) =>
                          handleNotificationChange(
                            "verificationAlerts",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Marketing Emails
                        </label>
                        <p className="text-sm text-gray-500">
                          Receive updates about new features and tips
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.marketingEmails}
                        onChange={(e) =>
                          handleNotificationChange(
                            "marketingEmails",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Security Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your password and account security.
                  </p>

                  <div className="mt-6 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Change Password
                      </h4>
                      <div className="mt-3 space-y-3">
                        <div>
                          <label
                            htmlFor="current-password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="current-password"
                            id="current-password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="new-password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            New Password
                          </label>
                          <input
                            type="password"
                            name="new-password"
                            id="new-password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-700">
                        Two-Factor Authentication
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Add an extra layer of security to your account.
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Preferences
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize your experience on the platform.
                  </p>

                  <div className="mt-6 space-y-6">
                    <div>
                      <label
                        htmlFor="language"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                        defaultValue="en"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="timezone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        name="timezone"
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                        defaultValue="UTC"
                      >
                        <option value="UTC">UTC</option>
                        <option value="PST">Pacific Standard Time</option>
                        <option value="EST">Eastern Standard Time</option>
                        <option value="IST">India Standard Time</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="date-format"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Date Format
                      </label>
                      <select
                        id="date-format"
                        name="date-format"
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                        defaultValue="MM/DD/YYYY"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab (Admin only) */}
            {activeTab === "system" && user?.role === "admin" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    System Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure system-wide settings and parameters.
                  </p>

                  <div className="mt-6 space-y-6">
                    <div>
                      <label
                        htmlFor="verification-period"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Verification Period (days)
                      </label>
                      <input
                        type="number"
                        name="verification-period"
                        id="verification-period"
                        defaultValue="30"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Auto-approve Small Projects
                        </label>
                        <p className="text-sm text-gray-500">
                          Automatically approve projects under 1000 credits
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Save System Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
