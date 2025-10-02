# Credit Hub API Documentation

This document provides a comprehensive overview of the API endpoints for the Credit Hub application, designed to manage faculty performance and credits.

## Base URL

All API endpoints described in this document are prefixed with `/api`.

---

## 1. Authentication

Endpoints to handle user authentication and session management.

### Login

Authenticates a user (either faculty or admin) and returns a session token.

- **Endpoint:** `POST /api/auth/login`
- **Description:** Validates user credentials and initiates a session.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "xxxxxxxx.yyyyyyy.zzzzzzz",
    "user": {
      "uid": "user-abc-123",
      "name": "Dr. Eleanor Vance",
      "email": "eleanor.v@egspec.org",
      "role": "faculty"
    }
  }
  ```
- **Error Response (401 Unauthorized):**
  ```json
  {
    "error": "Invalid credentials provided."
  }
  ```

### Logout

Invalidates the user's current session token, logging them out.

- **Endpoint:** `POST /api/auth/logout`
- **Description:** Terminates the current user session.
- **Success Response:** `204 No Content`
- **Error Response (401 Unauthorized):**
  ```json
  {
    "error": "No active session to terminate."
  }
  ```

### Get Current User

Retrieves the profile of the currently authenticated user based on their session token.

- **Endpoint:** `GET /api/auth/me`
- **Description:** Fetches user details for the active session.
- **Headers:** `{ "Authorization": "Bearer xxxxxxxx.yyyyyyy.zzzzzzz" }`
- **Success Response (200 OK):**
  ```json
  {
    "uid": "user-abc-123",
    "name": "Dr. Eleanor Vance",
    "email": "eleanor.v@egspec.org",
    "role": "faculty"
  }
  ```

---

## 2. Faculty Endpoints

These endpoints are scoped to individual faculty members and require a `faculty` role.

### Get Faculty Dashboard Data

Retrieves all necessary data for the faculty dashboard for a specific academic year.

- **Endpoint:** `GET /api/faculty/{facultyId}/dashboard`
- **Description:** Fetches credit balance, credit history, and recent activities.
- **URL Parameters:** `facultyId` (string, required) - The ID of the faculty member.
- **Query Parameters:** `academicYear` (string, optional) - The academic year to filter data for (e.g., "2023-2024"). Defaults to the current year if not provided.
- **Success Response (200 OK):**
  ```json
  {
    "creditBalance": 125,
    "creditHistory": [
      { "month": "Jan", "credits": 20 },
      { "month": "Feb", "credits": 35 }
    ],
    "recentActivities": [
      {
        "id": "activity-1",
        "description": "Credit approved for 'Research Paper Publication'",
        "credits": 10,
        "date": "2023-10-26"
      }
    ]
  }
  ```

### Get Good Works Submissions

Fetches a list of all "good works" submissions for a specific faculty member.

- **Endpoint:** `GET /api/faculty/{facultyId}/good-works`
- **Description:** Retrieves all achievements submitted by the faculty member.
- **URL Parameters:** `facultyId` (string, required)
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": "submission-xyz-789",
      "title": "Publication in International Journal",
      "description": "Published a research paper on renewable energy.",
      "category": "Research",
      "status": "Approved",
      "date": "2024-07-26"
    }
  ]
  ```

### Submit Good Work

Allows a faculty member to submit a new achievement for review.

- **Endpoint:** `POST /api/faculty/{facultyId}/good-works`
- **Description:** Creates a new submission record.
- **URL Parameters:** `facultyId` (string, required)
- **Request Body:**
  ```json
  {
    "title": "Conference Presentation",
    "description": "Presented at the National Conference on AI.",
    "category": "Presentation",
    "attachments": ["document-url-1.pdf"]
  }
  ```
- **Success Response (201 Created):** Returns the newly created submission object.

---

## 3. Super Admin Endpoints

These endpoints require a `super-admin` or `admin` role and provide broad system management capabilities.

### Get Admin Dashboard Statistics

Retrieves aggregated data for the super admin dashboard.

- **Endpoint:** `GET /api/admin/dashboard`
- **Description:** Fetches overview stats, user statistics, and recent system-wide activities.
- **Query Parameters:** `academicYear` (string, optional)
- **Success Response (200 OK):**
  ```json
  {
    "overview": {
      "pendingItems": 12,
      "totalFaculty": 250,
      "activeUsers": 235
    },
    "userStatistics": {
      "performanceDistribution": [
        { "name": "A", "value": 50 },
        { "name": "B", "value": 70 }
      ],
      "engagementOverTime": [
        { "name": "Jan", "value": 109 },
        { "name": "Feb", "value": 21 }
      ]
    },
    "recentActivity": [
      { "text": "New faculty member added", "time": "2 hours ago" }
    ]
  }
  ```

### Get All Faculty Accounts

Fetches a paginated and filterable list of all faculty accounts.

- **Endpoint:** `GET /api/admin/faculty-accounts`
- **Description:** Retrieves faculty user data for management purposes.
- **Query Parameters:**
  - `department` (string, optional)
  - `status` (string, optional - "Active" or "Inactive")
  - `page` (number, optional - default: 1)
  - `limit` (number, optional - default: 10)
- **Success Response (200 OK):**
  ```json
  {
    "accounts": [
      {
        "name": "Dr. Anjali Sharma",
        "email": "anjali.sharma@example.com",
        "department": "Computer Science",
        "credits": 1250,
        "status": "Active"
      }
    ],
    "totalPages": 15,
    "currentPage": 1
  }
  ```

### Create New Faculty Account

Allows a super admin to create a new faculty account.

- **Endpoint:** `POST /api/admin/faculty-accounts`
- **Description:** Registers a new faculty member in the system.
- **Request Body:**
  ```json
  {
    "name": "Dr. John Doe",
    "email": "john.doe@example.com",
    "department": "Computer Science"
  }
  ```
- **Success Response (201 Created):** Returns the newly created faculty account object.

### Impersonate Faculty Member

Allows an admin to generate a temporary session token to log in as a specific faculty member.

- **Endpoint:** `POST /api/admin/impersonate`
- **Description:** Useful for troubleshooting and support.
- **Request Body:** `{ "facultyId": "user-abc-123" }`
- **Success Response (200 OK):**
  ```json
  {
    "token": "xxxxxxxx.yyyyyyy.zzzzzzz"
  }
  ```

---

## 4. Credit & Review Endpoints (Admin)

Endpoints for managing submissions, negative remarks, and appeals.

### Get Pending Submissions

Retrieves all "good works" submissions that are awaiting admin review.

- **Endpoint:** `GET /api/admin/submissions`
- **Success Response (200 OK):** An array of submission objects.

### Review a Submission

Allows an admin to approve or reject a submission and assign credits.

- **Endpoint:** `POST /api/admin/submissions/{submissionId}/review`
- **URL Parameters:** `submissionId` (string, required)
- **Request Body:**
  ```json
  {
    "decision": "approve",
    "credits": 15,
    "rationale": "Excellent work and significant contribution."
  }
  ```
- **Success Response:** `200 OK`

### Get Pending Appeals

Fetches all pending appeals from faculty members regarding negative remarks.

- **Endpoint:** `GET /api/admin/appeals`
- **Success Response (200 OK):** An array of appeal objects.

### Create a Negative Remark

Allows an admin to create a negative remark against a faculty member.

- **Endpoint:** `POST /api/admin/remarks`
- **Request Body:**
  ```json
  {
    "facultyId": "user-abc-123",
    "severity": "High",
    "description": "Repeatedly late for scheduled classes.",
    "documentUrl": "optional-document.pdf"
  }
  ```
- **Success Response (201 Created):** Returns the newly created remark object.
