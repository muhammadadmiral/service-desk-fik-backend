# Service Desk FIK - Complete API Documentation

## Base URL
```
https://service-desk-fik-backend-production.up.railway.app/
```

## Authentication
All endpoints except login/register require JWT authentication via Bearer token:
```
Authorization: Bearer <token>
```

## User Roles
- **mahasiswa**: Students who create tickets
- **dosen**: Faculty who can handle tickets
- **admin**: System administrators
- **executive**: Top-level management (Wadek 1/2/3)

---

## 1. Authentication Endpoints

### Login with Email
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "nim": "21105101001",
    "role": "mahasiswa",
    "department": "Informatika"
  }
}
```

### Login with NIM (New & Enhanced)
```http
POST /auth/login/nim
Content-Type: application/json

{
  "nim": "21105101001",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "nim": "21105101001",
    "role": "mahasiswa",
    "department": "Informatika",
    "programStudi": "S1 Informatika", 
    "fakultas": "Fakultas Ilmu Komputer",
    "angkatan": "2021",
    "status": "Aktif"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "nim": "21105101001",
  "role": "mahasiswa",
  "department": "Informatika"
}

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "nim": "21105101001",
  "role": "mahasiswa",
  "department": "Informatika"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "mahasiswa",
  "department": "Informatika"
}
```

---

## 2. User Management Endpoints

### Get All Users
```http
GET /users
Authorization: Bearer <token>
Query Parameters:
  - role: string (mahasiswa|dosen|admin|executive)
  - department: string
  - search: string
  - available: boolean

Response:
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "nim": "21105101001",
    "role": "mahasiswa",
    "department": "Informatika"
  }
]
```

### Get Available Dosen
```http
GET /users/dosen/available
Authorization: Bearer <token>
Query Parameters:
  - department: string

Response:
[
  {
    "id": 2,
    "name": "Dr. Budi",
    "email": "budi@fik.ac.id",
    "role": "dosen",
    "department": "Informatika",
    "activeTicketCount": 2,
    "isAvailable": true
  }
]
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "mahasiswa"
}
```

### Create User by Admin (New)
```http
POST /users/admin/create
Authorization: Bearer <token>
Roles: admin, executive
Content-Type: application/json

{
  "name": "Dr. Budi Santoso",
  "email": "budi.santoso@fik.ac.id",
  "password": "securepassword",
  "role": "dosen", // mahasiswa, dosen, admin, or executive
  "department": "Informatika",
  "position": "Kaprodi", // Optional for dosen and executive
  "nip": "198701012015011001" // For dosen
}

Response:
{
  "id": 5,
  "name": "Dr. Budi Santoso",
  "email": "budi.santoso@fik.ac.id",
  "role": "dosen",
  "department": "Informatika",
  "position": "Kaprodi",
  "nip": "198701012015011001"
}
```

### Update User by Admin (Enhanced)
```http
PUT /users/admin/:id
Authorization: Bearer <token>
Roles: admin, executive
Content-Type: application/json

{
  "name": "Updated Name",
  "department": "Sistem Informasi",
  "position": "Wadek 1"
}

Response:
{
  "id": 5,
  "name": "Updated Name",
  "email": "budi.santoso@fik.ac.id",
  "role": "dosen",
  "department": "Sistem Informasi",
  "position": "Wadek 1",
  "nip": "198701012015011001"
}
```

### Get Users with Performance (New)
```http
GET /users/performance
Authorization: Bearer <token>
Roles: admin, executive
Query Parameters:
  - role: string (dosen|admin)
  - department: string
  - search: string
  - dateFrom: YYYY-MM-DD
  - dateTo: YYYY-MM-DD

Response:
[
  {
    "id": 5,
    "name": "Dr. Budi Santoso",
    "email": "budi.santoso@fik.ac.id",
    "role": "dosen",
    "department": "Informatika",
    "performance": {
      "totalTickets": 25,
      "completedTickets": 20,
      "avgResolutionTime": 240, // minutes
      "avgFirstResponseTime": 30, // minutes
      "slaBreaches": 2,
      "customerSatisfaction": 4.5,
      "reopenedTickets": 1
    }
  }
]
```

### Create User
```http
POST /users
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "nim": "21105101002",
  "role": "mahasiswa",
  "department": "Informatika"
}
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "department": "Sistem Informasi"
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer <token>
```

---

## 3. Ticket Management Endpoints

### Get All Tickets
```http
GET /tickets
Authorization: Bearer <token>
Query Parameters:
  - status: string (pending|disposisi|in-progress|completed|cancelled)
  - category: string
  - priority: string (low|medium|high|urgent)

Response:
[
  {
    "id": 1,
    "ticketNumber": "TIK-001",
    "subject": "Proyektor Rusak",
    "description": "Proyektor di ruang 403 tidak menyala",
    "status": "pending",
    "priority": "high",
    "category": "Facility",
    "progress": 0,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Get My Tickets
```http
GET /tickets/my
Authorization: Bearer <token>

Response: Array of tickets created by the authenticated user
```

### Get Ticket by ID
```http
GET /tickets/:id
Authorization: Bearer <token>

Response:
{
  "id": 1,
  "ticketNumber": "TIK-001",
  "subject": "Proyektor Rusak",
  "description": "Proyektor di ruang 403 tidak menyala",
  "status": "disposisi",
  "priority": "high",
  "category": "Facility",
  "progress": 30,
  "attachments": [...],
  "disposisiChain": [...],
  "currentHandler": 5,
  "assignedTo": 5,
  "slaStatus": "on-time", // on-time, at-risk, or breached
  "slaDeadline": "2024-01-16T10:00:00Z"
}
```

### Create Ticket (Enhanced)
```http
POST /tickets
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "subject": "Proyektor Rusak di 403",
  "description": "Proyektor tidak menyala, lampu indikator merah",
  "category": "Facility",
  "subcategory": "Proyektor rusak",
  "type": "hardware",
  "department": "Fasilitas",
  "priority": "high",
  "attachments": [file1, file2] // Optional files
}

Response:
{
  "id": 1,
  "ticketNumber": "TIK-001",
  "subject": "Proyektor Rusak di 403",
  "status": "pending",
  "progress": 0,
  "slaDeadline": "2024-01-16T10:00:00Z",
  "slaStatus": "on-time"
}
```

### Update Ticket
```http
PUT /tickets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in-progress",
  "progress": 50,
  "assignedTo": 123
}
```

### Delete Ticket
```http
DELETE /tickets/:id
Authorization: Bearer <token>
Roles: admin, executive
```

### Get Ticket Messages
```http
GET /tickets/:id/messages
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "ticketId": 1,
    "userId": 1,
    "message": "Mohon bantuan segera",
    "messageType": "comment",
    "isInternal": false,
    "createdAt": "2024-01-15T10:05:00Z",
    "sender": {
      "id": 1,
      "name": "John Doe",
      "role": "mahasiswa"
    }
  }
]
```

### Add Message to Ticket
```http
POST /tickets/:id/messages
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "message": "Sudah dicek, perlu penggantian kabel",
  "attachments": [file1, file2] // Optional
}
```

### Disposisi (Forward) Ticket (Enhanced)
```http
POST /tickets/:id/disposisi
Authorization: Bearer <token>
Content-Type: application/json

{
  "toUserId": 456,
  "reason": "Memerlukan penanganan teknis",
  "notes": "Sudah dicek, perlu teknisi",
  "updateProgress": 30,
  "actionType": "forward" // forward, escalate, return
}

Response:
{
  "id": 1,
  "ticketId": 1,
  "fromUserId": 123,
  "toUserId": 456,
  "reason": "Memerlukan penanganan teknis",
  "notes": "Sudah dicek, perlu teknisi",
  "progressUpdate": 30,
  "actionType": "forward",
  "expectedCompletionTime": "2024-01-18T10:00:00Z",
  "slaImpact": "maintained", // maintained, improved, or extended
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Quick Resolve
```http
POST /tickets/:id/quick-resolve
Authorization: Bearer <token>
Content-Type: application/json

{
  "solution": "Sudah diganti kabel proyektor"
}
```

### Get Disposisi History (Enhanced)
```http
GET /tickets/:id/disposisi-history
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "ticketId": 1,
    "fromUser": {
      "id": 1,
      "name": "John Doe",
      "role": "mahasiswa"
    },
    "toUser": {
      "id": 5,
      "name": "Dr. Budi",
      "role": "dosen"
    },
    "reason": "Initial review",
    "notes": "Please check this projector issue",
    "actionType": "forward",
    "expectedCompletionTime": "2024-01-18T10:00:00Z",
    "slaImpact": "maintained",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Ticket List (Paginated)
```http
GET /tickets/list
Authorization: Bearer <token>
Query Parameters:
  - status: string
  - category: string
  - priority: string
  - department: string
  - assignedTo: number
  - search: string
  - page: number (default: 1)
  - limit: number (default: 10)

Response:
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Reassign Ticket
```http
PUT /tickets/:id/reassign
Authorization: Bearer <token>
Content-Type: application/json
Roles: admin, executive

{
  "assignedTo": 321,
  "reason": "Previous handler on leave"
}
```

### Get Ticket Stats
```http
GET /tickets/stats
Authorization: Bearer <token>

Response:
{
  "total": 150,
  "byStatus": [
    { "status": "pending", "count": 30 },
    { "status": "in-progress", "count": 50 }
  ],
  "byPriority": [...],
  "byCategory": [...]
}
```

### Get Assigned Tickets
```http
GET /tickets/assigned-to-me
Authorization: Bearer <token>
Roles: dosen, admin, executive

Response: Array of tickets assigned to the authenticated user
```

### Update SLA Status (New)
```http
GET /tickets/update-sla
Authorization: Bearer <token>
Roles: admin, executive

Response:
{
  "updated": 3,
  "breachedTickets": ["TIK-001", "TIK-005", "TIK-008"]
}
```

### Get User Workload (New)
```http
GET /tickets/workload/:userId
Authorization: Bearer <token>
Roles: admin, executive

Response:
{
  "activeTicketCount": 5,
  "urgentTicketCount": 2,
  "byCategory": [
    { "category": "Facility", "count": 3 },
    { "category": "Academic", "count": 2 }
  ],
  "byPriority": [
    { "priority": "high", "count": 2 },
    { "priority": "urgent", "count": 2 },
    { "priority": "medium", "count": 1 }
  ]
}
```

---

## 4. Executive Endpoints

### Executive Dashboard (Enhanced)
```http
GET /tickets/executive/dashboard
Authorization: Bearer <token>
Roles: executive
Query Parameters:
  - dateFrom: YYYY-MM-DD
  - dateTo: YYYY-MM-DD
  - department: string

Response:
{
  "overallMetrics": {
    "totalTickets": 500,
    "openTickets": 120,
    "averageResolutionTime": 240,
    "slaBreachRate": 5.2,
    "customerSatisfactionAvg": 4.2
  },
  "departmentPerformance": [
    {
      "department": "Informatika",
      "ticketCount": 200,
      "avgResolutionTime": 220,
      "slaBreachCount": 12,
      "satisfaction": 4.3
    }
  ],
  "categoryBreakdown": [
    {
      "category": "Facility",
      "subcategory": "Projector",
      "count": 45,
      "avgProgress": 70
    }
  ],
  "userPerformance": [
    {
      "userId": 5,
      "userName": "Dr. Budi",
      "role": "dosen",
      "ticketsHandled": 35,
      "avgResolutionTime": 180,
      "satisfaction": 4.5
    }
  ],
  "disposisiFlow": [
    {
      "fromRole": "mahasiswa",
      "toRole": "dosen",
      "fromUserId": 1,
      "toUserId": 5,
      "count": 25
    }
  ],
  "trendsOverTime": {
    "dates": ["2024-01-01", "2024-01-02", "2024-01-03"],
    "newTickets": [12, 15, 8],
    "resolvedTickets": [10, 13, 11]
  }
}
```

### User Performance Metrics (Enhanced)
```http
GET /tickets/metrics/user/:userId
Authorization: Bearer <token>
Roles: executive, admin
Query Parameters:
  - dateFrom: YYYY-MM-DD
  - dateTo: YYYY-MM-DD

Response:
{
  "totalTickets": 50,
  "completedTickets": 45,
  "avgResolutionTime": 180,
  "avgFirstResponseTime": 30,
  "slaBreaches": 2,
  "customerSatisfaction": 4.5,
  "reopenedTickets": 1,
  "byCategory": [
    {
      "category": "Facility",
      "count": 20,
      "avgResolutionTime": 160,
      "satisfaction": 4.6
    }
  ],
  "trendsOverTime": {
    "weeks": ["Week 1", "Week 2", "Week 3", "Week 4"],
    "ticketsHandled": [10, 15, 12, 13],
    "avgResolutionTime": [190, 170, 175, 180]
  }
}
```

### Override Disposisi
```http
POST /tickets/:id/override-disposisi
Authorization: Bearer <token>
Roles: executive
Content-Type: application/json

{
  "toUserId": 789,
  "reason": "Urgent, perlu penanganan langsung",
  "skipLevels": true
}
```

### Bulk Update
```http
POST /tickets/bulk/update
Authorization: Bearer <token>
Roles: executive, admin
Content-Type: application/json

{
  "ticketIds": [1, 2, 3, 4, 5],
  "updates": {
    "status": "in-progress",
    "priority": "high"
  }
}
```

### Export Tickets
```http
GET /tickets/export
Authorization: Bearer <token>
Roles: executive, admin
Query Parameters:
  - format: csv|json|excel
  - status: string
  - category: string
  - dateFrom: YYYY-MM-DD
  - dateTo: YYYY-MM-DD

Response: File download or JSON data
```

---

## 5. Workflow & Template Endpoints

### Create Workflow
```http
POST /tickets/workflows
Authorization: Bearer <token>
Roles: executive, admin
Content-Type: application/json

{
  "name": "Financial Ticket Flow",
  "category": "Financial",
  "steps": [
    { "role": "executive", "position": "Wadek 2", "action": "review" },
    { "role": "admin", "department": "Keuangan", "action": "process" }
  ],
  "conditions": {
    "autoEscalate": true,
    "escalationHours": 24
  }
}
```

### Get Workflows
```http
GET /tickets/workflows
Authorization: Bearer <token>
Query Parameters:
  - category: string

Response:
[
  {
    "id": 1,
    "name": "Financial Ticket Flow",
    "category": "Financial",
    "steps": [...],
    "isDefault": true,
    "isActive": true
  }
]
```

### Create Template
```http
POST /tickets/templates
Authorization: Bearer <token>
Roles: executive, admin
Content-Type: application/json

{
  "name": "Pembayaran UKT Template",
  "category": "Financial",
  "subcategory": "Pembayaran UKT",
  "department": "Keuangan",
  "priority": "high",
  "templateContent": {...},
  "slaHours": 48
}
```

### Get Templates
```http
GET /tickets/templates
Authorization: Bearer <token>
Query Parameters:
  - category: string

Response:
[
  {
    "id": 1,
    "name": "Pembayaran UKT Template",
    "category": "Financial",
    "slaHours": 48,
    "isActive": true
  }
]
```

---

## 6. Settings Endpoints

### Get All Settings
```http
GET /settings
Authorization: Bearer <token>
Roles: admin, executive

Response:
{
  "system.name": "Service Desk FIK",
  "ticket.auto_assign": false,
  "ticket.categories": {...},
  "sla_hours": {...}
}
```

### Get Settings by Category
```http
GET /settings/category/:category
Authorization: Bearer <token>
Roles: admin, executive

Response:
{
  "ticket.categories": {...},
  "ticket.priorities": [...]
}
```

### Get Single Setting
```http
GET /settings/:key
Authorization: Bearer <token>
Roles: admin, executive

Response:
{
  "key": "ticket.categories",
  "value": {...}
}
```

### Update Setting
```http
PUT /settings/:key
Authorization: Bearer <token>
Roles: admin, executive
Content-Type: application/json

{
  "value": {...},
  "description": "Updated ticket categories"
}
```

### Update Multiple Settings
```http
PUT /settings
Authorization: Bearer <token>
Roles: admin, executive
Content-Type: application/json

{
  "ticket.auto_assign": true,
  "sla_hours": {
    "low": 48,
    "medium": 24,
    "high": 8,
    "urgent": 2
  }
}
```

### Get Ticket Categories
```http
GET /settings/ticket-categories
Authorization: Bearer <token>

Response:
{
  "Academic": {
    "name": "Akademik",
    "subcategories": [
      "Nilai tidak muncul",
      "Error KRS",
      "Others"
    ]
  },
  "Financial": {...}
}
```

### Initialize Default Settings
```http
POST /settings/initialize-defaults
Authorization: Bearer <token>
Roles: admin, executive
```

---

## 7. Notification Endpoints

### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
Query Parameters:
  - unread: boolean

Response:
[
  {
    "id": 1,
    "type": "ticket_assigned",
    "title": "New Ticket Assigned",
    "message": "Ticket #TIK-001 has been assigned to you",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer <token>
```

---

## 8. File Management

### Delete Attachment
```http
DELETE /tickets/attachments/:attachmentId
Authorization: Bearer <token>
```

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting
- API calls: 100 requests/minute per user
- File uploads: 5MB max per file
- Bulk operations: 100 items max per request

---

## Webhook Events
Available webhook events for integration:
- `ticket.created`
- `ticket.assigned`
- `ticket.disposisi`
- `ticket.status_changed`
- `ticket.completed`
- `ticket.message_added`
- `sla.breach`
- `user.performance_milestone`

Webhook payload format:
```json
{
  "event": "ticket.disposisi",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "ticketId": 123,
    "fromUserId": 456,
    "toUserId": 789
  }
}
```