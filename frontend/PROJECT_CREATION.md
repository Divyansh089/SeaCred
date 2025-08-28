# Project Creation Feature

## Overview

The project creation feature allows project authorities to create new carbon credit projects through a comprehensive multi-step form. The system automatically assigns verification officers based on project location and type.

## Features

### Multi-Step Form

The project creation process is divided into 5 steps:

1. **Basic Information**

   - Project name
   - Project description
   - Project type (forestry, renewable energy, energy efficiency, methane capture, other)
   - Start and end dates

2. **Location & Details**

   - Address, city, state
   - Land area and unit
   - Estimated credits and price per credit

3. **Contact Information**

   - Contact person details (name, email, phone)
   - Technical details (methodology, baseline scenario, project scenario, monitoring plan)

4. **Land Images & Documents**

   - Land images upload (required)
   - Supporting documents upload (optional)
   - File preview and removal functionality

5. **Review & Submit**
   - Complete project summary
   - Assigned officer information
   - Final submission

### Officer Assignment System

The system automatically assigns verification officers based on:

- **Geographic jurisdiction**: Officers are assigned based on the project's state
- **Specialization**: Officers with matching project type expertise are prioritized
- **Fallback**: If no specialized officer is available, a general officer is assigned

### File Upload

- **Land Images**: Required for project verification

  - Supported formats: PNG, JPG, GIF
  - Multiple file upload support
  - Preview functionality
  - File removal capability

- **Supporting Documents**: Optional additional documentation
  - Supported formats: PDF, DOC, DOCX
  - Multiple file upload support
  - File list with removal capability

### Validation

Each step includes comprehensive validation:

- Required field validation
- File upload requirements
- Data format validation
- Progress tracking

## Technical Implementation

### File Structure

```
frontend/src/app/projects/new/
└── page.tsx                 # Main project creation page
```

### Key Components

- **Multi-step form navigation** with progress indicators
- **File upload components** with drag-and-drop support
- **Form validation** with error handling
- **Officer assignment logic** based on location and specialization
- **Responsive design** for mobile and desktop

### State Management

The form uses React state to manage:

- Current step progression
- Form data across all steps
- File uploads
- Officer assignment
- Validation status

### Integration

- Integrates with existing dashboard layout
- Uses existing UI components (Button, Card, Badge)
- Follows established design patterns
- Compatible with notification system

## Usage

### For Project Authorities

1. Navigate to the Projects page
2. Click "New Project" button
3. Fill out each step of the form
4. Upload required land images
5. Review and submit the project

### For Officers

1. Officers will be automatically assigned based on project location and type
2. Assigned officers receive project details for verification
3. Officers can access project information through the verification system

## Future Enhancements

- **GPS coordinates**: Add map integration for precise location selection
- **Real-time validation**: Server-side validation during form completion
- **Draft saving**: Allow users to save and resume project creation
- **Advanced officer assignment**: More sophisticated matching algorithms
- **Document templates**: Pre-filled forms for common project types
- **Integration with external APIs**: Address validation, document verification

## Security Considerations

- File upload size limits
- File type validation
- Secure file storage
- User authentication and authorization
- Data encryption for sensitive information

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Responsive design for all devices
- Clear error messages and validation feedback
