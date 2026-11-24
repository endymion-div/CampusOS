# CAMPUSOS — FULL-STACK SMART CAMPUS OPERATING SYSTEM

## ROLE

You are an expert **senior full-stack engineer, UI/UX designer, product architect, and AI application developer**.

Build a polished, production-quality web application called **CampusOS**.

CampusOS is an intelligent digital campus companion that brings a student's academic life, campus activities, productivity tools, and AI assistance into one unified platform.

The application should feel like a **premium modern SaaS product**, not a basic college management CRUD application.

The core philosophy is:

> **"Your entire campus, in one place."**

The application should answer:

> **"What matters today?"**

The dashboard should intelligently summarize the student's current academic situation instead of simply displaying a collection of pages.

---

# 1. CORE PRODUCT VISION

Students normally have information scattered across:

- College portals
- WhatsApp groups
- Google Calendar
- Notebooks
- PDFs
- Spreadsheets
- Assignment lists
- Timetables
- Notice boards
- Event platforms

CampusOS should consolidate these into a single intelligent student workspace.

The student should be able to:

- See today's classes
- Track attendance
- Manage assignments
- Track examinations
- Calculate SGPA/CGPA
- Create study plans
- Ask an AI academic assistant questions
- Discover campus events
- Explore clubs
- Search campus resources
- Report lost/found items
- Analyze academic performance
- Receive intelligent recommendations

---

# 2. IMPORTANT DEVELOPMENT REQUIREMENT

Do NOT build this as a static mockup.

All major interface elements should be functional.

Buttons should perform real actions.

Forms should save data.

Charts should update based on data.

Calculators should calculate correctly.

Filters should actually filter.

Search should work.

Navigation should work.

CRUD functionality should work.

Use realistic demo data when backend credentials are unavailable.

The application must be usable immediately after installation.

---

# 3. TECHNOLOGY STACK

Use:

### Frontend

- React
- Vite
- JavaScript or TypeScript
- Tailwind CSS
- React Router
- Lucide React
- Recharts
- Framer Motion where appropriate

### Backend / Database

Use Supabase for:

- Authentication
- PostgreSQL database
- User profiles
- Academic data
- Assignments
- Exams
- Events
- Clubs
- Lost & Found
- Resources
- Persistent user data

### AI

Use Gemini API for:

- AI Study Assistant
- Study Planner
- Academic insights
- Assignment prioritization
- Revision question generation
- Topic explanations
- Workload analysis

### Local fallback

If Supabase or Gemini credentials are not configured:

- Use realistic demo data
- Use localStorage for persistence
- Provide graceful fallback behavior
- Never crash because an external API is unavailable

---

# 4. VISUAL DESIGN SYSTEM

The UI should look like a **premium educational SaaS platform**.

Avoid:

- Childish designs
- Excessive gradients
- Cartoonish illustrations
- Generic Bootstrap-style layouts
- Overly bright colors
- Cluttered dashboards

Use:

- Clean typography
- Spacious layouts
- Rounded cards
- Subtle borders
- Soft shadows
- Elegant animations
- Professional charts
- Clear hierarchy
- Consistent iconography
- Excellent spacing
- Responsive layouts

The design should feel comparable to a modern combination of:

- Notion
- Linear
- Google Calendar
- modern fintech dashboards
- modern AI productivity applications

but should have its own visual identity.

---

# 5. COLOR SYSTEM

Use a professional academic technology palette.

Primary:

- Deep indigo / blue

Supporting:

- Violet
- Cyan
- Emerald
- Amber
- Rose

Use colors semantically.

For example:

- Green → healthy/safe/completed
- Amber → warning
- Red → critical/urgent
- Blue → information
- Purple → AI/intelligence

Support:

### Light Mode

Bright background, white cards, subtle borders.

### Dark Mode

Dark charcoal/navy background, elevated cards, accessible text.

Add a global light/dark mode switch.

---

# 6. APPLICATION LAYOUT

## Desktop

Use:

```text
┌─────────────────────────────────────────────────────────┐
│ Top Bar                              Search | Bell | User │
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│ Sidebar       │             Main Content                 │
│               │                                         │
│ Dashboard     │                                         │
│ Timetable     │                                         │
│ Attendance    │                                         │
│ Assignments   │                                         │
│ Exams         │                                         │
│ CGPA          │                                         │
│ Study Planner │                                         │
│ AI Assistant  │                                         │
│ Events        │                                         │
│ Clubs         │                                         │
│ Lost & Found  │                                         │
│ Resources     │                                         │
│ Analytics     │                                         │
│ Settings      │                                         │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
```

Sidebar should support collapse/expand.

---

## Mobile

Use:

- Compact top bar
- Bottom navigation
- Hamburger menu
- Responsive cards
- Horizontally scrollable charts where necessary
- Touch-friendly buttons
- Mobile-friendly forms

Never allow desktop UI to simply overflow on mobile.

---

# 7. LANDING PAGE

Create a polished public landing page.

## Hero

Headline:

> **Your entire campus, in one place.**

Subtitle:

> Manage classes, attendance, assignments, exams, events, resources and your academic goals with one intelligent campus companion.

Buttons:

- Get Started
- Explore CampusOS

Include an attractive product dashboard preview.

---

## Landing page sections

### Problem

Explain how students struggle with scattered academic information.

### Solution

Show CampusOS as the unified solution.

### Features

Use feature cards for:

- Smart Timetable
- Attendance
- Assignments
- Exams
- AI Study Planner
- CGPA Calculator
- Campus Events
- Resources
- Analytics

### AI section

Highlight CampusOS Intelligence.

Example:

> "You have 2 exams and 3 assignments this week. Your Physics attendance is approaching the warning threshold."

### Statistics

Use believable placeholder metrics rather than fake claims of real users.

### CTA

> **Take control of your campus life.**

---

# 8. AUTHENTICATION

Create:

- Sign Up
- Login
- Forgot Password
- Reset Password
- Logout

Signup fields:

- Name
- Email
- Password
- University
- Course
- Semester
- Section
- Student ID

Support Supabase authentication.

If Supabase is unavailable, provide a demo authentication mode.

Never expose API keys in frontend code or source control.

---

# 9. DASHBOARD — STUDENT COMMAND CENTER

This is the most important screen.

The dashboard should immediately answer:

> **What matters today?**

Display:

### Greeting

Example:

> Good morning, Sneha 👋

> Here's what your academic day looks like.

---

## Quick statistics

Cards:

```text
Attendance
87%

Assignments
3 Pending

Exams
2 Upcoming

SGPA
9.1
```

---

# 10. TODAY'S SCHEDULE

Display today's classes as timeline cards.

Example:

```text
10:00 AM
Engineering Mathematics
LH-401
Dr. Sharma

12:00 PM
Programming
Lab-3
Prof. Das
```

Highlight the current class.

Display:

- Started
- Upcoming
- Completed

---

# 11. URGENT ACTIONS

Create an intelligent "Priority" section.

Examples:

> 🔴 Programming assignment due tomorrow

> 🟠 Physics exam in 3 days

> 🟡 Attendance in BEE is below your target

Use priority scoring.

---

# 12. AI DAILY INSIGHT

Display an AI-generated summary such as:

> "You have a moderately busy week. Prioritize your Programming assignment today and revise Engineering Mathematics for 60 minutes."

Include:

**View full analysis →**

---

# 13. TIMETABLE MODULE

Create a complete timetable management system.

Views:

- Weekly
- Daily

Days:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

Each class contains:

- Subject
- Faculty
- Room
- Start time
- End time
- Type
- Notes
- Color

Actions:

- Add class
- Edit class
- Delete class
- Duplicate class

---

## Current class indicator

Automatically determine the current class based on system time.

Display:

> NOW

for the active class.

---

# 14. ATTENDANCE MODULE

Allow users to create subjects.

Each subject:

- Subject name
- Faculty
- Total classes
- Attended
- Missed
- Attendance percentage
- Minimum required percentage

Calculate:

```text
Attendance % =
(Classes Attended / Total Classes) × 100
```

---

## Attendance status

### Safe

Above target.

### Warning

Near target.

### Critical

Below target.

Use visual indicators.

---

# 15. ATTENDANCE FORECAST

Calculate:

- Classes required to reach target
- Classes that can safely be missed
- Projected attendance after upcoming classes

Example:

> You need to attend the next 5 classes to reach 75%.

Also provide a scenario simulator:

```text
If I attend next 5 classes:
82%

If I miss next 2 classes:
76%
```

---

# 16. ASSIGNMENT MANAGER

Create a complete assignment system.

Fields:

- Title
- Subject
- Description
- Due date
- Priority
- Status
- Notes
- Attachment

Statuses:

- Not Started
- In Progress
- Completed
- Overdue

Views:

- List
- Calendar
- Board

Filters:

- Subject
- Priority
- Status
- Due date

---

# 17. ASSIGNMENT PRIORITY ENGINE

Automatically calculate urgency based on:

- Due date
- Priority
- Estimated effort
- Subject importance

Show:

### Recommended next task

> Complete Engineering Mathematics assignment.

Reason:

> Due tomorrow and estimated at 2 hours.

---

# 18. EXAM CENTER

Create exam management.

Fields:

- Subject
- Exam date
- Start time
- Duration
- Venue
- Syllabus
- Preparation percentage
- Notes

Display:

```text
Engineering Mathematics

Exam in:
5 days

Preparation:
64%

Venue:
LH-401
```

Use countdown timers.

---

# 19. AI STUDY PLANNER

Allow students to enter:

- Subject
- Exam date
- Topics
- Topic difficulty
- Current preparation
- Hours available per day
- Preferred study time

Gemini should generate:

```text
DAY 1
Calculus
90 minutes

DAY 2
Differentiation
60 minutes

DAY 3
Practice Problems
90 minutes

DAY 4
Revision
60 minutes
```

Include:

- Daily study blocks
- Revision sessions
- Practice questions
- Mock tests
- Rest/buffer sessions

Allow students to regenerate the plan.

Allow editing.

Allow marking sessions as complete.

---

# 20. AI STUDY ASSISTANT

Create a dedicated AI chat interface.

Students can ask:

- Explain a topic
- Create revision questions
- Summarize a concept
- Make a study plan
- Prioritize assignments
- Analyze workload
- Prepare for exams

The assistant should understand available student context.

For example, if the student asks:

> "What should I study tonight?"

The AI should consider:

- Upcoming exams
- Assignments
- Timetable
- Subject difficulty
- Available study hours

instead of giving a generic response.

---

# 21. AI CONTEXT ENGINE

Create a structured context object containing relevant student data:

```javascript
{
  student,
  timetable,
  attendance,
  assignments,
  exams,
  studyPlans,
  events,
  academicPerformance
}
```

Only send the minimum relevant context to Gemini.

Do not expose sensitive authentication information.

---

# 22. CGPA CALCULATOR

Create a complete academic calculator.

For each subject:

- Subject
- Credits
- Grade
- Grade point

Formula:

```text
SGPA =
Σ(Credit × Grade Point) / Σ(Credits)
```

CGPA:

```text
CGPA =
Σ(Semester Credits × SGPA) /
Σ(Semester Credits)
```

Support:

- Multiple semesters
- Multiple subjects
- Custom grade scales
- Add/remove subjects
- Automatic calculation
- Semester comparison
- Performance graph

---

# 23. ANALYTICS DASHBOARD

Create visual analytics using Recharts.

Charts:

### SGPA Trend

Semester vs SGPA

### Attendance Trend

Subject vs percentage

### Assignment Completion

Completed vs pending

### Study Hours

Daily/weekly study time

### Subject Performance

Compare subject performance.

Include AI-generated interpretation.

Example:

> "Your academic performance improved by 0.4 SGPA points compared with the previous semester."

Only generate claims from actual stored data.

---

# 24. CAMPUS EVENTS

Create an event discovery system.

Categories:

- Hackathons
- Workshops
- Seminars
- Cultural
- Sports
- Competitions
- Clubs
- Technical events

Each event:

- Title
- Category
- Date
- Time
- Venue
- Organizer
- Description
- Registration link
- Image
- Save button

Actions:

- Save
- Register
- Add to calendar
- Share

---

# 25. CLUBS & COMMUNITIES

Create club discovery.

Examples:

- Coding Club
- AI/ML Club
- Robotics Club
- Music Club
- Photography Club
- Entrepreneurship Club
- Sports Club

Club profile:

- Logo
- Name
- Description
- Category
- Members
- Events
- Contact
- Join button

---

# 26. LOST & FOUND

Create two workflows:

### Report Lost Item

Fields:

- Item name
- Category
- Location
- Date
- Description
- Image
- Contact preference

### Report Found Item

Same structure.

Allow:

- Search
- Filter
- Category
- Location
- Date

Display cards with image, description and status.

Statuses:

- Open
- Matched
- Resolved

---

# 27. CAMPUS RESOURCE HUB

Create a centralized academic resource repository.

Categories:

- Notes
- Previous year papers
- Lab manuals
- Books
- Lecture slides
- Tutorials
- Study guides

Resource fields:

- Title
- Subject
- Type
- Description
- Author/uploader
- Upload date
- File
- Tags

Features:

- Search
- Filter
- Bookmark
- Download
- Upload

---

# 28. NOTIFICATION CENTER

Create notifications for:

- Upcoming class
- Assignment deadline
- Exam
- Attendance warning
- Study reminder
- Event

Support:

- Read/unread
- Mark all as read
- Notification grouping

---

# 29. GLOBAL SEARCH

Create a global search system.

Search across:

- Assignments
- Exams
- Subjects
- Events
- Clubs
- Resources
- Lost & Found

Use keyboard shortcut:

```text
Ctrl + K
```

Open a command/search palette.

---

# 30. COMMAND PALETTE

Create a premium command palette.

Example:

```text
Search CampusOS...

Go to Dashboard
Go to Timetable
Add Assignment
Add Exam
Calculate CGPA
Open AI Assistant
Create Study Plan
Find Event
```

Use keyboard navigation.

---

# 31. SETTINGS

Create:

### Profile

- Name
- Email
- University
- Course
- Semester
- Section
- Student ID

### Appearance

- Light mode
- Dark mode
- System

### Notifications

Toggle notification types.

### Academic Settings

- Attendance threshold
- Grade scale
- Default study hours

### Data

- Export data
- Import data
- Clear demo data

### Account

- Logout
- Delete account

---

# 32. DATABASE ARCHITECTURE

Create appropriate Supabase tables such as:

```text
profiles
subjects
timetable
attendance
assignments
exams
study_plans
study_sessions
events
clubs
club_members
lost_found
resources
notifications
academic_records
```

Use appropriate relationships.

Each student's private academic data must be associated with their authenticated user ID.

---

# 33. SECURITY

Implement:

- Authentication
- Protected routes
- Row Level Security
- Input validation
- Secure database policies
- Environment variables
- No hardcoded API secrets

Never expose private student records to another user.

Never commit:

```text
.env
.env.local
API keys
service-role keys
```

---

# 34. DEMO DATA

When first launched in demo mode, populate realistic sample data.

Student:

```text
Name: Sneha Ghosh
Course: B.Tech CSE (AI & ML)
Semester: 1
Section: A
```

Sample subjects:

- Engineering Mathematics
- Programming
- Basic Electrical Engineering
- Engineering Physics
- Communication
- Engineering Elective

Create realistic:

- Timetable
- Attendance
- Assignments
- Exams
- Events
- Study plans

The dashboard should look populated immediately.

Clearly indicate demo mode where appropriate.

---

# 35. EMPTY STATES

Never show blank pages.

If no data exists, display useful empty states.

Example:

> No assignments yet.

> Create your first assignment to start tracking your academic workload.

Button:

**+ Add Assignment**

---

# 36. LOADING STATES

Use skeleton loaders instead of blank screens.

Create:

- Dashboard skeleton
- Table skeleton
- Card skeleton
- Chart skeleton

---

# 37. ERROR HANDLING

Errors must be user-friendly.

Do not display raw technical errors.

Instead:

> Something went wrong while loading your assignments.

Buttons:

- Retry
- Go back

---

# 38. TOAST SYSTEM

Use toast notifications.

Examples:

> Assignment created successfully.

> Exam updated.

> Timetable saved.

> Study plan generated.

> Attendance updated.

---

# 39. ANIMATIONS

Use subtle animations.

Examples:

- Page transitions
- Card hover
- Button feedback
- Progress animations
- Modal transitions
- Chart entrance animations
- Sidebar transitions

Do not over-animate the interface.

Respect reduced-motion preferences.

---

# 40. ACCESSIBILITY

Ensure:

- Keyboard navigation
- Proper labels
- Good contrast
- Focus states
- Screen-reader-friendly buttons
- Accessible form controls
- Large enough touch targets

---

# 41. PERFORMANCE

Optimize:

- Component rendering
- Images
- API calls
- Database queries
- Chart rendering

Use reusable components.

Avoid unnecessary duplication.

---

# 42. COMPONENT ARCHITECTURE

Use reusable components such as:

```text
Navbar
Sidebar
MobileNav
StatCard
ProgressCard
SubjectCard
AssignmentCard
ExamCard
EventCard
ChartCard
Modal
Dialog
Toast
Badge
Button
Input
Select
DatePicker
EmptyState
LoadingSkeleton
CommandPalette
```

Do not create huge monolithic React components.

---

# 43. ROUTING

Use React Router.

Suggested routes:

```text
/
 /login
 /signup
 /forgot-password

/app
/app/dashboard
/app/timetable
/app/attendance
/app/assignments
/app/exams
/app/cgpa
/app/study-planner
/app/ai
/app/events
/app/clubs
/app/lost-found
/app/resources
/app/analytics
/app/settings
```

Protect `/app/*`.

Unauthenticated users should be redirected to authentication.

---

# 44. RESPONSIVE BREAKPOINTS

Design for:

- Small mobile
- Mobile
- Tablet
- Laptop
- Desktop
- Large desktop

Do not allow horizontal page overflow.

Tables should transform into cards or horizontally scroll when necessary.

---

# 45. DATA PERSISTENCE

Demo mode:

Use localStorage.

Production mode:

Use Supabase.

Create an abstraction layer so the UI does not depend directly on localStorage or Supabase.

For example:

```text
services/
  authService
  assignmentService
  timetableService
  attendanceService
  examService
  eventService
  resourceService
```

---

# 46. AI SERVICE ARCHITECTURE

Create an AI service layer.

Example:

```text
services/
  geminiService.js
```

Functions:

```javascript
generateStudyPlan()
analyzeWorkload()
generateRevisionQuestions()
explainTopic()
generateAcademicInsight()
prioritizeAssignments()
```

Handle:

- Loading
- API errors
- Rate limits
- Empty responses
- Retry

---

# 47. IMPORTANT AI SAFETY

The AI should not pretend to know information that is not present.

If insufficient context exists, explicitly say that more information is required.

Academic recommendations should be presented as recommendations, not guaranteed outcomes.

---

# 48. NOTIFICATION LOGIC

Automatically generate reminders for:

### Assignments

- 7 days before
- 3 days before
- 1 day before
- Overdue

### Exams

- 14 days before
- 7 days before
- 3 days before
- 1 day before

### Attendance

Trigger warnings when attendance falls below configured thresholds.

---

# 49. STUDENT PRODUCTIVITY SCORE

Create an optional productivity overview based on:

- Assignment completion
- Study sessions
- Attendance
- Exam preparation
- Task completion

Do NOT present it as a judgment of the student's ability.

Instead call it:

> Weekly Academic Focus

---

# 50. DASHBOARD INTELLIGENCE

The dashboard should dynamically determine important information.

Example logic:

```text
IF assignment due soon
→ increase priority

IF exam approaching
→ show exam preparation card

IF attendance below threshold
→ show attendance warning

IF no urgent tasks
→ recommend study session

IF upcoming event matches saved interests
→ highlight event
```

This is the central intelligence layer of CampusOS.

---

# 51. SAMPLE COMMAND CENTER

Example dashboard:

```text
Good morning, Sneha 👋

Here's what matters today.

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Attendance   │ Assignments  │ Exams        │ SGPA         │
│ 87%          │ 3 Pending    │ 2 Upcoming   │ 9.1          │
└──────────────┴──────────────┴──────────────┴──────────────┘

TODAY

10:00
Engineering Mathematics
LH-401

12:00
Programming
Lab 3

──────────────────────────────────────

AI INSIGHT

You have 3 assignments due this week.
Your Mathematics exam is in 5 days.

Recommended:
90 minutes of Mathematics revision tonight.

──────────────────────────────────────

URGENT

🔴 Programming Assignment — Tomorrow

🟠 Mathematics Exam — 5 Days

🟡 BEE Attendance — 76%

──────────────────────────────────────

UPCOMING EVENTS

AI Hackathon
Saturday
Campus Auditorium
```

---

# 52. MICRO-INTERACTIONS

Include:

- Hover states
- Active navigation states
- Animated progress bars
- Smooth modal opening
- Button press feedback
- Checkmark animation after completion
- Countdown updates
- Real-time attendance percentage updates

---

# 53. FORMS

All forms must:

- Validate input
- Display errors clearly
- Prevent invalid submissions
- Provide loading states
- Show success feedback
- Reset after successful submission where appropriate

---

# 54. CODE QUALITY

Write clean, maintainable code.

Use:

- Meaningful variable names
- Reusable functions
- Reusable components
- Clear folder organization
- Comments only where useful
- No unnecessary duplication
- No dead code

Avoid giant components.

---

# 55. README

Generate a professional README containing:

- Project overview
- Features
- Screenshots section
- Tech stack
- Architecture
- Installation
- Environment variables
- Supabase setup
- Gemini setup
- Demo mode
- Database structure
- Security
- Future roadmap
- Author
- License

---

# 56. ENVIRONMENT FILE

Create:

```text
.env.example
```

Containing:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

Never place actual secrets in source code.

---

# 57. GITHUB READINESS

The project should be ready to push to GitHub.

Include:

```text
.gitignore
README.md
.env.example
package.json
```

Do not include:

```text
.env
node_modules
private API keys
```

---

# 58. FINAL QUALITY REQUIREMENT

Before considering the project complete, test every major flow.

Verify:

### Authentication

- Sign up
- Login
- Logout

### Dashboard

- Data loads
- Stats calculate correctly
- Command Center updates

### Timetable

- Add
- Edit
- Delete
- Current class detection

### Attendance

- Add attendance
- Update attendance
- Percentage calculation
- Forecast

### Assignments

- Create
- Edit
- Complete
- Delete
- Filter
- Overdue detection

### Exams

- Create
- Countdown
- Preparation tracking

### CGPA

- Correct SGPA
- Correct CGPA
- Multiple semesters

### AI

- Assistant
- Study planner
- Insights

### Events

- Browse
- Search
- Save

### Resources

- Search
- Filter
- Bookmark

### Lost & Found

- Create report
- Search
- Filter

### Settings

- Update profile
- Theme
- Notifications

---

# 59. CRITICAL UX RULE

Do not make the user manually navigate through multiple pages to understand their academic situation.

The dashboard should intelligently surface important information.

For example:

Instead of:

> "Go to Assignments → find your assignment → check due date."

Show directly:

> 🔴 Programming assignment due tomorrow.

Instead of:

> "Go to Exams → check exam date."

Show:

> 🧪 Mathematics exam in 5 days.

Instead of:

> "Open Attendance → check every subject."

Show:

> ⚠️ BEE attendance has fallen below your target.

CampusOS should behave like a **personal academic operating system**, not merely a database interface.

---

# 60. IMPLEMENTATION PRIORITY

Build in this order:

### Phase 1

- Project setup
- Routing
- Design system
- Authentication
- Dashboard
- Navigation

### Phase 2

- Timetable
- Attendance
- Assignments
- Exams
- CGPA

### Phase 3

- AI Assistant
- AI Study Planner
- CampusOS Intelligence
- Analytics

### Phase 4

- Events
- Clubs
- Lost & Found
- Resources

### Phase 5

- Notifications
- Search
- Command Palette
- Settings
- Responsive optimization
- Accessibility
- Performance

---

# 61. DO NOT USE PLACEHOLDER UI

Do not leave major sections as:

```text
Coming Soon
Lorem ipsum
Placeholder
TODO
```

Every major page should contain functional interface elements.

If a backend feature cannot be fully configured, implement a working local/demo version.

---

# 62. FINAL EXPECTATION

The final application should feel like a **real startup-quality campus platform**.

It should be:

- Intelligent
- Fast
- Beautiful
- Responsive
- Modular
- Scalable
- Secure
- Accessible
- Practical

The final experience should make a student feel:

> "I don't need five different apps to manage college anymore."

### FINAL BRAND STATEMENT

# 🎓 CampusOS

> **Your entire campus, in one place.**

Build the complete application now, including the frontend, routing, reusable components, demo data, local persistence, Supabase integration structure, Gemini integration structure, responsive design, analytics, AI features, and professional README.
