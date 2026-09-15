# Datastraw Support CRM

A full-stack Customer Support Ticketing CRM System built as part of the Datastraw Technologies hiring assignment.

## Features

- Create customer support tickets
- Automatically generate unique ticket IDs
- Store ticket creation and update timestamps
- View all support tickets
- Search tickets by:
  - Ticket ID
  - Customer name
  - Customer email
  - Subject
  - Description
- Filter tickets by status:
  - Open
  - In Progress
  - Closed
- View complete ticket details
- Update ticket status
- Add notes/comments to tickets
- Dashboard with ticket statistics
- Responsive and clean user interface

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js
- SQLite
- CORS

### Database

SQLite is used with two tables:

- `tickets`
- `notes`

## Project Structure

```text
Datastraw-Support-CRM/
│
├── backend/
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md