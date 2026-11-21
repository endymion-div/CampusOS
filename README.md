# 🎓 CampusOS

> **Your entire campus, in one place.**

CampusOS is a modern, intelligent digital campus companion designed to bring everyday college life into one unified platform.

From managing your timetable and attendance to tracking assignments, preparing for exams, calculating CGPA, discovering campus events, and getting AI-powered study recommendations, CampusOS helps students stay organized and academically focused.

---

## 🚀 Why CampusOS?

College students often have their academic information scattered across multiple platforms, notebooks, messaging groups, and spreadsheets.

**CampusOS brings everything together.**

It provides a personalized **Student Command Center** that answers one simple question:

> **"What matters today?"**

Students can instantly see their next class, urgent assignments, upcoming exams, attendance warnings, recommended study sessions, and campus events.

---

## ✨ Key Features

### 📊 Student Dashboard
- Personalized student dashboard
- Today's classes
- Attendance overview
- Pending assignments
- Upcoming exams
- SGPA/CGPA overview
- Quick actions
- Notifications
- Student Command Center

### 🗓️ Smart Timetable
- Weekly Monday–Sunday timetable
- Subject, faculty, room, and time information
- Current class highlighting
- Color-coded subjects
- Add, edit, delete, and duplicate classes
- Today's schedule view
- Mobile-friendly layout

### 📈 Attendance Tracker
- Subject-wise attendance tracking
- Present/Absent controls
- Automatic attendance percentage calculation
- Safe, warning, and critical attendance indicators
- Attendance forecasting
- Attendance scenario simulation
- Attendance trend charts

### 📝 Assignment Manager
- Create and manage assignments
- Subject and description
- Due dates
- Priority levels
- Assignment status
- Notes and attachments
- Pending, completed, and overdue views
- Calendar and list views
- Progress statistics

### 🧠 Exam Center
- Manage upcoming exams
- Exam date, time, venue, and syllabus
- Preparation status
- Exam countdowns
- Preparation progress tracking
- Connect exams directly to the AI Study Planner

### 🧮 SGPA / CGPA Calculator
Calculate academic performance using:

**SGPA**

`SGPA = Σ(Credit × Grade Point) / Σ(Credits)`

**CGPA**

`CGPA = Σ(Semester Credits × SGPA) / Σ(Semester Credits)`

Includes:
- Configurable grade points
- Multiple subjects
- Multiple semesters
- Semester comparison
- Performance graphs

### 🤖 AI Study Assistant

CampusOS integrates Gemini-powered AI capabilities to provide personalized academic assistance.

Students can ask:

- Create my study plan
- Explain this topic
- Generate revision questions
- Help me prepare for tomorrow's exam
- Prioritize my assignments
- Analyze my academic workload

The assistant can use relevant student information such as subjects, exams, assignments, timetable, and available study hours.

### 📚 AI Study Planner
Students can provide:

- Exam date
- Subject
- Topics
- Difficulty
- Available study hours per day

CampusOS generates a structured preparation plan with daily topics, study durations, revision, and practice.

### 🏫 Campus Events
Discover and manage:

- Hackathons
- Workshops
- Seminars
- Cultural events
- Sports
- Clubs
- Competitions

Features include:
- Event cards
- Dates and locations
- Organizers
- Registration
- Save events
- Calendar integration
- Student-created events

### 👥 Clubs & Communities
Explore student communities across:

- Coding
- AI/ML
- Robotics
- Music
- Dance
- Photography
- Sports
- Entrepreneurship

Each club can contain:
- Logo
- Description
- Member count
- Upcoming events
- Join functionality

### 🔎 Lost & Found
A dedicated campus Lost & Found system.

Students can report:

**Lost**
- Item
- Location
- Date
- Description
- Image
- Contact method

**Found**
- Item
- Location
- Date
- Description
- Image

Includes search and category filtering.

### 📖 Campus Resource Hub
Centralized academic resource repository for:

- Notes
- Previous year papers
- Lab manuals
- Books
- Tutorials
- Lecture slides
- Study guides

Features:
- Upload
- Search
- Filter
- Bookmark
- Download

### 🔔 Notification Center
Notifications for:

- Upcoming classes
- Assignment deadlines
- Exams
- Low attendance
- Campus events
- Study reminders

### 📊 Analytics Dashboard
Visualize academic performance through:

- Attendance trends
- SGPA trends
- Assignment completion
- Study hours
- Subject performance

CampusOS can also generate AI-powered academic insights.

### 🧠 CampusOS Intelligence

An AI-powered productivity layer that analyzes student academic data and provides:

- Weekly summaries
- Weak subject identification
- Upcoming workload
- Attendance risks
- Exam preparation status
- Recommended priorities

Example:

> "Your next 7 days contain 3 assignments and 2 exams. Consider prioritizing Calculus revision tonight."

---

## 🖥️ Student Command Center

The Student Command Center is the central intelligence layer of the dashboard.

It summarizes the student's day by displaying:

- 🎯 Next class
- 📝 Most urgent assignment
- 🧪 Upcoming exam
- ⚠️ Attendance warning
- 📚 Recommended study session
- 🏫 Campus event

Instead of forcing students to search through multiple sections, CampusOS brings the most important information directly to them.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React** | Frontend framework |
| **Vite** | Development/build tooling |
| **Tailwind CSS** | Responsive UI styling |
| **JavaScript / TypeScript** | Application logic |
| **Supabase** | Authentication & database |
| **Recharts** | Analytics and charts |
| **Lucide React** | Icons |
| **Gemini API** | AI-powered features |
| **LocalStorage** | Demo/persistent local data |

The architecture is designed around reusable, modular components for maintainability.

---

## 🎨 Design Philosophy

CampusOS is designed as a **modern academic technology platform**, rather than a basic student CRUD application.

The interface focuses on:

- Premium SaaS aesthetics
- Responsive layouts
- Modern typography
- Rounded cards
- Soft shadows
- Smooth animations
- Interactive charts
- Progress indicators
- Toast notifications
- Skeleton loading states
- Empty states
- Confirmation dialogs
- Dark/light mode

The design intentionally avoids a childish student-app appearance.

---

## 🔐 Authentication

CampusOS supports:

- Sign Up
- Login
- Forgot Password
- Logout
- Student profiles
- Protected dashboards

Student profile information includes:

- Name
- Email
- University
- Course
- Semester
- Section
- Student ID

When Supabase is configured, authentication can be handled through Supabase.

If Supabase credentials are unavailable, CampusOS can operate using a local/demo authentication mode.

---

## 📱 Responsive Design

CampusOS is designed for:

- 💻 Desktop
- 📱 Mobile
- 📲 Tablet

Desktop uses a sidebar-based navigation system, while mobile can use a bottom navigation or collapsible navigation drawer.

---

## 📂 Project Structure

A recommended structure is:

```text
CampusOS/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   ├── data/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/CampusOS.git
cd CampusOS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Only configure the services you have enabled.

### 4. Start the development server

```bash
npm run dev
```

The application will be available through the local Vite development server.

---

## 🗄️ Supabase Setup

If using Supabase:

1. Create a Supabase project.
2. Configure authentication.
3. Create the required database tables.
4. Add your Supabase project URL.
5. Add your anonymous/public API key to the environment variables.
6. Configure the application to use Supabase for persistent user data.

For development without Supabase, the demo/localStorage mode can be used.

---

## 🤖 Gemini AI Setup

CampusOS uses Gemini for AI-powered functionality such as:

- Study planning
- Academic workload analysis
- Revision questions
- Topic explanations
- Assignment prioritization
- Productivity insights

Add your Gemini API key to the environment configuration:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Keep API credentials out of the repository.

---

## 🧪 Demo Mode

CampusOS can launch with realistic sample data so the interface is populated immediately.

Example student:

**Name:** Sneha  
**Course:** B.Tech CSE (AI & ML)  
**Semester:** 1

Example subjects include:

- Mathematics
- Programming
- Basic Electrical Engineering
- Engineering Physics
- Communication
- Engineering Elective

Demo data can be replaced with real student information.

---

## 🔒 Data & Security

CampusOS should follow secure development practices:

- Never commit API keys
- Store secrets in environment variables
- Protect authenticated routes
- Validate user input
- Apply appropriate database security policies
- Use secure authentication
- Avoid exposing private student data

Add `.env` to `.gitignore`:

```gitignore
.env
.env.local
```

---

## 🌟 Core User Flow

```text
Landing Page
      ↓
Authentication
      ↓
Student Dashboard
      ↓
Student Command Center
      ↓
┌──────────────────────────────┐
│ Timetable                    │
│ Attendance                   │
│ Assignments                  │
│ Exams                        │
│ CGPA                         │
│ AI Study Planner             │
│ AI Assistant                 │
│ Events                       │
│ Clubs                        │
│ Lost & Found                 │
│ Resources                    │
│ Analytics                    │
│ Settings                     │
└──────────────────────────────┘
```

---

## 🎯 Project Goals

CampusOS aims to:

- Reduce academic organization overhead
- Give students a single source of campus information
- Improve assignment and exam planning
- Make attendance easier to monitor
- Provide personalized AI academic assistance
- Help students discover campus opportunities
- Encourage better academic productivity

---

## 🔮 Future Improvements

Potential future additions include:

- University-specific integrations
- Automatic timetable synchronization
- Faculty dashboards
- Parent/guardian access
- Push notifications
- AI lecture-note generation
- AI-powered question paper generation
- QR-based attendance
- Campus navigation
- Student marketplace
- Peer tutoring
- Hostel management
- Transport tracking
- Advanced recommendation systems

---

## 👩‍💻 Author

**Sneha Ghosh**

B.Tech CSE (AI & ML)

---

## 📄 License

This project is intended for educational, portfolio, and development purposes.

Add a suitable open-source license such as **MIT License** if you want others to reuse and modify the project.

---

## ⭐ Support

If you find CampusOS useful, consider giving the repository a ⭐ on GitHub.

**CampusOS — Your entire campus, in one place.**
