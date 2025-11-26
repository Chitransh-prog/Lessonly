**Lessonly – AI Teaching Assistant**
====================================

Lessonly is a lightweight, fast, and AI-powered tool that helps educators generate high-quality classroom content within seconds.It supports lesson plans, quizzes, notes, mindmaps, and PDF exports ,all powered by modern tools like **React**, **TailwindCSS**, and **Supabase**.

🚀 Features
-----------

### ✨ AI Content Generation

*   Create lesson plans, summaries, quizzes, or explanations.
    
*   Powered by **Gemini AI** through secure Supabase Edge Functions.
    

### 🧠 Mindmap Generator

*   Upload a PDF → Extract text → Convert it into a visual mindmap.
    
*   Built with **React Flow**, supports export and saving.
    

### 📚 History & Library

*   Save generated materials to your Supabase database.
    
*   Edit, download, or regenerate anytime.
    

### 🔐 Secure Authentication

*   User login/signup via **Supabase Auth**.
    
*   Row Level Security ensures each user accesses only their own data.
    

### 📄 Export Options

*   Download content as **PDF** with a branded header.
    
*   Mindmap export as **PNG**.
    

🛠️ Tech Stack
--------------

### **Frontend**

*   React (Vite)
    
*   TailwindCSS
    
*   DaisyUI
    
*   shadcn/ui components
    
*   React Markdown + Highlight.js
    
*   React Flow (for mindmaps)
    

### **Backend**

*   Supabase
    
    *   Authentication
        
    *   Database (PostgreSQL)
        
    *   Row Level Security (RLS)
        
    *   Storage
        
    *   Edge Functions (AI calls)
        

### **AI**

*   Google Gemini API (via Supabase Edge Functions)
📦 Installation
---------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   git clone https://github.com/your-username/lessonly.git  cd lessonly  npm install  npm run dev   `

Create .env file:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   VITE_SUPABASE_URL=your_url  VITE_SUPABASE_ANON_KEY=your_key   `

📁 Folder Structure
-------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML

src/ ├── pages/ ├── components/ ├── api/ ├── utils/ ├── lib/ └── animations/

👨‍💻 Contributors
------------------

*   **Chitransh Prasad**
    
*   **Sumit Dixit**
    
*   **Aryan Kumar**
    
*   **Sanjay Prasad Yadav**
    
