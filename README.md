#  Medicare - Pharmacy Management System

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.9-brightgreen)
![Angular](https://img.shields.io/badge/Angular-21.0.0-red)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

A full-stack pharmacy management application built with Spring Boot (backend) and Angular (frontend). This system provides a complete pharmacy workflow including patient management, prescription processing, appointment scheduling, and pharmacy inventory management.



## Application Overview

The Pharmacy Management System is a multi-role application that enables different healthcare professionals to manage their daily operations efficiently. The system supports four distinct user roles: **Administrators**, **Pharmacists**, **Prescribers (Doctors)**, and **Patients**.

### Core Features

The application provides comprehensive pharmacy operations including patient registration and profile management, prescription creation and lifecycle management, appointment scheduling between patients and prescribers, medication inventory tracking with stock management, and a complete pharmacy workflow from prescription creation to dispensing. Each feature is role-specific, ensuring that users only have access to the functionality relevant to their responsibilities.

---

## Architecture

### Backend Architecture

```
pharmacy-backend/
├── src/main/java/proj/omotoyeb/pharmacy/
│   ├── config/           # Security and JWT configuration
│   ├── controller/       # REST API endpoints
│   ├── dto/              # Data Transfer Objects
│   ├── exception/        # Custom exceptions
│   ├── model/            # JPA Entity classes
│   ├── repository/       # Data access layer
│   └── service/          # Business logic layer
└── src/main/resources/
    ├── db/migration/     # Flyway database migrations
    └── application.properties
```

The backend follows a standard Spring Boot layered architecture. The **Controller layer** handles HTTP requests and responses, routing them to appropriate services. The **Service layer** contains business logic and validation. The **Repository layer** provides data access through Spring Data JPA interfaces. The **Model layer** defines JPA entities that map to database tables.

### Frontend Architecture

```
pharmacy-frontend/
├── src/app/
│   ├── components/       # Angular components (views)
│   ├── models/           # TypeScript interfaces
│   ├── services/         # API client services
│   ├── interceptors/     # HTTP interceptors (auth)
│   └── guards/           # Route protection guards
└── src/styles.scss       # Global styles
```

The frontend is built with Angular's modern component-based architecture. The **Service layer** handles all HTTP communication with the backend, while **Components** manage UI logic and data presentation. **Guards** protect routes based on user roles, and **Interceptors** automatically attach JWT tokens to outgoing requests.

---

## User Roles & Responsibilities

### Administrator

Administrators have full access to the system and are responsible for managing staff members, viewing audit logs, and overseeing system operations. The admin role includes the ability to add new staff members or patients, deactivate accounts, and monitor all activities within the system through the audit logging feature.

### Pharmacist

Pharmacists manage the pharmacy workflow and are responsible for reviewing prescriptions submitted by prescribers. Their workflow includes approving valid prescriptions, denying prescriptions with appropriate reasons, dispensing medications to patients, managing medication inventory, and tracking refill dates. The pharmacist dashboard provides real-time visibility into pending prescriptions awaiting approval and approved prescriptions ready for dispensing.

### Prescriber (Doctor)

Prescribers create prescriptions for patients during or after appointments. Their capabilities include viewing their appointment schedule, creating new prescriptions with medication details and instructions (sig), reviewing their prescription history, and accessing patient information for those with scheduled appointments. The prescriber dashboard organizes their workflow with tabs for overview, appointments, and prescriptions.

### Patient

Patients have access to their personal health information through a dedicated dashboard. They can view their profile and update personal information, review their prescription history and current medications, check upcoming and past appointment records, and manage clinical information such as allergies and conditions. The patient profile includes comprehensive sections for demographics, emergency contacts, communication preferences, and clinical profiles.

---

## Prescription Workflow

The pharmacy system implements a complete prescription lifecycle with the following stages:

### 1. Prescription Creation

Prescribers create prescriptions through the prescriber dashboard. Each prescription includes patient identification, medication selection from inventory, dosage instructions (sig), quantity, and allowed refills. Upon creation, the prescription status is set to **PENDING** and awaits pharmacist review.

### 2. Pharmacist Review

Pharmacists review pending prescriptions through their dashboard. They have three actions available: **Approve** the prescription (moving it to APPROVED status), **Deny** the prescription with a reason (moving it to DENIED status), or defer action until more information is available.

### 3. Dispensing

Once a prescription is approved, it appears in the "Ready to Dispense" section of the pharmacist dashboard. When dispensing, the pharmacist selects the prescription, the system verifies stock availability, decrements medication inventory, records the dispensing event, sets the prescription status to **DISPENSED**, and calculates the next refill date based on the days supply.

### 4. Refill Management

Dispensed prescriptions track refill dates. The system helps pharmacists identify prescriptions eligible for refills and manages the refills remaining count, automatically decrementing with each dispensing event.

---

## Database Schema

### Core Tables

**patients**: Stores patient demographic and authentication information including name, contact details, date of birth, sex, address, emergency contacts, and credentials for login.

**staff**: Contains staff member records with role-based access (ADMIN, PHARMACIST, PRESCRIBER), license numbers, contact information, and authentication credentials.

**prescribers**: Links staff members to prescriber profiles, storing prescriber-specific information like specialty, license number, and contact details.

**medications**: Maintains drug inventory with name, code, form (tablet, capsule), route (oral, topical), strength, category, availability status, and stock quantity.

**prescriptions**: The central entity connecting patients to medications through prescribers. Includes sig instructions, quantity, refills remaining, dates (prescribed, expiration, dispensed, refill), status (PENDING, APPROVED, DISPENSED, DENIED), and workflow fields for pharmacist tracking.

**appointments**: Records patient-prescriber appointments with start time, end time, reason, and status.

**dispense_events**: Audit trail table tracking all prescription workflow events including approval, denial, and dispensing with timestamps, pharmacist identification, and notes.

**audit_logs**: System-wide audit trail recording all significant actions for compliance and troubleshooting.

### Database Migrations

The system uses Flyway for database migrations with 40 migration files (V1 through V138). These migrations handle schema creation, initial data seeding, authentication column additions, workflow field additions, and various fixes and refactorings throughout development.

---

## Authentication & Security

### JWT-Based Authentication

The application uses JSON Web Tokens (JWT) for secure authentication. Upon successful login, the server generates a JWT token containing user claims (user ID, role, username). This token must be included in the Authorization header for all subsequent API requests.

### Security Configuration

Spring Security handles authentication at the backend, supporting both staff and patient authentication through a unified login endpoint. The system uses BCrypt password encoding for secure credential storage and implements role-based access control with different authorities for each user role.

### Token Management

The frontend stores the JWT token in localStorage and automatically attaches it to all HTTP requests through an interceptor. The token includes expiration information, and the frontend maintains reactive state about the current user's session through a BehaviorSubject.

---

## Getting Started

### Prerequisites

The system requires Java 21 or higher for the backend, Node.js and npm for the frontend, and MySQL 8.0 for the database.

### Backend Setup

Navigate to the backend directory and ensure your MySQL database is running. Configure the database connection in application.properties if needed. Run the application using Maven wrapper (./mvnw) or your IDE. Flyway will automatically apply all database migrations on startup.

### Frontend Setup

Navigate to the frontend directory and install dependencies with npm install. Start the Angular development server with npm start. The application will be available at http://localhost:4200.

### Default Credentials

Test accounts are available for each role. Refer to USER_CREDENTIALS.md for the complete list of test users and their passwords.

---

## API Endpoints

### Authentication

**POST /api/auth/login** - Authenticates users and returns JWT token

### Patients

**GET /api/patients** - Lists all patients (staff access)
\
**GET /api/patients/{id}** - Retrieves patient by ID
\
**POST /api/patients** - Creates new patient
\
**PUT /api/patients/{id}** - Updates patient profile
\
**DELETE /api/patients/{id}** - Removes patient

### Prescriptions

**GET /api/prescriptions** - Lists all prescriptions
\
**GET /api/prescriptions/patient/{patientId}** - Patient's prescriptions
\
**GET /api/prescriptions/prescriber/{prescriberId}** - Prescriber's prescriptions
\
**GET /api/prescriptions/pending** - Prescriptions awaiting approval
\
**GET /api/prescriptions/ready-to-dispense** - Approved prescriptions
\
**POST /api/prescriptions** - Creates new prescription
\
**POST /api/prescriptions/{id}/approve** - Pharmacist approves
\
**POST /api/prescriptions/{id}/deny** - Pharmacist denies
\
**POST /api/prescriptions/{id}/dispense** - Pharmacist dispenses
\
**GET /api/prescriptions/{id}/history** - Dispense event history

### Appointments

**GET /api/appointments/patient/{patientId}** - Patient's appointments
\
**GET /api/appointments/doctor/{prescriberId}** - Prescriber's appointments
\
**POST /api/appointments** - Creates appointment
\
**PUT /api/appointments/{id}** - Updates appointment
\
**DELETE /api/appointments/{id}** - Cancels appointment

### Medications

**GET /api/medications** - Lists all medications with inventory
\
**GET /api/medications/{id}** - Medication details

---

## Frontend Components

### Dashboard Components

**admin-dashboard** - Administrative overview and staff management
\
**prescriber-dashboard** - Doctor view with appointments and prescription creation
\
**pharmacist-dashboard** - Pharmacy workflow management with approval/dispense functions
\
**patient-dashboard** - Patient's personal health portal

### Patient Management

**patient-list** - Searchable list of all patients
\
**patient-details** - Detailed patient profile view
\
**add-patient** - New patient registration form
\
**patient-header** - Navigation and user info header

### Clinical Features

**clinical-history** - Patient's allergies, conditions, and measurements\
**insurance-card** - Insurance information management\
**appointment-booking** - Appointment scheduling interface\
**prescriptions-list** - Prescription history and status view

### Authentication

**login** - Secure login form with role-based redirect\
**auth-debug** - Development tool for authentication troubleshooting

---

## Screenshots

Below are screenshots showcasing the main functionality of the Medicare Pharmacy Management System. Click on any image to enlarge it.

---

### Authentication

| Screenshot | Description |
|------------|-------------|
| ![Login Page](docs/screenshots/login-page.png) | **Login Page** - Secure authentication portal supporting all user roles (Admin, Pharmacist, Prescriber, Patient). Features role-based redirect after successful login. |

---

### Admin Dashboard

| Screenshot | Description |
|------------|-------------|
| ![Admin Overview](docs/screenshots/admin-overview.png) | **Admin Dashboard Overview** - Central hub for administrative operations showing system statistics, recent activities, and quick access to staff and drug management. |
| ![Staff Management](docs/screenshots/admin-staff-list.png) | **Staff Management** - Complete staff directory with role filtering (Admin, Pharmacist, Prescriber), status indicators, and quick actions for each member. |
| ![Add Staff](docs/screenshots/add-staff.png) | **Add New Staff** - Staff registration form for adding new administrators, pharmacists, or prescribers to the system with role assignment. |
| ![Audit Logs](docs/screenshots/admin-audit-logs.png) | **System Audit Logs** - Comprehensive audit trail of all system activities including patient record access, prescription events, and staff operations for compliance. |
| ![Drug List](docs/screenshots/admin-drug-list.png) | **Medication Inventory** - Admin view of all medications in the system with stock levels, drug details, and category information. |

---

### Pharmacist Dashboard

| Screenshot | Description |
|------------|-------------|
| ![Pharmacist Overview](docs/screenshots/pharmacist-overview.png) | **Pharmacist Dashboard Overview** - Main pharmacy workflow view with pending prescriptions count, ready-to-dispense queue, and recent dispensing activity. |
| ![Pending Prescriptions](docs/screenshots/pharmacist-pending.png) | **Pending Prescriptions Queue** - Prescriptions awaiting pharmacist review. Each card shows patient name, medication details, prescriber information, and action buttons (Approve/Deny). |
| ![Deny Prescription](docs/screenshots/pharmacist-deny.png) | **Deny Prescription Modal** - Reason capture for prescription denial, ensuring proper documentation of why a prescription was not filled. |
| ![Ready to Dispense](docs/screenshots/pharmacist-ready-dispense.png) | **Ready to Dispense Queue** - Approved prescriptions waiting for patient pickup. Shows medication details, patient information, and days supply. |
| ![Dispense Modal](docs/screenshots/pharmacist-dispense-modal.png) | **Dispense Medication Modal** - Final dispensing workflow where pharmacists confirm medication pickup, set days supply, and calculate refill dates. |
| ![Dispense History](docs/screenshots/pharmacist-dispense-history.png) | **Dispensed Prescriptions History** - Complete history of all dispensed medications with refill tracking, pharmacist attribution, and dispense event details. |

---

### Prescriber Dashboard

| Screenshot | Description |
|------------|-------------|
| ![Prescriber Overview](docs/screenshots/prescriber-overview.png) | **Prescriber Dashboard Overview** - Daily summary showing today's appointments, prescriptions written, and quick access to patient charts. |
| ![Write Prescription](docs/screenshots/prescriber-write-rx.png) | **Write Prescription Modal** - Complete prescription creation form with medication search, sig instructions builder, quantity selector, and refill configuration. |
| ![Prescription History](docs/screenshots/prescriber-rx-history.png) | **Prescription History** - All prescriptions written by the prescriber with status tracking (Pending, Approved, Dispensed, Denied) and patient names. |
| ![My Patients](docs/screenshots/prescriber-patients.png) | **My Patients** - Quick access list of patients with recent appointments, showing name, last visit, and primary concerns. |
| ![Appointments](docs/screenshots/prescriber-appointment.png) | **Appointments View** - Appointment calendar showing scheduled visits with patient names, dates/times, and reason for visit. |

---

### Patient Dashboard

| Screenshot | Description |
|------------|-------------|
| ![Patient Overview](docs/screenshots/patient-overview.png) | **Patient Dashboard Overview** - Personal health portal showing profile, appointments, prescriptions, and clinical history in one unified view. |
| ![My Prescriptions](docs/screenshots/patient-prescriptions.png) | **My Prescriptions** - Personal medication list showing current prescriptions with status, prescribed date, refills remaining, and medication details. |
| ![Edit Profile](docs/screenshots/patient-edit-profile.png) | **Edit Profile** - Form for updating personal information with validation for required fields and real-time save capability. |

---

### Patient Management (Admin/Staff Views)

| Screenshot | Description |
|------------|-------------|
| ![Patient List](docs/screenshots/patient-list.png) | **Patient List** - Searchable, sortable table of all registered patients with quick actions for viewing details, editing records, or scheduling appointments. |
| ![Patient Details](docs/screenshots/patient-details.png) | **Patient Details View** - Comprehensive patient record combining demographics, medical history, prescriptions, appointments, and insurance information in one view. |
| ![Add Patient](docs/screenshots/add-patient.png) | **Add New Patient** - Complete patient registration form with all required fields, address formatting, and emergency contact entry. |

---

### Appointment Booking

| Screenshot | Description |
|------------|-------------|
| ![Book Appointment](docs/screenshots/book-appointment.png) | **Book Appointment Form** - Scheduling interface for creating new appointments with prescriber selection, date/time picker, and reason for visit. |

---

> **Note**: Some UI elements are consolidated into single views (e.g., patient profile, appointments, and clinical history appear together on the patient dashboard). The application is desktop-optimized.

---

## Configuration

### Backend Configuration (application.properties)

Key settings include server port (default 8081), database connection (MySQL), JWT secret and expiration, and Flyway migration settings.

### Frontend Configuration

The API base URL is configured in the auth and patient services to point to http://localhost:8081/api.

---

## Audit Trail

All significant actions are logged to the audit_logs table, including patient record access and modifications, prescription creation and workflow events, authentication attempts, and staff operations. This provides a complete audit trail for compliance and troubleshooting purposes.

---

## Technology Stack

### Backend Technologies

The backend is built with Spring Boot 3.5.9 using Java 21. It uses Spring Data JPA for ORM, MySQL as the database, Flyway for database migrations, Spring Security with JWT for authentication, and Maven as the build tool.

### Frontend Technologies

The frontend uses Angular 21 with TypeScript, RxJS for reactive state management, SCSS for styling, and Angular's built-in HTTP client for API communication.

---

## Development Notes

### Database Evolution

The database schema has evolved through 40 Flyway migrations. Each migration is numbered sequentially and applied in order. This approach ensures reproducible database states across environments.

### Role-Based Access

Each dashboard component checks user role on initialization and redirects unauthorized users to the login page. Route guards provide additional protection at the routing level.

### State Management

The frontend uses RxJS BehaviorSubject for reactive state management, allowing components to subscribe to authentication state changes and automatically update when the user logs in or out.
