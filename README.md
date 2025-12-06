# <img src="https://raw.githubusercontent.com/sayuj1/pigb/main/public/logo.png" width="25" /> **Pigb — Personal Finance Manager**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Open Source](https://badges.frapsoft.com/os/v3/open-source.svg?v=103)
![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-black)


**Manage your finances with ease — track income, expenses, budgets, savings, loans, and more in one beautiful dashboard.**

Pigb is an open-source personal finance management platform built with **Next.js**, **MongoDB**, **Redis**, and **Node APIs**.  
It helps users organize their financial life by providing tools for:

- 💸 Expense & income tracking  
- 📅 Budget planning  
- 💰 Savings & goals tracking  
- 📑 Loan management  
- 📊 Smart dashboards & insights  
- 🧾 PDF import (bank statements)  
- 🔐 secure auth (Google OAuth + JWT)

🔗 **Live Demo:** http://pigb.sehgaltech.com/  
🔗 **GitHub Repo:** https://github.com/sayuj1/pigb  
<br/>

<!-- ## 🖼️ Screenshots

> Add screenshots in `/screenshots` folder and reference them here. -->
<!-- /screenshots
├── dashboard.png
├── transactions.png
├── budgets.png
└── loans.png -->


<!-- --- -->

## 🚀 Features

### ✔ Core Features
- Track **income and expenses** with categories, accounts & filters  
- Visualize spending trends with **beautiful charts**  
- Create **monthly budgets** and monitor overspend  
- Manage **loan EMIs**, repayments & closure tracking  
- Maintain **multiple accounts** with running balances  
- **Savings accounts** with linked transactions  
- **Bank statement import (PDF)** with auto-parsing  
- Smart **Search + Filters** for all modules  
- **Google OAuth login**

### ✔ Technical Highlights
- Built using **Next.js App Router**
- Modular backend API layer  
- MongoDB + Mongoose  
- Redis 
- Reusable UI components (AntD + Tailwind)  
- Modern project structure  
- Open Source & extensible

<br/>

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js, React, TailwindCSS, AntD |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB Atlas |
| Auth | Google OAuth + JWT |
| Cache | Redis |
| Deployment | Vercel |


<br/>

# ⚙️ Getting Started (Local Setup Guide)

### 1. Clone the repository
```bash
git clone https://github.com/sayuj1/pigb.git
cd pigb 
```
### 2. Install dependencies
```bash
npm install
```
### 3. Create .env.local file

Create a .env.local file in the project root:
```bash
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
API_BASE_URL=
REDIS_URL=
```
Notes:
- JWT_SECRET should be a long, random string.
- API_BASE_URL is usually http://localhost:3000/api for local development.
- Google OAuth credentials can be created from Google Cloud Console.
- REDIS_URL should point to your local or cloud Redis instance.

### 4. Start the development server
```bash
npm run dev
```
Your app will be available at:
```bash
http://localhost:3000
```
<br/>

# 📦 Folder Structure
```bash
/app
  /api            → Backend API routes
  /dashboard      → Main UI pages
  /auth           → Login / Signup

/components       → Reusable UI components
/hooks            → Custom hooks
/lib              → Utilities (JWT, Zod, helpers)
/models           → Mongoose models
/context          → Global providers (CustomReportContext)
```



<br/>

# 🤝 How to Contribute
We welcome contributions from the community!

### 1. Fork the repository

Click Fork at the top-right of the GitHub page.

### 2. Create your feature branch
```bash
git checkout -b feature/my-new-feature
```
### 3. Make your changes
### 4. Commit and push
```bash
git commit -m "Add my new feature"
git push origin feature/my-new-feature
```

### 5. Open a Pull Request

Submit your PR and describe your changes clearly.

Ideas for contributions:

- UI/UX improvements
- New analytics widgets
- Support more banks in the PDF import
- Performance improvements
- Bugs / issue fixes
- Enhancing documentation

---
<br/>

# 🐛 Reporting Issues
Found a bug or want a new feature?

➡️ Create an issue here: https://github.com/sayuj1/pigb/issues

Include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots / logs

<br/>

# 🗺️ Roadmap
- CSV Import (Bank statements)
- Mobile App (React Native)
- Advanced Financial Insights (AI-powered)
- Multi-user shared budgets
- Automatic SMS parsing for transactions
- More UI themes

<br/>

# 👥 Contributors

Thanks to the amazing people contributing to Pigb! <br/><br/>
<img src="https://contrib.rocks/image?repo=sayuj1/pigb" width="25" />


<br/>

# 📜 License

This project is open source and available under the MIT License.

<br/>

# ⭐ Support the Project

If you like this project:

- 🌟 Star the repo on GitHub
- 💬 Share feedback
- 🙌 Contribute