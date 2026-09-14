# SupportHub — Full-Stack Support Ticket Management System

<img width="1536" height="1024" alt="supporthub_poster" src="https://github.com/user-attachments/assets/d9874c2b-b865-4f5f-9e7d-4909c10d071b" />

> A production-style full-stack support platform where customers create and track support requests, agents manage and resolve tickets, tickets are automatically assigned using deterministic workload-aware rules, and an AI Ticket Assistant helps agents summarize, classify, prioritize, and draft responses.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Workflows](#core-workflows)
- [Database Design](#database-design)
- [Authentication and Security](#authentication-and-security)
- [Ticket Lifecycle](#ticket-lifecycle)
- [Automatic Assignment](#automatic-assignment)
- [Dashboard and Analytics](#dashboard-and-analytics)
- [AI Ticket Assistant](#ai-ticket-assistant)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Frontend UX and Design](#frontend-ux-and-design)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Testing and Verification](#testing-and-verification)
- [Engineering Decisions and Trade-offs](#engineering-decisions-and-trade-offs)
- [Problems Encountered and Fixes](#problems-encountered-and-fixes)
- [Security Considerations](#security-considerations)
- [Current Status](#current-status)
- [Future Enhancements](#future-enhancements)
- [Interview Talking Points](#interview-talking-points)
- [Author](#author)
- [License](#license)

---

# Overview

**SupportHub** is a full-stack support ticket management platform designed around a realistic customer-support workflow.

The system provides separate experiences for **Customers** and **Support Agents** while using a single React application and a shared FastAPI backend.

The platform combines:

- Secure user authentication
- Email OTP verification
- JWT-based authorization
- Role-based access control
- Relational ticket management
- Ticket comments and conversations
- Deterministic automatic agent assignment
- Agent workload and availability tracking
- Operational dashboard analytics
- Responsive customer and agent portals
- AI-assisted ticket analysis
- Production deployment

The core product remains useful without AI. The AI layer is intentionally an advisory enhancement rather than the system of record or final decision-maker.

---

# Problem Statement

Traditional support workflows often involve fragmented communication, manual ticket routing, and limited visibility into support-team workload.

SupportHub addresses these problems by providing a centralized workflow:

```text
Customer
   |
   | Creates support request
   v
Ticket
   |
   | Category + priority
   v
Automatic Assignment
   |
   | Skill + availability + workload
   v
Support Agent
   |
   +----> Comments / conversation
   |
   +----> Status management
   |
   +----> AI-assisted analysis
   |
   v
Resolved Ticket
   |
   v
Operational Analytics
```

---

# Key Features

## Customer Features

- Customer registration
- Email OTP verification
- OTP resend
- Secure login
- JWT-based session
- Persistent authentication state
- Customer dashboard
- Create support tickets
- View own tickets
- Edit permitted ticket information
- Delete own tickets
- View assigned-agent information
- Add and view comments
- Track ticket status and priority
- Responsive interface
- Light/dark theme support
- Customer care and FAQ pages

## Agent Features

- Agent authentication
- Role-based agent portal
- Agent dashboard
- Assigned-ticket queue
- Ticket details
- Status management
- Priority management
- Ticket comments
- Agent availability
- Workload visibility
- Operational analytics
- AI Ticket Assistant

## Backend Features

- RESTful FastAPI APIs
- SQLAlchemy ORM
- MySQL persistence
- Pydantic validation
- JWT authentication
- Role-based authorization
- Resource-level authorization
- Password hashing with Argon2
- OTP hashing and expiry
- Category validation
- Explicit ticket state machine
- Automatic assignment service
- Dashboard aggregation queries
- Foreign-key integrity
- Cascade deletion for ticket comments

## AI Features

- Ticket summarization
- Suggested category
- Suggested priority
- Suggested response
- Prompt-based structured analysis
- LLM integration through the backend
- AI kept advisory rather than authoritative

---

# Technology Stack

| Layer | Technology |
|---|---|
| Frontend | JavaScript, React, Vite |
| Routing | React Router DOM |
| State Management | Redux Toolkit, React Redux |
| HTTP Client | Axios |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| ORM | SQLAlchemy |
| Database Driver | PyMySQL |
| Database | MySQL 8.0 |
| Authentication | JWT |
| Password/OTP Hashing | Argon2 via pwdlib |
| Email Verification | Resend / HTTPS email delivery |
| GenAI | LangChain + LLM |
| API Documentation | FastAPI OpenAPI / Swagger |
| API Testing | Postman |
| Version Control | Git / GitHub |
| Frontend Hosting | Netlify |
| Backend Hosting | Render |
| Database Hosting | Railway MySQL |
| Containerization | Docker |

The stack intentionally avoids unnecessary infrastructure such as Redis, Celery, WebSockets, Kubernetes, microservices, vector databases, RAG, and LangGraph.

---

# System Architecture

SupportHub uses a simple monolithic full-stack architecture.

<img width="1536" height="1024" alt="overall_system_architecture" src="https://github.com/user-attachments/assets/1ed98944-f00e-4611-ad7f-2a8da97b71bb" />


## Architectural Principles

1. Backend remains the authoritative security boundary.
2. Business logic belongs in service layers.
3. Database access is handled through SQLAlchemy.
4. Frontend state is separated from API communication.
5. AI is advisory and does not make critical operational decisions.
6. The architecture is intentionally simple enough to understand and maintain.

---

# Core Workflows

## Registration and Verification

```text
Registration
     |
     v
Validate input
     |
     v
Hash password with Argon2
     |
     v
Create unverified CUSTOMER
     |
     v
Generate 6-digit OTP
     |
     v
Hash OTP + store expiry
     |
     v
Send OTP email
     |
     v
Verify OTP
     |
     v
is_verified = TRUE
```

## Login

```text
Email + Password
       |
       v
Find User
       |
       v
Verify account
       |
       v
Verify Argon2 password
       |
       v
Generate JWT
       |
       v
Return access token
```

## Ticket Creation

```text
Authenticated Customer
        |
        v
Validate ticket input
        |
        v
Validate category
        |
        v
Automatic assignment
        |
        v
Create ticket
        |
        v
assigned_to = selected agent or NULL
```

## Agent Resolution

```text
Assigned Ticket
      |
      v
OPEN
      |
      v
PENDING
      |
      v
RESOLVED
```

A resolved ticket may later be reopened:

```text
RESOLVED -> OPEN
```

---

# Database Design

Database name:

```text
supporthub
```

Current schema:

```text
supporthub
|
+-- users
+-- otp_verifications
+-- categories
+-- agent_categories
+-- tickets
+-- comments
```

## Entity Relationship Overview

<img width="1536" height="1024" alt="database_architecture" src="https://github.com/user-attachments/assets/019fbd6e-b752-49b8-bfe5-dc50e28cb755" />


## `users`

Stores customers and support agents.

Important fields:

- `id`
- `name`
- `email`
- `password_hash`
- `is_verified`
- `role`
- `availability_status`
- `available_at`
- `created_at`

Roles:

```text
CUSTOMER
AGENT
```

Availability:

```text
AVAILABLE
BUSY
OFFLINE
```

## `otp_verifications`

Stores hashed OTP verification records.

Fields:

- `id`
- `user_id`
- `otp_hash`
- `expires_at`
- `created_at`

Plain OTP values are never persisted.

## `categories`

Initial categories:

```text
ACCOUNT
TECHNICAL
BILLING
PAYMENT
GENERAL
```

Category names are unique.

## `agent_categories`

Junction table representing agent skills.

```text
Agent <---- many-to-many ----> Category
```

The combination of agent and category is unique.

## `tickets`

Core business entity.

Important fields:

- `id`
- `title`
- `description`
- `category_id`
- `priority`
- `status`
- `created_by`
- `assigned_to`
- `created_at`
- `updated_at`
- `resolved_at`

Priority:

```text
LOW
MEDIUM
HIGH
```

Status:

```text
OPEN
PENDING
RESOLVED
```

`assigned_to` is nullable because a ticket may have no eligible agent.

## `comments`

Ticket conversation records.

Fields:

- `id`
- `ticket_id`
- `user_id`
- `message`
- `created_at`

The `ticket_id` foreign key uses:

```text
ON DELETE CASCADE
```

Therefore, deleting a ticket automatically deletes its dependent comments.

---

# Authentication and Security

SupportHub uses layered authentication and authorization.

## Password Security

Passwords are hashed using Argon2.

```text
Plain password
      |
      v
Argon2
      |
      v
password_hash
      |
      v
MySQL
```

Plain passwords are never stored.

## OTP Security

OTP values are generated using a cryptographically secure random source.

```text
6-digit OTP
    |
    +----> Email to user
    |
    +----> Argon2 hash
               |
               v
        otp_verifications
```

OTP records expire after a limited period.

When an OTP is resent, the latest OTP is used for verification.

## JWT

JWT payload includes the authenticated user's identity and role, together with an expiration time.

Typical flow:

```text
Login
  |
  v
JWT issued
  |
  v
Authorization: Bearer <token>
  |
  v
get_current_user()
  |
  v
Validate JWT
  |
  v
Load user
```

## RBAC

The application currently has:

```text
CUSTOMER
AGENT
```

Authorization is enforced in FastAPI.

Frontend role checks improve navigation and user experience, but they are not treated as the security boundary.

## HTTP Authorization Semantics

```text
401 Unauthorized
-> Missing or invalid authentication.

403 Forbidden
-> Authenticated user lacks permission.
```

---

# Ticket Lifecycle

SupportHub uses an explicit state machine.

```text
OPEN
  |
  v
PENDING
  |
  v
RESOLVED
  |
  +----------> OPEN
```

Valid transitions:

```text
OPEN -> PENDING
PENDING -> RESOLVED
RESOLVED -> OPEN
```

Invalid transitions are rejected.

For example:

```text
OPEN -> RESOLVED
```

is not allowed.

## Role Responsibilities

### Customer

Can:

- Create tickets
- View own tickets
- Update permitted information
- Add comments
- Delete own tickets

Cannot:

- Change ticket status
- Choose the assigned agent

### Agent

Can:

- View authorized tickets
- Add comments
- Change status
- Manage ticket priority where permitted
- Work assigned tickets

## `resolved_at`

When a ticket becomes resolved:

```text
resolved_at = current timestamp
```

When reopened:

```text
resolved_at = NULL
```

This supports future resolution-time analytics.

---

# Automatic Assignment

Automatic assignment is deterministic and backend-controlled.

The final assignment decision is deliberately **not made by AI**.

## Assignment Algorithm

```text
New Ticket
    |
    v
Ticket Category
    |
    v
Find agents qualified for category
    |
    v
Are any AVAILABLE?
   / \
 YES  NO
  |    |
  v    v
Lowest  Earliest
active  available_at
workload
  |
  v
Tie -> Lowest Agent ID
  |
  v
assigned_to
```

## Eligibility

An agent is eligible when:

```text
role = AGENT
AND
agent_categories contains ticket category
```

## Active Workload

Active workload is:

```text
OPEN + PENDING
```

Resolved tickets and unassigned tickets do not count.

## Deterministic Tie-Breaking

If multiple agents have the same workload:

```text
lowest agent ID
```

is selected.

If using the availability fallback and multiple agents have the same `available_at`:

```text
lowest agent ID
```

is selected.

## No Eligible Agent

If no qualified agent exists:

```text
assigned_to = NULL
```

The customer request is still accepted.

## Why AI Is Not Used for Final Assignment

Assignment affects operational workload, so it should be:

- Predictable
- Explainable
- Reproducible
- Testable

The LLM is therefore used for assistance rather than authoritative routing.

---

# Dashboard and Analytics

The backend exposes:

```http
GET /api/dashboard/analytics
```

Only agents can access this endpoint.

## Metrics

The response provides:

- Total tickets
- Open tickets
- Pending tickets
- Resolved tickets
- Resolution rate
- Tickets by priority
- Tickets by category
- Agent availability counts
- Agent workloads

## Resolution Rate

```text
resolved tickets / total tickets * 100
```

If there are no tickets:

```text
0.0%
```

## Agent Workload

Active workload is consistent with the assignment service:

```text
OPEN + PENDING
```

## SQL Aggregation

Dashboard calculations use database-side aggregation concepts such as:

```text
COUNT()
GROUP BY
OUTER JOIN
ORDER BY
```

This avoids unnecessarily loading all ticket records into application memory.

Outer joins are used where entities with zero activity should still appear, such as:

```text
Agent with 0 active tickets
Category with 0 tickets
```

---

# AI Ticket Assistant

The AI feature is intentionally small and practical.

## Workflow

```text
Agent opens ticket
       |
       v
Request AI analysis
       |
       v
FastAPI
       |
       v
AI Service
       |
       v
LangChain
       |
       v
Prompt Template
       |
       v
LLM
       |
       v
Structured analysis
       |
       v
React UI
```

## Expected Output

```text
Summary
Suggested Category
Suggested Priority
Suggested Response
```

## AI Design Principle

The AI does not automatically:

- Assign agents
- Change ticket status
- Change critical ticket fields
- Override backend business rules

The agent remains responsible for the final decision.

---

# Frontend Architecture

SupportHub uses a single React application with role-aware experiences.

```text
React Application
|
+-- React Router
|      |
|      +-- Public routes
|      +-- Customer routes
|      +-- Agent routes
|
+-- Redux Toolkit
|      |
|      +-- Authentication state
|
+-- Axios
|      |
|      +-- Central API client
|      +-- JWT interceptor
|
+-- Reusable UI components
|
+-- Customer portal
|
+-- Agent portal
```

## Public Routes

```text
/
 /login
 /register
 /verify-otp
 /faq
```

## Customer Routes

```text
/customer
/customer/tickets
/customer/tickets/new
/customer/tickets/:id
/customer/care
```

## Agent Routes

```text
/agent
/agent/tickets
/agent/tickets/:id
/agent/performance
```

Exact route names may evolve with implementation, but role boundaries remain enforced.

---

# Backend Architecture

The backend separates HTTP concerns, business logic, and persistence.

```text
backend/app/
|
+-- main.py
+-- database.py
|
+-- models/
|
+-- schemas/
|
+-- routers/
|
+-- services/
|
+-- dependencies/
|
+-- utils/
```

## Router Layer

Responsible for:

- HTTP methods
- Request/response handling
- Dependency injection
- Authentication/authorization declarations

## Service Layer

Responsible for:

- Business rules
- Database operations
- Assignment logic
- Dashboard calculations
- AI orchestration

## Model Layer

Responsible for:

- SQLAlchemy database representation
- Relationships
- Constraints

## Schema Layer

Responsible for:

- Request validation
- Response contracts
- Preventing unwanted client-controlled fields

---

# API Overview

The main API surface includes the following groups.

## Authentication

```http
POST /api/auth/register
POST /api/auth/verify-otp
POST /api/auth/resend-otp
POST /api/auth/login
GET  /api/auth/me
```

## Tickets

```http
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/{ticket_id}
PUT    /api/tickets/{ticket_id}
DELETE /api/tickets/{ticket_id}
```

## Comments

```http
GET  /api/tickets/{ticket_id}/comments
POST /api/tickets/{ticket_id}/comments
```

## Dashboard

```http
GET /api/dashboard/analytics
```

## AI

The AI endpoint is part of the backend AI service and should be used by authorized agents only.

The exact AI endpoint contract should be treated as the source of truth in the current backend implementation.

---

# Project Structure

A representative repository structure is:

```text
SupportHub/
|
+-- backend/
|   |
|   +-- app/
|   |   |
|   |   +-- main.py
|   |   +-- database.py
|   |   |
|   |   +-- models/
|   |   |   +-- user.py
|   |   |   +-- otp.py
|   |   |   +-- category.py
|   |   |   +-- agent_category.py
|   |   |   +-- ticket.py
|   |   |   +-- comment.py
|   |   |
|   |   +-- schemas/
|   |   |   +-- auth.py
|   |   |   +-- ticket.py
|   |   |   +-- comment.py
|   |   |   +-- dashboard.py
|   |   |
|   |   +-- routers/
|   |   |   +-- auth.py
|   |   |   +-- tickets.py
|   |   |   +-- dashboard.py
|   |   |   +-- ai.py
|   |   |
|   |   +-- services/
|   |   |   +-- auth_service.py
|   |   |   +-- otp_service.py
|   |   |   +-- ticket_service.py
|   |   |   +-- assignment_service.py
|   |   |   +-- comment_service.py
|   |   |   +-- dashboard_service.py
|   |   |   +-- ai_service.py
|   |   |
|   |   +-- dependencies/
|   |   |   +-- auth.py
|   |   |
|   |   +-- utils/
|   |       +-- security.py
|   |       +-- email.py
|   |
|   +-- requirements.txt
|   +-- .env.example
|   +-- .gitignore
|
+-- frontend/
|   |
|   +-- src/
|   |   +-- api/
|   |   +-- app/
|   |   +-- components/
|   |   +-- features/
|   |   +-- pages/
|   |   +-- routing/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- styles.css
|   |
|   +-- package.json
|   +-- vite.config.js
|   +-- .env.example
|   +-- .gitignore
|
+-- README.md
+-- .gitignore
+-- LICENSE
```

The exact current repository structure may contain additional components created during frontend polishing.

---

# Frontend UX and Design

The frontend evolved from a functional CRUD interface into a more professional support-platform experience.

## Application Shell

Authenticated pages use a consistent layout:

```text
+-------------------------------------------------------------+
| SupportHub                          Theme     User          |
+----------------+--------------------------------------------+
|                |                                            |
| Dashboard      |                                            |
| Tickets        |               Page Content                  |
| Queue          |                                            |
| Performance    |                                            |
| FAQ / Care     |                                            |
|                |                                            |
| Settings       |                                            |
| Logout         |                                            |
+----------------+--------------------------------------------+
```

## Customer Experience

Customer pages provide:

- Dashboard summary
- Ticket lists
- Ticket creation
- Ticket details
- Assignment visibility
- Conversation/comments
- Status and priority badges
- Loading, empty, and error states

## Agent Experience

Agent pages provide:

- Operational dashboard
- Ticket queue
- Assigned-ticket details
- Status management
- Priority management
- Comments
- Availability
- Performance/analytics
- AI assistance

## Responsive Design

The interface supports:

- Desktop
- Tablet
- Mobile

Responsive behavior includes:

- Collapsible sidebar
- Hamburger navigation
- Flexible ticket layouts
- Mobile-friendly forms
- Responsive dashboard cards

## Theme

The application supports light and dark themes.

Theme preference is persisted on the client.

---

# Deployment

SupportHub uses separate production hosting for frontend and backend.

## Production Architecture

```text
User Browser
     |
     v
Netlify
React/Vite frontend
     |
     | HTTPS REST API
     v
Render
FastAPI backend
     |
     v
Railway
MySQL database
```

## Production Frontend

```text
https://supporthub24.netlify.app/
```

## Production Backend

```text
https://supporthub-bc16.onrender.com
```

## Swagger / OpenAPI

```text
https://supporthub-bc16.onrender.com/docs
```

## Frontend Build

```bash
npm run build
```

The production build has been verified successfully.

## Netlify Configuration

Typical production configuration:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

The frontend uses:

```text
VITE_API_BASE_URL
```

to communicate with the deployed FastAPI backend.

## CORS

The backend allows local development origins and the production frontend origin.

---

# Environment Variables

Secrets must never be committed to Git.

A typical backend environment configuration includes:

```env
DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:<port>/<database>

JWT_SECRET_KEY=<strong-secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

EMAIL_HOST=<email-service-host>
EMAIL_PORT=<port>
EMAIL_USERNAME=<username>
EMAIL_PASSWORD=<secret>
EMAIL_FROM=<sender>

LLM_API_KEY=<secret>
```

Frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Production:

```env
VITE_API_BASE_URL=https://supporthub-bc16.onrender.com
```

Use `.env.example` files to document required configuration without exposing secrets.

---

# Local Development

## Prerequisites

Install:

- Python 3.x
- Node.js
- npm
- MySQL 8.x
- Git

Optional:

- Postman
- Docker

## Clone Repository

```bash
git clone <your-repository-url>
cd SupportHub
```

## Backend Setup

```bash
cd backend
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure:

```text
backend/.env
```

Create the MySQL database:

```sql
CREATE DATABASE supporthub;
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

API:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves the application at:

```text
http://localhost:5173
```

Configure:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

# Testing and Verification

Testing was performed incrementally during implementation, with manual browser/API verification used for important end-to-end flows.

## Backend Verification

Examples:

```bash
python -m compileall app
```

FastAPI startup was verified against MySQL.

Important API scenarios included:

- Registration
- OTP verification
- OTP resend
- Login
- JWT validation
- `/me`
- RBAC
- Ticket CRUD
- Ownership restrictions
- Status transitions
- Comments
- Automatic assignment
- Dashboard authorization
- Dashboard analytics

## Frontend Verification

Examples:

```bash
npm run build
npm run verify:foundation
```

The production frontend build has been verified successfully.

## Security/Authorization Scenarios

Verified scenarios include:

```text
Missing JWT                -> 401
Invalid JWT                -> 401
Customer accessing agent-only API -> 403
Customer accessing another customer's ticket -> 403
Unauthorized agent category access -> 403
Client supplying comment user_id -> rejected
Client supplying assigned_to -> rejected
Invalid ticket status transition -> rejected
```

## Assignment Scenarios

Verified:

```text
Lowest workload available agent
Equal workload -> lowest agent ID
Resolved tickets excluded from workload
Unassigned tickets excluded from workload
No available agent -> earliest available_at
Equal available_at -> lowest agent ID
No eligible agent -> assigned_to NULL
```

---

# Engineering Decisions and Trade-offs

## Single React Application

Customer and Agent experiences are separated by routing and RBAC within one React application.

This avoids unnecessary duplication while still providing distinct workflows.

A production organization could split them into separate applications if independent deployment or organizational boundaries justified it.

## SQLAlchemy + MySQL

SQLAlchemy provides the application's Python-side relational model while MySQL remains the actual persistence layer.

This keeps database interaction structured and allows relationships to be represented naturally in Python.

## Service Layer

Business logic is separated from HTTP routing.

```text
Router
  |
  v
Service
  |
  v
SQLAlchemy
  |
  v
MySQL
```

This makes business rules easier to understand, reuse, and test.

## Deterministic Assignment

The final routing decision is deterministic rather than LLM-driven.

This improves predictability and auditability.

## Database-backed Dashboard

The dashboard uses MySQL aggregation instead of adding an analytics database or cache.

For the current scale, this is simpler and appropriate.

## Minimal Infrastructure

No Redis, Celery, Kubernetes, WebSockets, or microservices were introduced because they would add complexity without meaningful benefit for the MVP.

## Client Trust Boundary

Security-sensitive identity and assignment information is determined by the backend.

Examples:

```text
created_by  <- authenticated JWT identity
comment user_id <- authenticated JWT identity
assigned_to <- assignment service
status <- backend workflow rules
```

The client does not control these values.

---

# Problems Encountered and Fixes

The project included several practical integration issues. These are useful engineering lessons rather than hidden implementation details.

## 1. Empty Categories Table

### Problem

Ticket creation initially failed because the database had no category records.

### Fix

Seeded the initial categories:

```text
ACCOUNT
TECHNICAL
BILLING
PAYMENT
GENERAL
```

The frontend was changed to display category names rather than requiring customers to enter numeric IDs.

---

## 2. Ticket Deletion Failed When Comments Existed

### Problem

Deleting a ticket with dependent comments caused a database foreign-key error and HTTP 500.

### Cause

The comments foreign key did not initially cascade deletes.

### Fix

The foreign key was changed to:

```sql
FOREIGN KEY (ticket_id)
REFERENCES tickets(id)
ON DELETE CASCADE
```

Result:

```text
Delete Ticket
     |
     v
Delete dependent comments
     |
     v
Delete ticket
```

This was verified with `SHOW CREATE TABLE comments`.

---

## 3. Authentication Lost on Browser Refresh

### Problem

Redux state was initially in memory only.

Refreshing the browser removed the authentication state.

### Fix

The access token and current user were persisted in localStorage and restored during application startup.

Passwords, password hashes, and OTPs are not stored in localStorage.

### Production Consideration

For a high-security production banking application, HttpOnly secure cookies or another hardened session architecture would be preferable because JavaScript-accessible tokens increase XSS exposure.

---

## 4. Stale JWT Caused Production Login Failure

### Problem

A stale persisted token caused:

```text
POST /api/auth/login -> 200
GET /api/auth/me -> 401
```

### Cause

An expired JWT remained in browser storage and was being reused.

### Fix

Authentication persistence behavior was corrected so stale authentication state does not override a fresh successful login.

---

## 5. Agent Assignment Test Data

### Problem

Automatic assignment requires realistic combinations of:

- Agent roles
- Agent category mappings
- Availability states
- Existing workloads

### Approach

Controlled test data was used to validate:

- Skill matching
- Availability
- Workload balancing
- Tie-breaking
- Fallback behavior
- No-agent scenarios

---

## 6. Render `HEAD /` Message

Render generated:

```text
HEAD / -> 405 Method Not Allowed
```

The application only defined `GET /`.

A subsequent:

```text
GET / -> 200 OK
```

confirmed the service was healthy.

No application change was necessary.

---

## 7. Email Delivery Constraints

SMTP-based email delivery created deployment constraints in the hosting environment.

The implementation moved toward an HTTPS email API for production delivery, avoiding SMTP outbound-port restrictions.

---

# Security Considerations

SupportHub includes several defensive design decisions.

## Passwords

Never stored in plaintext.

## OTPs

Never stored in plaintext.

## JWT

Signed and time-limited.

## Environment Secrets

Credentials and API keys belong in environment variables.

## Backend Authorization

The backend does not trust frontend route restrictions.

## Resource Ownership

Customers can access only their own tickets.

## Comment Authorship

The server derives comment authorship from the JWT.

## Agent Assignment

Clients cannot choose their own assignment.

## Status Changes

Status transitions are validated by backend business rules.

## Input Validation

Pydantic schemas prevent unexpected client-controlled fields where appropriate.

---

# Current Status

## Functional Status

```text
Database                         COMPLETE
Authentication                  COMPLETE
OTP Verification                COMPLETE
JWT + RBAC                      COMPLETE
Ticket CRUD                     COMPLETE
Ticket Status Workflow          COMPLETE
Ticket Comments                 COMPLETE
Automatic Assignment            COMPLETE
Dashboard Backend               COMPLETE
React Foundation                COMPLETE
Customer Portal                 COMPLETE
Agent Portal                    COMPLETE
Dashboard UI                    COMPLETE
Responsive Navigation           COMPLETE
Theme Toggle                    COMPLETE
FAQ / Customer Care             COMPLETE
Frontend Polish                 COMPLETE
Production Frontend Build       VERIFIED
Backend Deployment              LIVE
Frontend Deployment             LIVE
```

## Production

```text
Frontend:
https://supporthub24.netlify.app/

Backend:
https://supporthub-bc16.onrender.com

Swagger:
https://supporthub-bc16.onrender.com/docs
```

## Overall

**SupportHub is a portfolio-ready full-stack application demonstrating practical backend engineering, frontend development, database design, authentication, authorization, deterministic business logic, analytics, deployment, and LLM integration.**

---

# Future Enhancements

The following are intentionally outside the initial MVP and can be considered later:

- Advanced ticket search
- More sophisticated filtering
- Pagination
- Average resolution time
- SLA tracking
- Real-time agent presence
- Real-time notifications
- More advanced analytics
- Ticket similarity
- AI-assisted category detection
- AI-assisted routing recommendations
- Automated response suggestions based on historical knowledge
- More comprehensive automated testing
- Stronger production session management
- CI/CD pipeline
- Advanced accessibility work

The project deliberately avoids expanding into microservices, distributed task queues, RAG, vector databases, Kubernetes, and real-time infrastructure unless future scale actually requires them.

---

# Interview Talking Points

SupportHub is designed to provide several strong technical discussion points.

## 1. Authentication vs Authorization

> Authentication determines who the user is, while authorization determines whether that authenticated user is allowed to perform a specific action or access a specific resource.

## 2. JWT

> I used JWT-based stateless authentication for the REST API. The token carries the authenticated user's identity and role and is validated by a reusable FastAPI dependency.

## 3. Resource-Level Authorization

> I did not rely on frontend restrictions. The backend checks the authenticated user's ownership or agent permissions before allowing access to ticket resources.

## 4. Service Layer

> I separated HTTP routing from business logic so ticket workflows, assignment rules, and analytics remain in dedicated services instead of being embedded inside API routes.

## 5. Automatic Assignment

> I intentionally kept final ticket assignment deterministic. Eligible agents are selected based on category skill, availability, active workload, and deterministic tie-breaking. AI is advisory rather than authoritative.

## 6. SQL Aggregation

> Dashboard metrics are calculated using database-side aggregation such as COUNT and GROUP BY instead of loading all records into Python.

## 7. Outer Join

> I use outer joins for dashboard entities such as agents and categories so records with zero matching tickets still appear in analytics.

## 8. State Machine

> Ticket status is modeled as an explicit state machine. Only defined transitions such as OPEN to PENDING and PENDING to RESOLVED are accepted.

## 9. AI Architecture

> The AI assistant is integrated as a separate service layer using LangChain and prompt templates. It produces recommendations such as summaries and suggested responses, but the backend remains authoritative.

## 10. Production Trade-offs

> I deliberately avoided infrastructure such as Redis, Celery, WebSockets, and microservices because the current application does not need their operational complexity.

---

# Portfolio Summary

A concise project description:

> **SupportHub is a full-stack support ticket management platform built with React, FastAPI, MySQL, JWT authentication, and LangChain. It provides role-based customer and agent workflows, secure email OTP verification, ticket CRUD and comments, deterministic workload-aware automatic assignment, operational dashboard analytics, and an LLM-powered Ticket Assistant for summarization, classification, prioritization, and response drafting.**

### Key Engineering Highlights

```text
React + Redux Toolkit
        |
        v
Role-based support portal
        |
        v
FastAPI REST API
        |
        +---- JWT + RBAC
        |
        +---- Ticket Service
        |
        +---- Assignment Service
        |
        +---- Dashboard Service
        |
        +---- AI Service
        |
        v
SQLAlchemy
        |
        v
MySQL
```

---

# Repository Documentation

Recommended supporting documents:

```text
docs/
|
+-- SupportHub_Final_Architecture.md
+-- SupportHub_Database_Structure.md
+-- SupportHub_Authentication_Implementation.md
+-- SupportHub_Phase_Ticket_CRUD.md
+-- SupportHub_Phase_Status_Workflow.md
+-- SupportHub_Phase_Comments.md
+-- SupportHub_Phase_Automatic_Assignment.md
+-- SupportHub_Phase_Dashboard_Backend.md
+-- SupportHub_Phase_React_Frontend_Foundation.md
+-- SupportHub_Customer_Phases_and_Fixes.md
+-- SupportHub_Frontend_Polishing_and_Changes.md
+-- SupportHub_Deployment_Implementation.md
```

These documents provide deeper implementation history and technical decisions, while this README serves as the public-facing project overview.

---

# Author

**Laxman Roy**

Full-Stack / AI Developer

---

# License

This project is intended primarily as a portfolio and learning project.

Add a specific open-source license here if you intend to permit reuse, modification, or redistribution.

---

## Final Note

SupportHub was intentionally designed around a simple principle:

> **Build a real full-stack application first, then add AI where it provides practical value.**

The result is a system where the core support workflow remains deterministic, secure, database-driven, and explainable, while the AI layer improves agent productivity without replacing human or backend-controlled decisions.
