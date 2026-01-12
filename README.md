# Web Hackathon

**UMT TECHVERSE**
**Team Lead:** Muhammad Ahmad Butt<br>
**Contributors:** Muhammad Ahmed, Muhammad Arslan<br>
**University:** FAST NUCES

## Project Overview
This project is a comprehensive platform designed for a book exchange community, featuring AI-driven valuation, real-time communication, and location-based services. It connects users to trade books, participate in community forums, and locate physical exchange stalls.

**Repository:** Migrated from my private repo to hide env files.

## Tech Stack
**Frontend**
*   React (Vite)
*   Tailwind CSS
*   Lucide React / Ant Design Icons
*   MapLibre GL (OpenStreetMap)
*   Supabase Client

**Backend**
*   Node.js
*   Express.js
*   Supabase (PostgreSQL, Auth, Realtime)
*   Google Generative AI (Gemini)
*   QRCode Generation

## Features
*   **User Authentication & Profiles:** Secure login via Supabase with customizable user profiles, including location tracking and reputation scores.
*   **Book Exchange Management:** Users can list book inventories, manage wishlists, and initiate exchange requests (pending, completed, or cancelled).
*   **AI Integration:**
    *   **Book Valuation:** Automated calculation of book points, demand scores, and rarity using Google Gemini AI.
    *   **Content Moderation:** Real-time AI filtering for abusive content in chats and forum posts.
*   **Interactive Maps:** Visual mapping of user locations and physical Book Exchange Stalls using OpenStreetMap raster tiles.
*   **Community Forums & Chat:** Dedicated spaces for public discussions and private messaging between users.
*   **Exchange Stalls:** Discovery and management of physical locations for book drop-offs and collecting.
*   **Dashboard:** specialized interface for managing personal library, incoming requests, and notifications.

## Demo
![Landing Page](/demo/landingpage1.png)
![Landing Page](/demo/landingpage2.png)
![Landing Page](/demo/landingpage3.png)
![Landing Page](/demo/landingpage4.png)
![Landing Page](/demo/landingpage5.png)
![Landing Page](/demo/landingpage6.png)
![Login](/demo/login.png)
![Dashboard](/demo/dashboard.png)
![User Profile](/demo/profile.png)
![Exchange Stalls](/demo/stalls.png)
![Stall2](/demo/createStall.png)
![Forum](/demo/forum.png)
![Abusive Content Moderation](/demo/abusiveChat.png)
![Chat](/demo/chat.png)
![Notification](/demo/noti.png)
![Request](/demo/req.png)
![Whislist](/demo/whislist.png)
![Nearby](/demo/nearby.png)
![Points](/demo/points.png)

## How to Run
### Prerequisites
*   Node.js (Version 18 or higher)
*   NPM (Node Package Manager)
*   A Supabase project (URL and Anon Key)
*   Google Gemini API Key

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and configure your environment variables (PORT, SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY).
4.  Start the server:
    ```bash
    npm run dev
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory and add your Vite environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL).
4.  Run the development server:
    ```bash
    npm run dev
    ```

The application will launch in your default browser (usually at `http://localhost:5173`).
