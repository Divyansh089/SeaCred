# SeaCred - Carbon Credit Verification Platform

A comprehensive carbon credit verification and distribution platform built with Next.js, TypeScript, and Tailwind CSS. This platform enables different user roles to manage carbon credit projects, verify submissions, and distribute credits through blockchain technology.

## Features

### 🌱 Multi-Role Dashboard System

- **Admin**: Complete system oversight and user management
- **Verification Officers**: Project verification and compliance checking
- **Project Authorities**: Project creation and management

### 📊 Dashboard & Analytics

- Real-time statistics and KPIs
- Interactive charts showing credit issuance and project trends
- Activity feeds and notifications
- Role-specific metrics and insights

### 🏗️ Project Management

- Create and submit carbon credit projects
- Project type categorization (Forestry, Renewable Energy, etc.)
- Document upload and management
- Status tracking (Pending, Approved, Active, etc.)
- Verification workflow integration

### ✅ Verification System

- Comprehensive verification workflow
- Officer assignment and task management
- Document review and compliance checking
- Approval/rejection with detailed notes
- Status tracking and audit trails

### 💰 Carbon Credit Distribution

- Credit distribution management
- Blockchain-based credit issuance
- Officer and authority share allocation
- Secure wallet integration
- Distribution history tracking

### 👥 User Management (Admin Only)

- User role assignment and permissions
- Account creation and management
- Activity monitoring
- Security settings

### ⚙️ Settings & Preferences

- Profile management
- Notification preferences
- Security settings (password, 2FA)
- System configurations (Admin only)
- Language and timezone settings

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons & Lucide React
- **Charts**: Recharts
- **Authentication**: Context-based auth system
- **State Management**: React Hooks & Context API

## Demo Accounts

The platform includes three demo accounts for testing different roles:

| Role                 | Email               | Password    | Access Level           |
| -------------------- | ------------------- | ----------- | ---------------------- |
| Admin                | admin@seacred.com   | password123 | Full system access     |
| Verification Officer | officer@seacred.com | password123 | Verification workflows |
| Project Authority    | project@seacred.com | password123 | Project management     |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SeaCred/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Login with demo account**
   Use any of the demo accounts listed above to explore the platform

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── projects/          # Projects management
│   ├── credits/           # Carbon credits page
│   ├── verifications/     # Verification workflows
│   ├── users/             # User management (Admin)
│   ├── settings/          # Settings page
│   ├── login/             # Authentication
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page with routing
├── components/
│   ├── layout/            # Layout components
│   │   └── DashboardLayout.tsx
│   ├── dashboard/         # Dashboard components
│   │   ├── ActivityFeed.tsx
│   │   └── StatsCard.tsx
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── verification/      # Verification components
│   │   ├── WorkflowManager.tsx
│   │   └── VerificationReportForm.tsx
│   ├── blockchain/        # Blockchain components
│   │   └── BlockchainManager.tsx
│   └── ai/                # AI components
│       └── AIVerificationPanel.tsx
├── contexts/
│   ├── AuthContext.tsx    # Authentication context
│   └── NotificationContext.tsx
├── hooks/
│   └── usePerformance.ts  # Performance monitoring
├── types/
│   └── index.ts           # TypeScript type definitions
└── utils/
    └── performance.ts     # Performance utilities
```

## Key Features

### 🔍 AI-Powered Verification

- Automated image analysis for land assessment
- Document compliance checking
- Risk assessment and recommendations
- Quality assurance automation

### 📋 Role-Based Workflow

- 8-step verification process
- Role-specific permissions and access
- Dependency management between steps
- Real-time progress tracking

### 📊 Comprehensive Reporting

- Detailed land documentation
- Image and document management
- Officer assessments and evaluations
- Credit calculation and methodology

### ⛓️ Blockchain Integration

- Secure credit minting and distribution
- Transparent transaction records
- Configurable share allocation
- Wallet integration and management

### 🛡️ Quality Assurance

- Multi-stage verification process
- AI-assisted validation
- Officer oversight and approval
- Complete audit trails

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@seacred.com or create an issue in the repository.
