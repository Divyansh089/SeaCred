"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAllProjects, getUser, getOfficer, removeProject, startVerification } from "@/lib/credit";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { 
  UserIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LeafIcon,
  BoltIcon,
  UsersIcon
} from "@heroicons/react/24/outline";

interface UserInfo {
  walletAddress: string;
  firstName: string;
  lastName: string;
  district: string;
  phone: string;
  email: string;
  projectCount: number;
  projects: ProjectInfo[];
}

interface ProjectInfo {
  id: number;
  name: string;
  city: string;
  state: string;
  verificationStatus: number;
  createdAt: number;
}

interface CityGroup {
  city: string;
  state: string;
  users: UserInfo[];
}

export default function AssignedUsersPage() {
  const { user, walletAddress } = useAuth();
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerDetails, setOfficerDetails] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role !== "officer" || !walletAddress) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch officer details
        const officerData = await getOfficer(walletAddress);
        setOfficerDetails(officerData);

        // Fetch all projects
        const allProjects = await getAllProjects();
        
        // Filter projects assigned to this officer
        const officerProjects = allProjects.filter(project => 
          project.assignedOfficer?.toLowerCase() === walletAddress.toLowerCase()
        );

        // Group users by city
        const userMap = new Map<string, UserInfo>();
        const cityMap = new Map<string, CityGroup>();

        for (const project of officerProjects) {
          try {
            const userDetails = await getUser(project.owner);
            
            if (!userDetails.isRegistered) continue;

            const userKey = project.owner.toLowerCase();
            const cityKey = `${project.city}-${project.state}`;

            if (!userMap.has(userKey)) {
              userMap.set(userKey, {
                walletAddress: project.owner,
                firstName: userDetails.firstName,
                lastName: userDetails.lastName,
                district: userDetails.district,
                phone: userDetails.phone,
                email: userDetails.email,
                projectCount: 0,
                projects: []
              });
            }

            const userInfo = userMap.get(userKey)!;
            userInfo.projectCount++;
            userInfo.projects.push({
              id: project.id,
              name: project.name,
              city: project.city,
              state: project.state,
              verificationStatus: project.verificationStatus,
              createdAt: project.createdAt
            });

            if (!cityMap.has(cityKey)) {
              cityMap.set(cityKey, {
                city: project.city,
                state: project.state,
                users: []
              });
            }

            const cityGroup = cityMap.get(cityKey)!;
            if (!cityGroup.users.find(u => u.walletAddress.toLowerCase() === userKey)) {
              cityGroup.users.push(userInfo);
            }
          } catch (error) {
            console.error(`Error fetching user details for ${project.owner}:`, error);
          }
        }

        // Convert map to array and sort
        const cityGroupsArray = Array.from(cityMap.values()).sort((a, b) => 
          `${a.city}, ${a.state}`.localeCompare(`${b.city}, ${b.state}`)
        );

        // Sort users within each city
        cityGroupsArray.forEach(cityGroup => {
          cityGroup.users.sort((a, b) => 
            `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
          );
        });

        setCityGroups(cityGroupsArray);
      } catch (error) {
        console.error("Error fetching assigned users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.role, walletAddress]);

  const handleStartVerification = async (project: ProjectInfo) => {
    try {
      console.log("Starting verification for project:", project.id);
      await startVerification(project.id);
      console.log("Verification started successfully");
      
      // Update the project status in the UI
      setCityGroups(prev => {
        return prev.map(cityGroup => ({
          ...cityGroup,
          users: cityGroup.users.map(user => ({
            ...user,
            projects: user.projects.map(p => 
              p.id === project.id 
                ? { ...p, verificationStatus: 1 } // Set to IN_PROGRESS
                : p
            )
          }))
        }));
      });
    } catch (error) {
      console.error("Error starting verification:", error);
    }
  };

  const handleRejectProject = (project: ProjectInfo) => {
    setSelectedProject(project);
    setShowRejectModal(true);
  };

  const toggleUserExpansion = (userAddress: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userAddress)) {
        newSet.delete(userAddress);
      } else {
        newSet.add(userAddress);
      }
      return newSet;
    });
  };

  const confirmReject = async () => {
    if (!selectedProject || !rejectReason.trim()) return;

    setRejecting(true);
    try {
      console.log("Rejecting project:", selectedProject.id, "Reason:", rejectReason);
      
      // Remove the specific project
      await removeProject(selectedProject.id);
      console.log("Project removed successfully");
      
      // Remove project from the user's project list
      setCityGroups(prev => {
        return prev.map(cityGroup => ({
          ...cityGroup,
          users: cityGroup.users.map(user => ({
            ...user,
            projects: user.projects.filter(p => p.id !== selectedProject.id),
            projectCount: user.projects.filter(p => p.id !== selectedProject.id).length
          })).filter(user => user.projectCount > 0)
        })).filter(cityGroup => cityGroup.users.length > 0);
      });

      setShowRejectModal(false);
      setSelectedProject(null);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting project:", error);
      // You might want to show an error notification here
    } finally {
      setRejecting(false);
    }
  };

  const getVerificationStatusText = (status: number) => {
    const statusMap = {
      0: "Pending",
      1: "In Progress", 
      2: "Approved",
      3: "Rejected"
    };
    return statusMap[status as keyof typeof statusMap] || "Unknown";
  };

  const getVerificationStatusBadge = (status: number) => {
    const statusMap = {
      0: { text: "Pending", color: "bg-yellow-100 text-yellow-800" },
      1: { text: "In Progress", color: "bg-blue-100 text-blue-800" },
      2: { text: "Approved", color: "bg-green-100 text-green-800" },
      3: { text: "Rejected", color: "bg-red-100 text-red-800" }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap[0];
    return <Badge className={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  // Filter city groups based on search term and selected city
  const filteredCityGroups = cityGroups.filter(cityGroup => {
    // Filter by selected city
    if (selectedCity !== "all" && `${cityGroup.city}-${cityGroup.state}` !== selectedCity) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const hasMatchingUser = cityGroup.users.some(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return hasMatchingUser;
    }
    
    return true;
  });

  // Get unique cities for filter dropdown
  const uniqueCities = cityGroups.map(cityGroup => ({
    value: `${cityGroup.city}-${cityGroup.state}`,
    label: `${cityGroup.city}, ${cityGroup.state}`
  }));

  // Calculate statistics
  const totalUsers = cityGroups.reduce((sum, cityGroup) => sum + cityGroup.users.length, 0);
  const totalProjects = cityGroups.reduce((sum, cityGroup) => 
    sum + cityGroup.users.reduce((userSum, user) => userSum + user.projectCount, 0), 0
  );
  const totalCities = cityGroups.length;

  if (user?.role !== "officer") {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              This page is only accessible to verification officers.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assigned users...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Assigned Users</h1>
          <p className="text-lg text-gray-600 mb-4">
            Manage users and their projects assigned to you for verification. Start verification processes and document rejection reasons.
          </p>
          {officerDetails && (
            <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <BuildingOfficeIcon className="h-4 w-4 mr-2 text-green-600" />
              <span className="font-medium">Officer: {officerDetails.name} • Area: {officerDetails.area}</span>
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                {cityGroups.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No users assigned yet</p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                {cityGroups.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No projects to verify</p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cities Covered</p>
                <p className="text-2xl font-bold text-gray-900">{totalCities}</p>
                {cityGroups.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Based on your jurisdiction</p>
                )}
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={cityGroups.length > 0 ? "Search by name, email, phone, or district..." : "Search will be available when users are assigned..."}
                disabled={cityGroups.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div className="sm:w-64">
              <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by City
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={cityGroups.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="all">
                  {cityGroups.length > 0 ? "All Cities" : "No cities available"}
                </option>
                {uniqueCities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {cityGroups.length === 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="h-3 w-3 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Search and filter options will become available once users are assigned to you for verification.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {cityGroups.length === 0 ? (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <UserIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Assigned Users</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This is where you'll manage users and their projects assigned to you for verification. You can start verification processes and document rejection reasons for admin review.
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Ready to receive assignments
                </div>
              </div>
            </Card>

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">How Users Get Assigned</h4>
                    <p className="text-xs text-gray-600">
                      Users are automatically assigned to you based on your jurisdiction and area of responsibility. 
                      When projects are created in your area, the users will appear here.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Your Responsibilities</h4>
                    <p className="text-xs text-gray-600">
                      Review project documentation, conduct verifications, and distribute carbon credits to approved users. 
                      You can also reject applications if they don't meet requirements.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <CheckIcon className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-700">Review Projects</span>
                </div>
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <ClipboardDocumentCheckIcon className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-700">Verify Documents</span>
                </div>
                <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-6 w-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <CurrencyDollarIcon className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-700">Distribute Credits</span>
                </div>
              </div>
            </Card>
          </div>
        ) : filteredCityGroups.length === 0 ? (
          <Card className="p-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">No matching users found</h3>
              <p className="text-sm text-gray-600 mb-4">
                Try adjusting your search terms or city filter to find the users you're looking for.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="text-xs"
                >
                  Clear Search
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCity("all")}
                  className="text-xs"
                >
                  Show All Cities
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredCityGroups.map((cityGroup) => (
              <Card key={`${cityGroup.city}-${cityGroup.state}`} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {cityGroup.city}, {cityGroup.state}
                    </h2>
                    <Badge className="ml-3 bg-blue-100 text-blue-800">
                      {cityGroup.users.length} user{cityGroup.users.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4">
                  {cityGroup.users.map((user) => (
                    <div
                      key={user.walletAddress}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                <EnvelopeIcon className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                              <div className="flex items-center">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {user.phone}
                              </div>
                              <div className="flex items-center">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {user.district}
                              </div>
                            </div>
                            <div className="mt-2">
                              <Badge className="bg-gray-100 text-gray-800">
                                {user.projectCount} project{user.projectCount !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-gray-100 text-gray-800">
                            {user.projectCount} project{user.projectCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>

                                             {/* Project List */}
                       <div className="mt-4 border-t border-gray-100 pt-4">
                         <button
                           onClick={() => toggleUserExpansion(user.walletAddress)}
                           className="flex items-center justify-between w-full text-left text-xs font-medium text-gray-700 hover:text-gray-900"
                         >
                           <span>Projects ({user.projectCount})</span>
                           <svg
                             className={`h-4 w-4 transform transition-transform ${
                               expandedUsers.has(user.walletAddress) ? 'rotate-180' : ''
                             }`}
                             fill="none"
                             viewBox="0 0 24 24"
                             stroke="currentColor"
                           >
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                         </button>
                         
                                                   {expandedUsers.has(user.walletAddress) && (
                            <div className="mt-3 space-y-3">
                              {user.projects.map((project) => (
                                <div
                                  key={project.id}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-sm font-medium text-gray-900">{project.name}</h5>
                                    <div className="flex items-center space-x-2">
                                      {getVerificationStatusBadge(project.verificationStatus)}
                                      {project.verificationStatus === 0 && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleStartVerification(project)}
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-2 py-1"
                                        >
                                          <ClipboardDocumentCheckIcon className="h-3 w-3 mr-1" />
                                          Start Verification
                                        </Button>
                                      )}
                                      {project.verificationStatus === 1 && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleRejectProject(project)}
                                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-2 py-1"
                                        >
                                          <XMarkIcon className="h-3 w-3 mr-1" />
                                          Reject
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>
                                      <span className="font-medium">Location:</span> {project.city}, {project.state}
                                    </div>
                                    <div>
                                      <span className="font-medium">Created:</span> {new Date(project.createdAt * 1000).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Project Rejection Notice</h3>
                <div className="mt-2 px-7 py-3">
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800 font-medium">Permission Required</p>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Project rejection requires admin permissions. Please contact an administrator to reject this project.
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Project: <span className="font-medium">"{selectedProject.name}"</span>
                  </p>
                  <div className="p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                    <div><strong>Location:</strong> {selectedProject.city}, {selectedProject.state}</div>
                    <div><strong>Created:</strong> {new Date(selectedProject.createdAt * 1000).toLocaleDateString()}</div>
                    <div><strong>Status:</strong> {getVerificationStatusText(selectedProject.verificationStatus)}</div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for rejection (for admin reference):
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Please provide a reason for rejecting this project..."
                    />
                  </div>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedProject(null);
                      setRejectReason("");
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log("Rejection reason documented:", rejectReason);
                      setShowRejectModal(false);
                      setSelectedProject(null);
                      setRejectReason("");
                    }}
                    disabled={!rejectReason.trim()}
                  >
                    Document Reason
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
