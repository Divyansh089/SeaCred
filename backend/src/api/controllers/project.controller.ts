import { Request, Response } from 'express';
import * as projectService from '../services/project.service';

export const createProjectHandler = async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.body, res.locals.user);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

export const getProjectsHandler = async (req: Request, res: Response) => {
  try {
    const filter = req.query; // You can add more specific filtering logic here
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    };
    const result = await projectService.queryProjects(filter, options);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

export const getProjectHandler = async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

export const updateProjectHandler = async (req: Request, res: Response) => {
  try {
    const project = await projectService.updateProjectById(req.params.id, req.body, res.locals.user);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error: any) {
    if (error.message.includes('not authorized')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

export const deleteProjectHandler = async (req: Request, res: Response) => {
  try {
    const project = await projectService.deleteProjectById(req.params.id, res.locals.user);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    if (error.message.includes('not authorized')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

export const createProjectHandler = async (req: Request, res: Response) => {
  try {
    // Reconstruct nested objects from the flat req.body
    const projectData = {
      name: req.body.name,
      description: req.body.description,
      projectType: req.body.projectType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      landArea: parseFloat(req.body.landArea),
      landAreaUnit: req.body.landAreaUnit,
      totalCredits: parseFloat(req.body.estimatedCredits), // Using estimatedCredits from frontend
      location: {
        address: req.body['location.address'],
        city: req.body['location.city'],
        state: req.body['location.state'],
        country: req.body['location.country'],
        // You would likely get coordinates from a geocoding API based on address
      },
      contactPerson: {
        name: req.body['contactPerson.name'],
        email: req.body['contactPerson.email'],
        phone: req.body['contactPerson.phone'],
      },
      technicalDetails: {
        methodology: req.body['technicalDetails.methodology'],
        baselineScenario: req.body['technicalDetails.baselineScenario'],
        projectScenario: req.body['technicalDetails.projectScenario'],
        monitoringPlan: req.body['technicalDetails.monitoringPlan'],
      }
    };

    const files = req.files as { documents?: Express.Multer.File[], landImages?: Express.Multer.File[] };
    const project = await projectService.createProject(projectData, files, res.locals.user);
    
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

export const getProjectsHandler = async (req: Request, res: Response) => {
  try {
    // The query parameters (e.g., /projects?search=Solar&status=active) are in req.query
    const result = await projectService.queryProjects(req.query, res.locals.user);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

export const assignProjectHandler = async (req: Request, res: Response) => {
    try {
        const project = await projectService.assignProjectToOfficer(req.params.id, res.locals.user);
        res.status(200).json(project);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};

export const submitReportHandler = async (req: Request, res: Response) => {
    try {
        const result = await projectService.submitVerificationReport(req.params.id, req.body, res.locals.user);
        res.status(201).json(result);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
};