import { CarbonProjectModel } from '../../database/models/carbonProject.model';
import { IUserDocument } from '../../types';
import { Types } from 'mongoose';
import { UserModel } from '../../database/models/user.model';
import { VerificationReportModel } from '../../database/models/verificationReport.model';

// Create a new project
export const createProject = async (projectData: any, user: IUserDocument) => {
  const newProject = await CarbonProjectModel.create({
    ...projectData,
    projectAuthorityId: user._id, // Assign the current user as the authority
  });
  return newProject;
};

// Get a project by its ID
export const getProjectById = async (projectId: string) => {
  if (!Types.ObjectId.isValid(projectId)) {
    return null;
  }
  const project = await CarbonProjectModel.findById(projectId).populate('projectAuthorityId', 'name email');
  return project;
};

// Query for multiple projects with filtering and pagination
export const queryProjects = async (queryParams: any, user: IUserDocument) => {
  const { page = 1, limit = 10, status, projectType, search } = queryParams;
  const skip = (page - 1) * limit;

  // Build the filter query object
  const query: any = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  if (projectType && projectType !== 'all') {
    query.projectType = projectType;
  }

  if (search) {
    // Creates a case-insensitive regex search on both name and location
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  // Role-based filtering: Project Authorities only see their own projects
  if (user.role === 'project_authority') {
    query.projectAuthorityId = user._id;
  }
  
  // Officers only see projects assigned to them
  if (user.role === 'officer') {
    query.assignedOfficerId = user._id;
  }

  const projects = await CarbonProjectModel.find(query)
    .populate('projectAuthorityId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalItems = await CarbonProjectModel.countDocuments(query);
  
  return {
    data: projects,
    pagination: {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      limit: parseInt(limit, 10),
    },
  };
};

// Update a project by its ID
export const updateProjectById = async (projectId: string, updateBody: any, user: IUserDocument) => {
  const project = await getProjectById(projectId);
  if (!project) {
    return null;
  }

  // Authorization check: Only admin or the project's own authority can update
  if (user.role !== 'admin' && project.projectAuthorityId._id.toString() !== user._id.toString()) {
    throw new Error('User not authorized to update this project');
  }

  Object.assign(project, updateBody);
  await project.save();
  return project;
};

// Delete a project by its ID
export const deleteProjectById = async (projectId: string, user: IUserDocument) => {
  const project = await getProjectById(projectId);
  if (!project) {
    return null;
  }
  // Authorization check
  if (user.role !== 'admin' && project.projectAuthorityId._id.toString() !== user._id.toString()) {
    throw new Error('User not authorized to delete this project');
  }

  await project.deleteOne();
  return project;
};

const uploadFileToStorage = async (file: Express.Multer.File) => {
  console.log(`Uploading ${file.originalname}...`);
  // Replace this with your actual upload logic
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network latency
  // Return a mock URL
  return `https://storage.example.com/${Date.now()}-${file.originalname}`;
};

export const createProject = async (
  projectData: any,
  files: { documents?: Express.Multer.File[], landImages?: Express.Multer.File[] },
  user: IUserDocument
) => {
  // 1. Assign an officer
  const officers = await UserModel.find({
    role: 'officer',
    jurisdiction: projectData.location.state,
  });

  let assignedOfficer = null;
  if (officers.length > 0) {
    const specializedOfficer = officers.find(o => o.specialization?.includes(projectData.projectType));
    assignedOfficer = specializedOfficer || officers[0];
  }
  
  // 2. Handle file uploads
  const documentUploads = files.documents || [];
  const imageUploads = files.landImages || [];

  const [documentUrls, imageUrls] = await Promise.all([
    Promise.all(documentUploads.map(file => uploadFileToStorage(file))),
    Promise.all(imageUploads.map(file => uploadFileToStorage(file)))
  ]);

  const documents = documentUploads.map((file, index) => ({
    name: file.originalname,
    url: documentUrls[index],
  }));

  const landImages = imageUploads.map((file, index) => ({
    name: file.originalname,
    url: imageUrls[index],
  }));

  // 3. Create and save the new project
  const newProject = await CarbonProjectModel.create({
    ...projectData,
    documents,
    landImages,
    projectAuthorityId: user._id, // Assign the current user as the authority
    assignedOfficerId: assignedOfficer?._id || null, // Assign the found officer
    status: 'pending', // New projects should start as pending
    verificationStatus: 'pending',
  });
  
  return newProject;
};

export const assignProjectToOfficer = async (projectId: string, officer: IUserDocument) => {
  const project = await CarbonProjectModel.findById(projectId);
  if (!project) throw new Error('Project not found');
  if (project.assignedOfficerId) throw new Error('Project is already assigned');
  
  project.assignedOfficerId = officer._id;
  await project.save();
  return project;
};

// Submit a verification report and update project status
export const submitVerificationReport = async (projectId: string, reportData: any, officer: IUserDocument) => {
    const project = await CarbonProjectModel.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.assignedOfficerId?.toString() !== officer._id.toString()) {
        throw new Error('User is not assigned to this project');
    }

    const report = await VerificationReportModel.create({
        ...reportData,
        projectId: project._id,
        officerId: officer._id,
    });

    // Update project based on report status
    if (report.status === 'approved') {
        project.verificationStatus = 'verified';
        project.status = 'approved';
    } else if (report.status === 'rejected') {
        project.verificationStatus = 'rejected';
        project.status = 'rejected';
    }
    await project.save();

    return { report, project };
};