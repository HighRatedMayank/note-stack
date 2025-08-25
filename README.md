# Note Stack

A modern, collaborative note-taking application built with Next.js, Lexical editor, and Firebase.

## Features

- 📝 Rich text editing with Lexical
- 🔄 Real-time collaborative editing with Yjs
- 🌙 Dark/Light theme support
- 📱 Mobile-responsive design
- 🔐 Firebase authentication
- 💾 Auto-save functionality
- 🎨 Modern UI with Tailwind CSS

## Collaborative Editing

This application supports real-time collaborative editing using Yjs and WebSocket. Multiple users can edit the same document simultaneously.

### Setup

1. **Start the collaboration server:**
   ```bash
   npm run collab-server
   ```
   This starts the WebSocket server on port 1234.

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Enable collaboration:**
   - Open a document in the editor
   - Collaboration is automatically enabled for all documents
   - Multiple users can now edit the same document simultaneously

### How it works

- Each document has a unique ID that's used for collaboration
- Users are identified by their display name or email
- Changes are synchronized in real-time via WebSocket
- User presence is tracked and displayed

### Technical Details

- **Yjs**: Provides the collaborative editing framework
- **y-websocket**: Handles WebSocket communication
- **@lexical/yjs**: Integrates Yjs with Lexical editor
- **Custom WebSocket server**: Manages document synchronization

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Add your Firebase config to `lib/firebase.ts`

3. **Start the collaboration server:**
   ```bash
   npm run collab-server
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Development

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Tailwind CSS**: Utility-first CSS framework
- **Next.js 15**: React framework with App Router

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run collab-server` - Start collaboration server

## Architecture

- **Frontend**: Next.js with TypeScript
- **Editor**: Lexical with collaborative editing
- **Backend**: Firebase (Auth + Firestore)
- **Collaboration**: Yjs + WebSocket
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
