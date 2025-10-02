# Credit Hub API Documentation (v1)

This document provides a comprehensive overview of the v1 API endpoints for the Credit Hub application, designed to manage faculty performance and credits.

## Base URL

All API endpoints described in this document are prefixed with `/api/v1`.

---

## 1. Authentication API

Endpoints to handle user authentication and session management.

### Login

- **Endpoint:** `POST /api/v1/auth/login`
- **Description:** Authenticates a user (either faculty or admin) and returns a session token.
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

- **Endpoint:** `POST /api/v1/auth/logout`
- **Description:** Terminates the current user session by invalidating the session token.
- **Success Response:** `204 No Content`
- **Error Response (401 Unauthorized):**
  ```json
  {
    "error": "No active session to terminate."
  }
  ```

### Get Current User

- **Endpoint:** `GET /api/v1/auth/me`
- **Description:** Fetches the profile of the currently authenticated user based on their session token.
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

## 2. Faculty API

These endpoints are scoped to individual faculty members and require a `faculty` role.

### Get Faculty Dashboard

- **Endpoint:** `GET /api/v1/faculty/{facultyId}/dashboard`
- **Description:** Retrieves all necessary data for the faculty dashboard for a specific academic year, including credit balance, credit history, and recent activities.
- **URL Parameters:** `facultyId` (string, required)
- **Query Parameters:** `academicYear` (string, optional, e.g., "2023-2024")
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

- **Endpoint:** `GET /api/v1/faculty/{facultyId}/good-works`
- **Description:** Fetches a list of all "good works" submissions for a specific faculty member.
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

- **Endpoint:** `POST /api/v1/faculty/{facultyId}/good-works`
- **Description:** Allows a faculty member to submit a new achievement for review.
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

## 3. Super Admin API

These endpoints require a `super-admin` or `admin` role and provide broad system management capabilities.

### Get Admin Dashboard

- **Endpoint:** `GET /api/v1/admin/dashboard`
- **Description:** Retrieves aggregated data for the super admin dashboard, including overview stats, user statistics, and recent system-wide activities.
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

- **Endpoint:** `GET /api/v1/admin/faculty-accounts`
- **Description:** Fetches a paginated and filterable list of all faculty accounts for management purposes.
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

- **Endpoint:** `POST /api/v1/admin/faculty-accounts`
- **Description:** Allows a super admin to register a new faculty member in the system.
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

- **Endpoint:** `POST /api/v1/admin/impersonate`
- **Description:** Generates a temporary session token to allow an admin to log in as a specific faculty member for troubleshooting and support.
- **Request Body:** `{ "facultyId": "user-abc-123" }`
- **Success Response (200 OK):**
  ```json
  {
    "token": "xxxxxxxx.yyyyyyy.zzzzzzz"
  }
  ```

---

## 4. Credit & Review API (Admin)

Endpoints for managing submissions, negative remarks, and appeals.

### Get Pending Submissions

- **Endpoint:** `GET /api/v1/admin/submissions`
- **Description:** Retrieves all "good works" submissions that are awaiting admin review.
- **Success Response (200 OK):** An array of submission objects.

### Review a Submission

- **Endpoint:** `POST /api/v1/admin/submissions/{submissionId}/review`
- **Description:** Allows an admin to approve or reject a submission and assign credits.
- **URL Parameters:** `submissionId` (string, required)
- **Request Body:**
  ```json
  {
    "decision": "approve",
    "credits": 15,
    "rationale": "Excellent work and significant contribution."
  }
  ```
- **Success Response (200 OK):** `200 OK`

### Get Pending Appeals

- **Endpoint:** `GET /api/v1/admin/appeals`
- **Description:** Fetches all pending appeals from faculty members regarding negative remarks.
- **Success Response (200 OK):** An array of appeal objects.

### Create a Negative Remark

- **Endpoint:** `POST /api/v1/admin/remarks`
- **Description:** Allows an admin to create a negative remark against a faculty member.
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
