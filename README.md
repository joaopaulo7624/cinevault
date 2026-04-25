
<h1 align="center">🎬 CineVault</h1>

<p align="center">
  <strong>A Premium "Refined Liquid Glass" Media & Movie Tracking Dashboard</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#security">Security</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 📖 About the Project

**CineVault** is a modern, high-end web application designed for movie enthusiasts and digital collectors. By combining the power of the TMDB API, Firebase, and a sleek "Refined Liquid Glass" UI aesthetic, CineVault offers a seamless and professional way to track your favorite films, analyze your viewing habits, and manage your personal media library.

## ✨ Features

- **"Refined Liquid Glass" UI**: A premium, dark-mode focused interface with sophisticated glassmorphism.
- **Smart Discovery**: AI-enhanced movie recommendations tailored to your tastes.
- **Comprehensive Library Management**: Easily add, organize, and categorize movies.
- **Data Visualization**: Beautiful charts tracking your viewing habits over time.
- **Secure Authentication**: Robust user management backed by Firebase Auth.
- **Real-time Synchronization**: Instant data updates across devices using Cloud Firestore.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism Utilities
- **Animations**: GSAP & Framer Motion
- **Smooth Scrolling**: Lenis
- **Backend & Database**: Firebase (Auth, Firestore, Storage)
- **State Management**: Zustand
- **External Data**: TMDB API + Google Gemini AI

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js**: `v20.0.0` or higher recommended.
- **NPM** or **Yarn** package manager.
- A **TMDB API Key** (v3).
- A **Firebase Project** configured.
- A **Google Gemini API Key**.

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cinevault.git
   cd cinevault
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and fill in your secure credentials:
   ```bash
   cp .env.example .env.local
   ```
   > **⚠️ Security Warning:** Never commit `.env.local` to version control. The repository is pre-configured to ignore it.

## 💻 Usage

To run the application locally in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔒 Security

Security is a top priority for CineVault.
- We employ **Secret Scanning** and strongly recommend never hardcoding credentials.
- Read our [Security Policy](SECURITY.md) for reporting vulnerabilities.
- For production deployments, always use secure Environment Variables or Secret Managers.

## 🤝 Contributing

We welcome contributions to make CineVault even better! Please read our [Contribution Guidelines](CONTRIBUTING.md) (coming soon) before submitting a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

## 📧 Contact

**João Paulo** - [joaopaulo187543@gmail.com](mailto:joaopaulo187543@gmail.com)

Project Link: [https://github.com/your-username/cinevault](https://github.com/your-username/cinevault)
