# 💬 Connectly — Real-Time Chat Application

🔗 **Live Demo:** [https://connectly-ng.vercel.app/](https://connectly-ng.vercel.app/)
> ⚠️ **NOTE:** Email OTP requires a paid domain. For testing, OTP can be accessed via the **browser console**.

Connectly is a **production-grade real-time chat application** built as a resume project with a strong focus on **authentication, real-time systems, security, and scalable backend design**.

The project is fully deployed with:

* **Frontend:** Vercel
* **Backend:** Render

---

## 🚀 Key Features

### 🔐 Authentication & Security

* OTP-based email authentication
* OTP hashing + expiry handling
* Secure **HTTP-only cookie** authentication
* Logout works from **any route** (`/`, `/chats`, `/profile`, etc.)
* Proper `sameSite`, `secure`, and `path` cookie configuration
---

### 💬 Real-Time Chat Features

* Real-time one-to-one messaging
* **Instant message seen / unseen updates**
* **Typing indicator**
* **User online / offline presence**
* Message delivery handled via WebSockets

---

### 🖼️ Media & Messaging

* Send **text messages, images, and videos**
* Cloudinary integration for media uploads
* Optimized media handling

---

### 👤 User Features

* Profile view
* Profile picture upload
* Search users by username
* Check other users’ profiles
* Real-time presence status

---

### 🗑️ Chat Management

* Delete messages **for self**
* Delete chats locally without affecting other users
* Message state consistency across clients

---

## 🛠️ Tech Stack

### Frontend

* React + TypeScript
* Vite
* Axios
* Socket.io Client

### Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* Database via Prisma
* Socket.io

### Media & Services

* Cloudinary (image & video uploads)
* bcrypt (OTP hashing)

---

## 🧩 OTP Authentication Flow

1. User enters email
2. Backend generates OTP
3. OTP is **hashed and stored with expiry** in DB
4. OTP is sent via email (or returned in DEV mode)
5. User verifies OTP
6. Secure auth cookie is issued

---

## 🍪 Cookie Strategy

Cookies are configured with:

* `httpOnly: true`
* `sameSite: none`
* `secure: true` (production)
* `path: /`

This ensures:

* Secure authentication
* Logout works from all routes
* Proper cross-origin support (Vercel ↔ Render)

---

## 📂 Project Structure

```
root
├── client/        # React frontend
├── server/        # Express backend
│   ├── controllers
│   ├── routes
│   ├── services
│   ├── helpers
│   ├── sockets
│   └── prisma
└── README.md
```

---

## 🌍 Deployment

* **Frontend:** Vercel
* **Backend:** Render
* CORS + cookie handling configured for cross-origin communication

---

## 🧠 What This Project Demonstrates

* Designing secure OTP-based authentication
* Handling cookies correctly across domains
* Real-time systems using Socket.io
* Media uploads with Cloudinary
* Backend state consistency (seen/unseen, online status)
* Debugging real-world production issues

---

## 🚧 Future Improvements

* Group chats
* Message reactions
* Push notifications
* Improved UI/UX animations

---

## 👨‍💻 Author

**Nishant Gupta**
Final-year student actively seeking **internship opportunities** in **Full Stack / Software Development**.

---

⭐ If you find this project interesting or useful, feel free to star the repository!
