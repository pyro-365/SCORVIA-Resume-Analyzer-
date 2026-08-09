
# 🎥 Demo

### YouTube Demo

[Watch the SCORVIA Demo](https://www.youtube.com/watch?v=zxB7HfeOJdk)

### Google Drive Demo

[View Demo on Google Drive](https://drive.google.com/file/d/1ffiXXpVG-HSd9mnCA_pdVWgl7GQbQznc/view?usp=drive_link)

---

# 📂 Project Files

Additional project files are available through the following Google Drive resources:

* [Project ZIP File](https://drive.google.com/file/d/1uk9HmNNdh9Ah2H-kggcVeqQPRZfNaw-a/view?usp=sharing)
* [Project Files Folder](https://drive.google.com/drive/folders/1qo5rjUb1VrTcLWYm8DDW7d6u0Mg_dwkW?usp=sharing)

---

````markdown
# SCORVIA – Resume Analyzer

> An offline, rule-based Resume Screening and Job Matching System that automatically analyzes resumes against Job Descriptions and generates a relevance score to help recruiters identify suitable candidates faster.

---

## 📌 Overview

**SCORVIA – Resume Analyzer** is a resume screening and job-matching application designed to reduce the time and effort required for manually reviewing large numbers of resumes.

The system compares candidate resumes with a given **Job Description (JD)** using deterministic, rule-based text analysis. It identifies relevant skills, qualifications, keywords, and other job-related information and uses them to calculate a matching score.

Unlike cloud-based AI resume screening platforms, SCORVIA is designed around an **offline-first architecture**, making the analysis predictable, transparent, and independent of third-party AI APIs.

The project is organized into three major components:

- **Engine** – Core resume analysis and matching logic
- **Frontend** – User interface for interacting with the analyzer
- **Backend** – API layer connecting the frontend with the analysis engine

---

## 🎯 Problem Statement

Recruiters and organizations often receive hundreds or thousands of resumes for a single job opening.

Manually reviewing every resume against the corresponding Job Description can be:

- Time-consuming
- Labor-intensive
- Difficult to scale
- Prone to human error
- Inconsistent between reviewers

Qualified candidates may also be overlooked when recruiters have to process a large number of applications within a limited amount of time.

SCORVIA addresses this problem by automating the initial resume screening process and providing a consistent resume-to-job matching mechanism.

---

## 💡 Solution

SCORVIA analyzes a Job Description and candidate resumes using rule-based text processing.

The general workflow is:

```text
             ┌─────────────────────┐
             │   Job Description   │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │ Text Preprocessing  │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │ Keyword / Skill     │
             │ Extraction          │
             └──────────┬──────────┘
                        │
                        ▼
 ┌──────────────────────┴──────────────────────┐
 │                                             │
 ▼                                             ▼
Resume 1                                    Resume N
 │                                             │
 ▼                                             ▼
Resume Analysis                            Resume Analysis
 │                                             │
 └──────────────────────┬──────────────────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │ Matching & Scoring  │
             └──────────┬──────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │ Candidate Ranking   │
             │ / Results           │
             └─────────────────────┘
````

---

## ✨ Key Features

### 📄 Resume Analysis

The system analyzes candidate resumes and identifies information relevant to the provided Job Description.

### 🎯 Job Description Matching

Resumes are compared against the requirements specified in the Job Description.

### 🔎 Keyword-Based Analysis

The system identifies relevant keywords and skills from the Job Description and checks their presence or relevance within candidate resumes.

### 📊 Matching Score

A matching score is generated to represent how closely a candidate's resume corresponds to the provided Job Description.

### ⚡ Automated Screening

Instead of manually checking every resume, recruiters can use the system to perform the initial screening automatically.

### 🔌 Offline Processing

The core analysis engine is designed to operate without relying on external AI APIs or cloud-based inference services.

### 🔁 Deterministic Results

The same input produces consistent results because the matching process is based on predefined rules rather than probabilistic AI generation.

### 🧩 Modular Architecture

The application separates the analysis engine, frontend, and backend into independent components, making the system easier to maintain and extend.

---

# 🏗️ System Architecture

SCORVIA follows a modular architecture consisting of three primary layers.

```text
┌───────────────────────────────────────────────┐
│                   FRONTEND                    │
│                React + Vite                   │
│                                               │
│  Upload Resume • Enter JD • View Results      │
└───────────────────────┬───────────────────────┘
                        │
                        │ API Requests
                        ▼
┌───────────────────────────────────────────────┐
│                    BACKEND                    │
│                Node.js + Express              │
│                                               │
│       API Routes / Request Handling           │
└───────────────────────┬───────────────────────┘
                        │
                        │ Analysis Request
                        ▼
┌───────────────────────────────────────────────┐
│                 ANALYSIS ENGINE               │
│                   Pure JavaScript             │
│                                               │
│  Preprocessing → Extraction → Matching        │
│                   → Scoring                   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Screening Results │
              │                   │
              │ Match Score       │
              │ Skills            │
              │ Qualifications    │
              │ Candidate Ranking │
              └───────────────────┘
```

---

# 📁 Project Structure

```text
SCORVIA-Resume-Analyzer/
│
├── engine/
│   ├── cli/
│   │   ├── samples/
│   │   └── run.js
│   │
│   └── ...
│
├── frontend/
│   └── ...
│
├── backend/
│   └── ...
│
├── README.md
└── package.json
```

### `engine/`

Contains the core resume analysis and matching logic.

The engine is designed as a framework-independent JavaScript module so that it can be reused by different interfaces.

Responsibilities include:

* Text processing
* Resume analysis
* Job Description analysis
* Keyword matching
* Skill identification
* Candidate scoring
* CLI-based analysis

### `frontend/`

Contains the user-facing application.

The frontend is built using:

* React
* Vite

It provides the interface through which users can interact with the resume screening system.

### `backend/`

Contains the server-side application.

The backend is built using:

* Node.js
* Express

It provides the API layer between the frontend and the analysis engine.

---

# ⚙️ Technology Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Frontend         | React                     |
| Frontend Tooling | Vite                      |
| Backend          | Node.js                   |
| API Framework    | Express                   |
| Analysis Engine  | Pure JavaScript           |
| Package Manager  | npm                       |
| Testing          | npm test                  |
| Code Quality     | ESLint                    |
| Architecture     | Modular / Workspace-based |

---

# 🔄 How SCORVIA Works

## Step 1 – Job Description Input

The recruiter provides the Job Description containing requirements such as:

* Required skills
* Technical knowledge
* Qualifications
* Experience
* Responsibilities
* Job-specific keywords

---

## Step 2 – Resume Input

One or more candidate resumes are supplied to the system.

The resumes become the input documents for the screening engine.

---

## Step 3 – Text Processing

The analysis engine processes the input text to make comparison possible.

Typical processing operations include:

* Text normalization
* Keyword identification
* Relevant term extraction
* Comparison preparation

---

## Step 4 – Requirement Matching

The extracted information from the resume is compared against the requirements identified from the Job Description.

For example:

```text
Job Description:

Python
SQL
Machine Learning
Data Analysis
Git
```

Candidate Resume:

```text
Python
SQL
Pandas
Machine Learning
Git
```

The system can identify overlapping requirements such as:

```text
✓ Python
✓ SQL
✓ Machine Learning
✓ Git
```

---

## Step 5 – Score Generation

The matching information is used to generate a candidate relevance score.

A higher score indicates stronger alignment between the resume and the Job Description.

Example:

```text
Candidate A → 92%
Candidate B → 76%
Candidate C → 61%
Candidate D → 43%
```

This allows recruiters to prioritize candidates for further review.

> **Important:** The score is a screening indicator, not a final hiring decision.

---

# 🧠 Rule-Based Approach

SCORVIA intentionally uses a deterministic rule-based approach rather than depending on a generative AI model.

This provides several advantages:

### Predictability

The system follows predefined rules, making its behavior easier to understand.

### Reproducibility

Identical input produces consistent results.

### Transparency

The matching process can be inspected and explained based on the detected requirements and matching terms.

### Offline Capability

The core analysis does not require sending resume information to an external AI service.

### Lower Infrastructure Requirements

The project can be operated without requiring a paid AI API.

---

# 🖥️ Engine CLI

The analysis engine can also be executed directly through the command line.

Example:

```bash
node engine/cli/run.js \
  --jd engine/cli/samples/jd.txt \
  --resumes engine/cli/samples/
```

### Parameters

| Parameter   | Description                            |
| ----------- | -------------------------------------- |
| `--jd`      | Path to the Job Description            |
| `--resumes` | Directory containing candidate resumes |

Example:

```bash
node engine/cli/run.js \
  --jd ./samples/data-scientist-jd.txt \
  --resumes ./samples/resumes/
```

---

# 🚀 Installation

## Prerequisites

Make sure the following software is installed:

* Node.js
* npm
* Git

Verify the installation:

```bash
node --version
npm --version
git --version
```

---

# 📥 Clone the Repository

```bash
git clone https://github.com/pyro-365/SCORVIA-Resume-Analyzer-.git
```

Move into the project directory:

```bash
cd SCORVIA-Resume-Analyzer-
```

---

# 📦 Install Dependencies

Install the project dependencies:

```bash
npm install
```

---

# ▶️ Run the Application

## Start Backend

```bash
npm run dev:backend
```

---

## Start Frontend

Open another terminal and run:

```bash
npm run dev:frontend
```

The Vite development server will provide the frontend URL in the terminal.

---

# 🧪 Testing

Run the project test suite using:

```bash
npm test
```

Testing the analysis engine is especially important because the matching and scoring logic forms the core of the application.

---

# 🧹 Linting

Run linting across the project:

```bash
npm run lint
```

Linting helps maintain:

* Consistent code style
* Better readability
* Fewer common coding mistakes
* Maintainable source code

---

# 📊 Example Screening Workflow

Consider a Job Description for an:

**AI Engineer**

### Required Skills

```text
Python
Machine Learning
Deep Learning
SQL
Git
```

A candidate resume contains:

```text
Python
Machine Learning
SQL
Git
Pandas
NumPy
```

The analyzer identifies the overlap:

```text
Matched:
✓ Python
✓ Machine Learning
✓ SQL
✓ Git

Not Found:
✗ Deep Learning
```

The resulting score can then be used to determine the candidate's relative relevance.

---

# 👥 Target Users

SCORVIA can be useful for:

* Recruiters
* HR teams
* Hiring managers
* Startups
* Small organizations
* Students building recruitment technology
* Developers experimenting with resume analysis
* Organizations requiring offline screening workflows

---

# 🔐 Privacy & Data Considerations

A major design consideration of SCORVIA is minimizing dependency on external AI services.

Because the core analysis engine is designed to work offline:

* Resume content does not inherently need to be sent to a third-party AI API.
* The analysis can be performed locally.
* Organizations can retain greater control over candidate information.

However, users should still follow appropriate organizational privacy, security, and data-retention policies when handling real resumes.

---

# ⚖️ Limitations

SCORVIA is a **rule-based screening system**, so it has limitations compared with advanced semantic or LLM-based recruitment systems.

Potential limitations include:

* Keyword-based matching may miss semantic relationships.
* Synonyms may not always be recognized.
* Context surrounding a skill may not always be understood.
* Resume formatting can affect extracted information.
* Matching scores should not be treated as definitive hiring decisions.
* Human review remains important for final candidate evaluation.

---

# 🔮 Future Enhancements

The system can be extended with additional capabilities such as:

### 🤖 Semantic Matching

Introduce NLP or embedding-based techniques to identify conceptually similar skills rather than relying only on exact keyword matches.

### 🧠 AI-Assisted Resume Analysis

Optional integration with an LLM could provide deeper explanations of candidate-to-JD alignment.

### 📑 Resume Parsing

Add structured extraction of:

* Name
* Email
* Phone
* Education
* Experience
* Skills
* Certifications
* Projects

### 📊 Advanced Candidate Ranking

Provide detailed ranking dashboards with:

* Overall match score
* Skill match percentage
* Experience match
* Education match
* Missing skills
* Strengths
* Weaknesses

### 📈 Recruiter Dashboard

Add visual analytics for:

* Number of applicants
* Average score
* Top candidates
* Skill distribution
* Requirement coverage

### 📤 Export Results

Support exporting screening results to:

* CSV
* Excel
* PDF

### 🔐 Authentication

Add recruiter accounts and role-based access control.

### 🗄️ Database Integration

Store:

* Job Descriptions
* Candidate profiles
* Screening results
* Historical analysis

---

# 🛡️ Responsible Use

SCORVIA should be used as an **assistive screening tool**, not as an autonomous hiring decision-maker.

Recruitment decisions can involve factors that cannot always be captured from textual similarity alone.

Recruiters should therefore review shortlisted candidates manually before making employment decisions.

---



# 🛠️ Development Commands

| Command                      | Purpose                           |
| ---------------------------- | --------------------------------- |
| `npm install`                | Install dependencies              |
| `npm run dev:backend`        | Start backend development server  |
| `npm run dev:frontend`       | Start frontend development server |
| `npm test`                   | Run tests                         |
| `npm run lint`               | Run linting                       |
| `node engine/cli/run.js ...` | Run engine from CLI               |

---

# 📌 Project Goals

SCORVIA aims to provide a:

* Fast
* Simple
* Transparent
* Deterministic
* Offline-capable
* Modular

resume screening solution.

The project demonstrates how a recruitment workflow can be automated using conventional software engineering and rule-based text analysis without requiring a third-party AI service.

---

# 🤝 Contributing

Contributions are welcome.

A typical contribution workflow is:

```bash
# Fork the repository

# Clone your fork
git clone <your-fork-url>

# Create a feature branch
git checkout -b feature/your-feature

# Make your changes

# Commit your changes
git add .
git commit -m "Add your feature"

# Push the branch
git push origin feature/your-feature
```

Then create a Pull Request describing:

* What was changed
* Why the change was required
* How the change was tested

---

# 📜 License

Add the project's applicable license here.

If this project is intended to be open source, consider adding an appropriate license file such as MIT, Apache-2.0, or another license suitable for your project.

---

# 👨‍💻 Author

Developed as a Resume Screening and Job Matching System using a modular JavaScript architecture.

**Repository:**
[https://github.com/pyro-365/SCORVIA-Resume-Analyzer-](https://github.com/pyro-365/SCORVIA-Resume-Analyzer-)

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

```

### One important correction

I would **not claim features such as PDF parsing, semantic NLP, AI scoring, database storage, authentication, or advanced ranking as currently implemented** unless those components actually exist in the source code. I've placed them under **Future Enhancements** above.

The repository's current README explicitly confirms the three-part structure—`engine`, `frontend`, and `backend`—and the commands for backend, frontend, testing, linting, and the engine CLI. 

You can also access the project directly here: :contentReference[oaicite:2]{index=2}
```
