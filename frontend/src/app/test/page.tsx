"use client";

import { useState, useEffect } from "react";
import { getAllProjects } from "@/lib/credit";
import { getVerificationStatusText, getVerificationStatusColor } from "@/types";

export default function TestPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedProjects, setApprovedProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const allProjects = await getAllProjects();
        console.log("Test page - All projects:", allProjects);
        setProjects(allProjects);
        
        // Test approved projects filtering
        const approved = allProjects.filter(project => 
          Number(project.verificationStatus) === 2 // 2 = APPROVED
        );
        console.log("Test page - Approved projects:", approved);
        setApprovedProjects(approved);
      } catch (error) {
        console.error("Test page - Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      inProgress: 0,
      verified: 0,
      rejected: 0
    };

    projects.forEach(project => {
      const statusNumber = Number(project.verificationStatus);
      console.log(`Test page - Project ${project.id}: status = ${project.verificationStatus}, number = ${statusNumber}`);
      
      if (statusNumber === 0) counts.pending++;
      else if (statusNumber === 1) counts.inProgress++;
      else if (statusNumber === 2) counts.verified++;
      else if (statusNumber === 3) counts.rejected++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <div className="p-8">Loading projects...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Project Data Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Status Counts</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-yellow-100 p-4 rounded">
            <div className="font-bold">Pending: {statusCounts.pending}</div>
          </div>
          <div className="bg-blue-100 p-4 rounded">
            <div className="font-bold">In Progress: {statusCounts.inProgress}</div>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <div className="font-bold">Verified: {statusCounts.verified}</div>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <div className="font-bold">Rejected: {statusCounts.rejected}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Approved Projects ({approvedProjects.length})</h2>
        <div className="space-y-4">
          {approvedProjects.map((project) => (
            <div key={project.id} className="border p-4 rounded bg-green-50">
              <div className="font-bold">{project.name}</div>
              <div className="text-sm text-gray-600">
                ID: {project.id} | 
                Status: {project.verificationStatus} | 
                Status Number: {Number(project.verificationStatus)} | 
                Status Text: {getVerificationStatusText(project.verificationStatus)}
              </div>
              <div className="text-sm text-gray-600">
                Assigned Officer: {project.assignedOfficer}
              </div>
              <div className="text-sm text-gray-600">
                Created: {new Date(project.createdAt * 1000).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">All Projects ({projects.length})</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border p-4 rounded">
              <div className="font-bold">{project.name}</div>
              <div className="text-sm text-gray-600">
                ID: {project.id} | 
                Status: {project.verificationStatus} | 
                Status Number: {Number(project.verificationStatus)} | 
                Status Text: {getVerificationStatusText(project.verificationStatus)}
              </div>
              <div className="text-sm text-gray-600">
                Assigned Officer: {project.assignedOfficer}
              </div>
              <div className="text-sm text-gray-600">
                Created: {new Date(project.createdAt * 1000).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
