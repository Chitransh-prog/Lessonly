# 📘 Lessonly – AI Teaching Assistant

Lessonly is a smart AI-powered platform that helps teachers and educators generate high-quality classroom material within seconds.  
From lesson plans to quizzes and mindmaps — everything is automated with modern web technologies.

---

## 🚀 Features

### ✨ AI Content Generation  
- Create lesson plans, summaries, quizzes, and explanations.  
- Uses **Gemini AI** through secure Supabase Edge Functions.  

### 🧠 Mindmap Generator  
- Upload a PDF → Extract text → Generate mindmap.  
- Built using **React Flow**.  
- Export and save mindmaps to your library.

### 📚 Content History  
- Save generated content to your Supabase database.  
- Edit, re-download, or delete anytime.

### 🔐 Secure Authentication  
- User login/signup with **Supabase Auth**.  
- RLS ensures each user can access only their own content.

### 📄 Export Options  
- Download generated content as **PDF** (with logo/header).  
- Export mindmaps as **PNG** files.

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- Tailwind CSS
- DaisyUI  
- shadcn/ui  
- React Markdown + Highlight.js  
- React Flow

### **Backend**
- Supabase  
  - Authentication  
  - PostgreSQL Database  
  - Row Level Security  
  - Storage  
  - Edge Functions (AI Calls)

### **AI**
- Google Gemini API (via Supabase Edge Functions)

---

## 📦 Installation

Clone and install dependencies:

```bash
git clone https://github.com/your-username/lessonly.git
cd lessonly
npm install
npm run dev
```
## Add your Supabase environment variables:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

## 📁 Folder Structure
```bash
src/
 ├── pages/           # All page components
 ├── components/      # UI components
 ├── api/             # API calls (Supabase, AI, etc.)
 ├── utils/           # Helpers like pdf export, thumbnail generator
 ├── animations/      # Typing and UI animations
 └── lib/             # Supabase client
```

## 👨‍💻 Contributors:
- Chitransh Prasad
- Sumit Dixit
- Aryan Kumar
- Sanjay Prasad Yadav
