# NoteSeek Backend API & Architecture Specification

> **Message to the Backend AI Agent:**
> You are tasked with building the backend for **NoteSeek**, an AI-powered educational platform connecting Teachers and Students. The frontend (Next.js App Router) is completely built and is currently relying on mock data arrays. Your goal is to build this REST API (or GraphQL) exactly matching the JSON schemas below so the frontend can seamlessly swap out its mock arrays with your API calls. 

---

## Phase 1: Authentication & Users
*Always start here. Every other endpoint requires an authenticated user's ID and Role.*

### 1. Login
- **Endpoint:** `POST /api/auth/login`
- **Purpose:** Authenticate the user and return a token (JWT) + standard user object.
- **Request Body:** 
  ```json
  { "email": "student@noteseek.com", "password": "password123" }
  ```
- **Response Shape (Important for Frontend state):**
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "usr_123",
      "name": "Alex Johnson",
      "email": "student@noteseek.com",
      "role": "student" // strictly "student" or "teacher"
    }
  }
  ```

---

## Phase 2: Core Course Management
*These populate the Teacher and Student dashboards.*

### 2. Get User's Courses
- **Endpoint:** `GET /api/courses`
- **Headers:** `Authorization: Bearer <token>`
- **Logic:** If the user is a `teacher`, return courses they created. If `student`, return courses they are enrolled in.
- **Response Array Shape (matches frontend `CourseCard` component):**
  ```json
  [
    {
      "id": "cs101",
      "title": "Introduction to Computer Science",
      "teacher": "Prof. Anderson",
      "university": "Global University",
      "semester": "Fall 2024",
      "tag": "Computer Science"
    }
  ]
  ```

### 3. Create a Course (Teacher Only)
- **Endpoint:** `POST /api/courses`
- **Request Body:** Matches the JSON object above (excluding ID, which you generate).

---

## Phase 3: Materials & File Uploads
*The backbone of the AI. Files need to be stored (e.g., AWS S3, Supabase Storage) and their metadata saved in the database.*

### 4. Upload Material
- **Endpoint:** `POST /api/materials/upload`
- **Logic:** Receives form-data (`multipart/form-data`) containing a PDF/PPTX and an optional `courseId`. If `courseId` is null, it's a "Personal Upload" (Student vault).
- **Response Shape:**
  ```json
  {
    "id": "mat_555",
    "filename": "Chapter_3_Slides.pptx",
    "url": "https://storage.provider.../file.pptx",
    "courseId": "cs101", 
    "uploadedAt": "2024-10-25T10:00:00Z"
  }
  ```

---

## Phase 4: Assessments & Submissions
*Quizzes and Assignments.*

### 5. Get Course Assessments
- **Endpoint:** `GET /api/courses/:courseId/assessments`
- **Response Shape:**
  ```json
  [
    {
      "id": "quiz_1",
      "title": "Chapter 3 Micro-Quiz",
      "type": "Quiz", // or "Assignment"
      "dueDate": "Oct 30, 2024",
      "status": "Pending", // For students: "Pending", "Submitted", "Graded"
      "maxPoints": 100
    }
  ]
  ```

### 6. Submit Assignment/Quiz (Student Only)
- **Endpoint:** `POST /api/assessments/:assessmentId/submit`
- **Request Body:**
  ```json
  {
    "content": "Text answer from textarea if any...",
    "attachmentUrl": "url_to_uploaded_file_if_any"
  }
  ```

### 7. Grade Submission (Teacher Only)
- **Endpoint:** `POST /api/submissions/:submissionId/grade`
- **Request Body:**
  ```json
  {
    "score": 95,
    "feedback": "Excellent work on the queue implementation."
  }
  ```

---

## Phase 5: The AI Generation Engine (The Core Feature)
*The system needs to accept context (files) and a prompt, pass it to an LLM (e.g., OpenAI API), and return structured JSON.*

### 8. Generate AI Content
- **Endpoint:** `POST /api/ai/generate`
- **Request Body:**
  ```json
  {
    "type": "quiz", // "quiz", "flashcards", "summary", or "assignment"
    "sourceMaterialIds": ["mat_555", "mat_556"], 
    "prompt": "Focus on array memory allocation.",
    "targetCourseId": "cs101" // Optional
  }
  ```
- **Response Behavior:** The Backend AI Agent must set up this route to fetch the raw text of the files from the database/storage, feed them into an LLM with a strict JSON format prompt, and return the generated object back to the frontend.

---

### Backend AI Agent Tech Recommendations:
1. **Framework:** Node.js (Express or NestJS) OR Python (FastAPI). FastApi is highly recommended due to the heavy AI/LLM integration needed later.
2. **Database:** PostgreSQL (using Prisma ORM or Drizzle) is highly recommended for structured relationship mapping between Teachers <-> Courses <-> Students <-> Submissions.
3. **Storage:** Supabase Storage or AWS S3 for the PDF/PPTX materials.
4. **LLM Integration:** LangChain (JS or Python) to handle reading the PDFs and generating the structured output.
