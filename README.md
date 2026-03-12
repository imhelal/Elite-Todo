# Elite Todo PWA

A high-performance, minimalist Todo application built for the modern web. This Progressive Web App (PWA) features real-time synchronization, offline support, and a premium "Glassmorphic" user interface.

## 🚀 Features

- **Cloud Sync**: Real-time task synchronization across all your devices via Supabase.
- **Offline First**: Fully functional without an internet connection using Service Workers.
- **PWA Ready**: Installable on iOS, Android, and Desktop with a native-app feel.
- **Elite UI**: Modern design featuring glassmorphism, smooth animations, and dynamic themes.
- **Optimistic Updates**: Zero-latency interactions with background synchronization.
- **App Badging**: Live task count on the app icon.

## 🛠️ Built With

- **React** - Component-based UI logic.
- **Vite** - Lightning-fast build tool and PWA integration.
- **Supabase** - Real-time database and secure cloud persistence.
- **Framer Motion** - High-end animations and transitions.
- **Lucide React** - Clean and consistent iconography.

## 🏁 Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
4. **Run development server**:
   ```bash
   npm run dev
   ```

## 📐 Project Structure

- `/src/context` - State management and data synchronization logic.
- `/src/components` - Reusable UI components.
- `/src/lib` - Client initializations and utility functions.
- `/src/index.css` - Custom-crafted design system and animations.

---
Created with a focus on performance and user experience.
