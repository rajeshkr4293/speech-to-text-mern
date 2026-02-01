#  Speech-to-Text MERN Application

This project is a full-stack **Speech-to-Text web application** built as part of an internship submission.  
Users can upload an audio file and receive an AI-generated transcription using a modern MERN architecture.

---

##  Features

- Upload audio files and convert speech to text
- Speech-to-text processing using **OpenAI Whisper (local, free)**
- Store transcriptions in **MongoDB**
- View history of previous transcriptions
- Clean and responsive UI built with **Tailwind CSS**
- RESTful API-based architecture

---

##  Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Multer (file uploads)

### AI / Processing
- Python
- OpenAI Whisper
- FFmpeg

### Database
- MongoDB
- Mongoose

---

##  Application Flow

1. User uploads an audio file from the frontend
2. Audio is sent to the Express backend via REST API
3. Backend invokes Python Whisper script
4. Transcription is generated and returned
5. Transcription is stored in MongoDB
6. Frontend displays transcription and history

---

##  API Endpoints

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/api/transcribe` | Upload audio and get transcription |
| GET | `/api/transcriptions` | Fetch previous transcriptions |

---

##  Local Setup Instructions

### Prerequisites
- Node.js
- Python 3.x
- MongoDB (local or Atlas)
- FFmpeg

---

**Create a .env file inside backend/:**

MONGO_URI=your_mongodb_connection_string
PORT=5000
---

### Backend Setup

```bash
cd backend
npm install
npm run dev
```
---
### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
---

### Frontend will run on:

http://localhost:5173

---

### Backend will run on:

http://localhost:5000




