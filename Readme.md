# 🎬 Watch-Party — YouTube Watch Together

Watch-Party is a real-time YouTube watch party application that allows users to watch videos together from different locations. Users can create rooms, join other participants, and synchronize video playback in real time.

## ✨ Features

* 🔐 **Authentication:** User signup and login with JWT-based authentication.
* 🏠 **Room Management:** Create and join rooms using a unique room ID.
* 🎥 **Real-Time Synchronization:** Synchronize video playback, pause, seek, and video changes.
* 👥 **Participant Management:** View online participants and their roles.
* 🛡️ **Role-Based Permissions:** Hosts can manage participants and assign moderator roles.
* ⚡ **WebSocket Communication:** Real-time updates between connected participants.

## 🛠️ Tech Stack

* **Frontend:** Next.js,  TypeScript, Tailwind CSS
* **Backend:** Node.js, Express.js, TypeScript
* **Real-Time Communication:** WebSocket (`ws`)
* **Database:** MongoDB, Mongoose

* Video Player & Playback Control: YouTube IFrame Player API
* **Authentication:** JWT
* **HTTP Client:** Axios

## 🚀 Live Demo

 Live Application: : https://yt-watch-party-system.vercel.app/ 

 GitHub Repository:  https://github.com/AbhishekYadav44/YT-watch-party-system.git



## 🏗️ Architecture Overview

The application uses REST APIs for authentication and room management, while WebSockets handle real-time communication.

1. Users sign in and receive an authentication token.
2. The frontend establishes a WebSocket connection and authenticates with the server.
3. Users can create or join a room through the REST API and WebSocket connection.
4. The backend manages room membership, participant roles, and video state.
5. Authorized playback actions are broadcast to connected participants.
6. Clients update their video players using the synchronized state.

The backend uses a `Room` class to encapsulate room membership, video synchronization, role permissions, and participant updates.

## ⚙️ Getting Started


### 1. Clone the Repository

```bash
git clone https://github.com/AbhishekYadav44/YT-watch-party-system.git
cd YT-watch-party
```

### 2. Start the Backend

```bash
cd backend
npm install
```

Create a `.env` file using the environment variable names required by your backend configuration.

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend using the appropriate script from `package.json`, for example:

```bash
npm run dev
```

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.


## 🔌 WebSocket Events

The application uses the `ws` library to handle real-time communication between the server and connected participants.

### Client → Server

| Event                | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `authenticate`       | Authenticates the WebSocket connection using a JWT token.   |
| `join-room`          | Joins a participant to a room after server-side validation. |
| `left-room`          | Handles a participant leaving a room.                       |
| `sync-state`         | Requests the current synchronized video state.              |
| `play`               | Requests video playback.                                    |
| `pause`              | Requests video pause.                                       |
| `seek`               | Requests a change in video playback position.               |
| `change-video`       | Changes the current YouTube video.                          |
| `assign-role`        | Allows the host to assign or change a participant's role.   |
| `remove-participant` | Allows the host to remove a participant from the room.      |

### Server → Client

| Event                 | Purpose                                                                  |
| --------------------- | ------------------------------------------------------------------------ |
| `authenticate`        | Returns the WebSocket authentication result.                             |
| `join-room`           | Confirms room joining and provides the participant's role.               |
| `left-room`           | Handles the room-leaving response, where implemented.                    |
| `sync-state`          | Sends the current video ID, playback position, and playing/paused state. |
| `participants`        | Sends the updated list of online participants and their roles.           |
| `user-joined`         | Notifies the room when a participant joins.                              |
| `user-left`           | Notifies the room when a participant disconnects or leaves.              |
| `role-assigned`       | Notifies participants about a role change.                               |
| `participant-removed` | Notifies remaining participants when someone is removed.                 |
| `removed-from-room`   | Notifies a participant that they have been removed.                      |
| `error`               | Reports authentication, room, or operation errors.                       |

### Role Permissions

* **Host:** Can control playback, change videos, assign roles, and remove participants.
* **Moderator:** Can control playback and seek through videos.
* **Participant:** Can watch synchronized videos but cannot perform host/moderator-only actions.

The backend validates permissions before processing protected room operations.


## 🔮 Future Improvements

* Redis Pub/Sub for cross-server communication.
* Persistent playback state.
* Text chat and emoji reactions.
* Host transfer functionality.
* Improved reconnection handling.

## 👨‍💻 Author

**Abhishek Yadav**

* GitHub: https://github.com/AbhishekYadav44

