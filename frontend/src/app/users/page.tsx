"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { User } from "@/types";

const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@seacred.com",
    name: "John Admin",
    role: "admin",
    avatar: "/avatars/admin.jpg",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-08-20"),
  },
  {
    id: "2",
    email: "officer@seacred.com",
    name: "Jane Officer",
    role: "officer",
    avatar: "/avatars/officer.jpg",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-08-18"),
  },
  {
    id: "3",
    email: "project@seacred.com",
    name: "Mike Project",
    role: "project_authority",
    avatar: "/avatars/project.jpg",
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2024-08-15"),
  },
  {
    id: "4",
    email: "officer2@seacred.com",
    name: "Sarah Wilson",
    role: "officer",
    avatar: "/avatars/officer2.jpg",
    createdAt: new Date("2024-04-20"),
    updatedAt: new Date("2024-08-12"),
  },
  {
    id: "5",
    email: "project2@seacred.com",
    name: "Alex Thompson",
    role: "project_authority",
    avatar: "/avatars/project2.jpg",
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-08-10"),
  },
];

const roleColors = {
  admin: "bg-red-100 text-red-800",
  officer: "bg-blue-100 text-blue-800",
  project_authority: "bg-green-100 text-green-800",
};

const roleIcons = {
  admin: ShieldCheckIcon,
  officer: ClipboardDocumentListIcon,
  project_authority: UserIcon,
};

export default function UsersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Redirect if user doesn't have access
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = mockUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const userCounts = {
    total: mockUsers.length,
    admin: mockUsers.filter((u) => u.role === "admin").length,
    officer: mockUsers.filter((u) => u.role === "officer").length,
    project_authority: mockUsers.filter((u) => u.role === "project_authority")
      .length,
  };

  const handleDeleteUser = (userId: string) => {
    // In real app, this would be an API call
    console.log(`Deleting user ${userId}`);
  };

  const handleEditUser = (userId: string) => {
    // In real app, this would open an edit modal
    console.log(`Editing user ${userId}`);
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              User Management
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage user accounts, roles, and permissions across the platform.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => console.log("New user modal would open here")}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {userCounts.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Admins
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {userCounts.admin}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Officers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {userCounts.officer}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Project Authorities
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {userCounts.project_authority}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="officer">Officer</option>
              <option value="project_authority">Project Authority</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Created
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Last Updated
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredUsers.map((u) => {
                      const RoleIcon = roleIcons[u.role];
                      return (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <Image
                                  className="h-10 w-10 rounded-full"
                                  src={
                                    u.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      u.name
                                    )}&background=059669&color=fff`
                                  }
                                  alt={`${u.name} avatar`}
                                  width={40}
                                  height={40}
                                  unoptimized
                                />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {u.name}
                                </div>
                                <div className="text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <RoleIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  roleColors[u.role]
                                }`}
                              >
                                {u.role.replace("_", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {u.createdAt.toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {u.updatedAt.toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditUser(u.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              {u.id !== user?.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="mt-12 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No users found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or add a new user.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
