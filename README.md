# 🎓 CampusMarketPlace

A professional, feature-rich marketplace designed for university students to buy, sell, and trade items safely within their campus community.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![Build Status](https://img.shields.io/badge/status-active-brightgreen.svg)

---

## 🌟 Key Features

- **🔐 Secure Authentication**: JWT-based login with encrypted password storage using Bcrypt.
- **🛒 Product Management**: Full CRUD operations for listing items, with image uploads hosted on Cloudinary.
- **💬 Real-time Chat**: Integrated messaging system using Socket.io for instant communication between buyers and sellers.
- **🔍 Advanced Filtering**: Search by title, filter by category, price range, and item type (buy/rent).
- **🛡️ Admin Dashboard**: Dedicated tools for managing users, products, and support tickets.
- **📞 Support System**: Built-in support portal for users to raise issues and track resolutions.
- **📱 Responsive UI**: Clean, modern design optimized for both desktop and mobile use.

---

## 🛠️ Tech Stack

- **Backend**: [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/) (Managed on TiDB Cloud)
- **Real-time**: [Socket.io](https://socket.io/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/) (via Multer)
- **Security**: [JSON Web Tokens (JWT)](https://jwt.io/), [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **Frontend**: HTML5, CSS3, JavaScript

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+)
- A MySQL database (local or cloud)
- [Cloudinary](https://cloudinary.com/) account for image uploads

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/A-S-Manoj/CampusMarketPlace.git
cd CampusMarketPlace
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
Ensure you provide the correct database and Cloudinary details.

### 4. Database Setup
Import the provided `schema.sql` into your MySQL database to create the necessary tables.

### 5. Running the Application
**Development mode (using nodemon):**
```bash
npm run dev
```
**Production mode:**
```bash
npm start
```
The server will start on `http://localhost:5000`.

---

## 📁 Project Structure

- `src/app.js`: Main application entry point.
- `src/controllers/`: Logic handlers for various routes.
- `src/services/`: Core business logic and database interactions.
- `src/routes/`: API endpoint definitions.
- `src/config/`: Configuration for DB, Cloudinary, and Socket.io.
- `public/`: Statis frontend files (HTML, CSS, JS).

---

## 👨‍💻 Author

**A.S. Manoj**
---

## 📜 License
This project is licensed under the ISC License.