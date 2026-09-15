# Support CRM System

A full-stack Customer Support Ticketing CRM built for the Datastraw Technologies hiring assignment.

The system allows support teams to create, search, filter, view, and update customer support tickets from a web interface.

## Live Demo

Frontend: https://datastraw-support-crm-8i0f.onrender.com/

Backend API: https://datastraw-support-crm-api-j4iq.onrender.com

## Features

- Create support tickets
- Automatic ticket ID and timestamp generation
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
- Add support notes/comments
- Persistent cloud database using MongoDB Atlas
- Responsive web interface
- Deployed frontend and backend

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- MongoDB Node.js Driver
- dotenv
- CORS

### Deployment
- Frontend: Render Static Site
- Backend: Render Web Service
- Database: MongoDB Atlas

## Project Structure

```text
Datastraw-Support-CRM/
│
├── backend/
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md