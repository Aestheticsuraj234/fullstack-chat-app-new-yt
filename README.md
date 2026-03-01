# Full-Stack Real-Time Chat App

A complete, production-ready real-time mobile chat application built with React Native (Expo), Node.js, Socket.io, and Prisma.

## 🚀 Features

### 🔐 Authentication
*   **Email/Password Sign Up & Sign In**: Powered by Better Auth.
*   **Secure Sessions**: Persistent, secure session management using cookies and Expo SecureStore.
*   **Protected Routes**: Auth-based navigation handled cleanly via Expo Router.

### 👥 Friend System
*   **Discover People**: Search for other users by name or email.
*   **Manage Requests**: Send, accept, reject, and cancel friend requests seamlessly.
*   **Real-Time Notifications**: Instant updates via Socket.io when receiving a friend request.
*   **Friends List**: View all your accepted friends on your dedicated Profile screen.

### 💬 Real-Time Messaging (Socket.io)
*   **Instant Chat**: Send and receive messages in real time with accepted friends.
*   **Paginated History**: Cursor-based pagination logic fetching messages in 50-item chunks.
*   **Organized Conversations**: Chat list sorted by the latest activity with auto-updating unread badges.
*   **Persistent Storage**: All messages safely stored in PostgreSQL via Prisma.

### 🟢 Live Presence & Status
*   **Online/Offline Indicators**: See exactly when your friends are currently active.
*   **Typing Indicators**: Live "typing..." feedback when your partner is composing a message.

### 🔔 Push Notifications
*   **New Friend Requests**: Rich push notifications containing the sender's name and avatar.
*   **New Messages**: Real-time push alerts showing the sender and message preview.
*   **Interactive Notifications**: Accept or reject friend requests directly from the notification banner.
*   **Custom In-App Banner**: Smooth, animated custom notification banners with swipe-to-dismiss functionality.

### 📱 UI / UX
*   **Modern Mobile Interface**: Built with React Native and Expo featuring a cohesive dark mode theme.
*   **Tab Navigation**: Intuitive bottom tab layout: **Chats**, **Discover**, and **Profile**.
*   **Avatars**: Auto-generated user avatars configured via DiceBear.
*   **Responsive Input**: Keyboard-avoiding text inputs with full safe area inset support.
*   **Pull to Refresh**: Easily refresh your conversation lists.

## 🛠 Tech Stack

*   **Frontend**: React Native, Expo, TypeScript, Expo Router, Expo SecureStore, Expo Notifications.
*   **State Management**: TanStack Query (React Query) for server state handling and optimistic updates.
*   **Backend**: Node.js, Express, TypeScript.
*   **Real-Time Engine**: Socket.io.
*   **Database & ORM**: PostgreSQL, Prisma.
*   **Authentication**: Better Auth.

## ⚙️ Project Structure

The repository is divided into two primary directories:
*   `/chat`: The React Native (Expo) frontend mobile application.
*   `/backend`: The Node.js (Express + Prisma) backend server.

## 🏁 Getting Started

### Prerequisites
*   Node.js installed on your machine.
*   A running PostgreSQL database instance.
*   Expo Go app on your physical device, or an iOS Simulator/Android Emulator.

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables. Create a `.env` file in the root of the `/backend` directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/your_db_name"
    BETTER_AUTH_SECRET="your_secure_secret_string"
    ```
4.  Run Prisma migrations to set up your database schema:
    ```bash
    npx prisma migrate dev
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup

1.  Navigate to the chat directory:
    ```bash
    cd chat
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure API & Socket URLs.
    *Open `/chat/utils/index.ts` (or wherever your `SOCKET_URL` and `API_URL` are defined) and ensure they point to your local machine's IP address where the backend is running.*
4.  Start the Expo development server:
    ```bash
    npm run start
    ```
5.  Scan the QR code with the Expo Go app or press `i`/`a` to launch on the simulator/emulator.

## 📄 License

This project is licensed under the MIT License.
