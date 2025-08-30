"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddOfficerModal from "@/components/admin/AddOfficerModal";
import GrantAdminModal from "@/components/admin/GrantAdminModal";
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LeafIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { User } from "@/types";
import { getAllUsers, getAllOfficers, getUser, getRoles, getOfficer } from "@/lib/credit";

// Extended User interface for dynamic data
interface DynamicUser extends User {
  walletAddress?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  district?: string;
  isRegistered?: boolean;
  registeredAt?: number;
}

const roleColors = {
  admin: "bg-red-100 text-red-800",
  officer: "bg-blue-100 text-blue-800",
  user: "bg-green-100 text-green-800",
};

const roleIcons = {
  admin: ShieldCheckIcon,
  officer: ClipboardDocumentListIcon,
  user: UserIcon,
};

export default function UsersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [isGrantAdminModalOpen, setIsGrantAdminModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<DynamicUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from blockchain
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== "admin") return;
      
      setLoading(true);
      setError(null);
      
      try {
                 // Get all user addresses
         const userAddresses = await getAllUsers();
         const officerAddresses = await getAllOfficers();
         
         // Combine all addresses and remove duplicates
         let allAddresses = [...new Set([...userAddresses, ...officerAddresses])];
         
         // Ensure the admin address is included
         const adminAddress = '0xEa8315C53CC5C324e3F516d51bF91153aD94E40A';
         if (!allAddresses.includes(adminAddress)) {
           allAddresses.push(adminAddress);
         }
         
         console.log('All addresses to process:', allAddresses);
        
                 // Fetch detailed user information
         const userDetails = await Promise.all(
           allAddresses.map(async (address) => {
             try {
               // First check roles
               const { isAdmin, isOfficer } = await getRoles(address);
               console.log(`Address ${address}: isAdmin=${isAdmin}, isOfficer=${isOfficer}`);
               
               let role: string;
               let name: string;
               let email: string;
               let userData: any = {
                 firstName: "",
                 lastName: "",
                 phone: "",
                 district: "",
                 isRegistered: false,
                 registeredAt: 0,
                 email: ""
               };
               
                               // Try to get user data if not admin
                if (!isAdmin) {
                  try {
                    userData = await getUser(address);
                  } catch (userError) {
                    console.log(`Could not fetch user data for ${address}:`, userError);
                    // Continue with empty user data
                  }
                }
                
                // If it's an officer, try to get officer details
                let officerData: any = null;
                if (isOfficer) {
                  try {
                    officerData = await getOfficer(address);
                    console.log(`Officer data for ${address}:`, officerData);
                  } catch (officerError) {
                    console.log(`Could not fetch officer data for ${address}:`, officerError);
                  }
                }
               
               if (isAdmin) {
                 role = "admin";
                 name = "Administrator";
                 email = "admin@seacred.com";
                               } else if (isOfficer) {
                  role = "officer";
                  // Use officer data if available, otherwise fall back to user data or generic name
                  if (officerData && officerData.name) {
                    name = officerData.name;
                    email = "officer@seacred.com";
                  } else if (userData.firstName) {
                    name = `${userData.firstName} ${userData.lastName}`;
                    email = userData.email || "officer@seacred.com";
                  } else {
                    name = "Verification Officer";
                    email = "officer@seacred.com";
                  }
                } else {
                 role = "user";
                 if (userData.isRegistered) {
                   name = `${userData.firstName} ${userData.lastName}`;
                   email = userData.email;
                 } else {
                   name = "Unregistered User";
                   email = "unregistered@seacred.com";
                 }
               }
               
                               return {
                  id: address,
                  walletAddress: address,
                  name: name,
                  email: email,
                  role: role as 'admin' | 'officer' | 'user',
                  firstName: officerData ? officerData.name : userData.firstName,
                  lastName: userData.lastName,
                  phone: userData.phone,
                  district: userData.district,
                  isRegistered: userData.isRegistered,
                  registeredAt: userData.registeredAt,
                  createdAt: userData.registeredAt ? new Date(userData.registeredAt * 1000) : new Date(),
                  updatedAt: new Date(),
                };
             } catch (error) {
               console.error(`Error processing address ${address}:`, error);
               // Return a basic user object for addresses that can't be processed
               return {
                 id: address,
                 walletAddress: address,
                 name: `User ${address.slice(0, 6)}...${address.slice(-4)}`,
                 email: "unknown@seacred.com",
                 role: "user" as const,
                 createdAt: new Date(),
                 updatedAt: new Date(),
               };
             }
           })
                  );
         
         console.log('Final user details:', userDetails);
         setUsers(userDetails);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.role]);

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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.walletAddress && u.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const userCounts = {
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    officer: users.filter((u) => u.role === "officer").length,
    user: users.filter((u) => u.role === "user").length,
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
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight">
              User Management
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Manage user accounts, roles, and permissions across the platform.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={loading}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setIsGrantAdminModalOpen(true)}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <ShieldCheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                Grant Admin
              </button>
              <button
                type="button"
                onClick={() => setIsAddOfficerModalOpen(true)}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                Add Officer
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userCounts.total}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{userCounts.admin}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Officers</p>
                <p className="text-2xl font-bold text-gray-900">{userCounts.officer}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Users</p>
                <p className="text-2xl font-bold text-gray-900">{userCounts.user}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-green-600" />
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
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users from blockchain...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm || selectedRole !== "all" 
                        ? "Try adjusting your search or filter criteria"
                        : "Users will appear here once they register or are added as officers"
                      }
                    </p>
                  </div>
                ) : (
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
                          Wallet Address
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Registration Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Created
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
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {u.walletAddress ? `${u.walletAddress.slice(0, 6)}...${u.walletAddress.slice(-4)}` : 'N/A'}
                              </code>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                u.isRegistered 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {u.isRegistered ? 'Registered' : 'Unregistered'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {u.createdAt ? u.createdAt.toLocaleDateString() : 'N/A'}
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Officer Modal */}
        <AddOfficerModal
          isOpen={isAddOfficerModalOpen}
          onClose={() => setIsAddOfficerModalOpen(false)}
          onSuccess={() => {
            // Refresh the data when an officer is added
            window.location.reload();
          }}
        />

        {/* Grant Admin Modal */}
        <GrantAdminModal
          isOpen={isGrantAdminModalOpen}
          onClose={() => setIsGrantAdminModalOpen(false)}
          onSuccess={() => {
            // Refresh the data when admin role is granted
            window.location.reload();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
