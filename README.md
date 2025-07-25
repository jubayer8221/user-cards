# 🚀 Full Stack Web Application (Next.js + Node.js + SQL Server)

This project is a **full-stack web application** that combines a modern React-based frontend using **Next.js**, a scalable and secure backend built with **Node.js (Express)**, and a **Microsoft SQL Server** relational database.

---

## 📁 Project Structure

```
root/
├── backend/                # Node.js + Express API
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   ├── db.js
│   ├── server.js
├── frontend/               # Next.js frontend
│   ├── pages/
│   ├── components/
│   ├── public/
│   ├── styles/
│   ├── next.config.js
├── .env
├── README.md
```

---

## 🛠️ Technologies Used

| Layer        | Tech Stack                         |
|--------------|------------------------------------|
| Frontend     | Next.js (React), Tailwind CSS      |
| Backend      | Node.js, Express.js                |
| Database     | Microsoft SQL Server               |
| Communication| REST API                           |
| Image Upload | Base64 / Binary (VARBINARY in SQL) |

---

## 🚦 Setup Instructions

### 1. 📦 Clone the Repository

```bash
git clone https://github.com/yourusername/yourproject.git
cd yourproject
```

### 2. 🔐 Set Environment Variables

Create a `.env` file in the root and backend directories with the following:

#### Root `.env`
```env
PORT=5000
```

#### `backend/.env`
```env
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_SERVER=localhost
DB_DATABASE=your_database_name
```

---

## 🔧 Backend Setup (Node + Express)

```bash
cd backend
npm install
npm run dev
```

Starts backend server at:  
`http://localhost:5000`

---

## 💻 Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Starts frontend app at:  
`http://localhost:3000`

---

## 🖼️ Image Upload Workflow

1. User uploads an image on the frontend via form.
2. Image is sent to the Node.js backend and converted to binary (`Buffer`).
3. Image is stored in SQL Server as `VARBINARY(MAX)`.
4. When retrieved, the image is encoded as **base64** and rendered in `<img src="data:image/jpeg;base64,...">`.

---

## ⚙️ SQL Server Table Schema

```sql
CREATE TABLE USERS (
  UserID INT IDENTITY(1,1) PRIMARY KEY,
  UserName VARCHAR(50) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  FullName VARCHAR(100) NULL,
  DateOfBirth DATE NULL,
  Gender CHAR(1) CHECK (Gender IN ('M', 'F', 'O')) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
  IsActive BIT NOT NULL DEFAULT 1,
  Image VARBINARY(MAX) NULL
);
```

---

## 🧪 Sample API Endpoints

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| GET    | `/api/users`          | Get all users          |
| GET    | `/api/users/:id`      | Get a single user      |
| POST   | `/api/users`          | Create a new user      |
| PUT    | `/api/users/:id`      | Update user            |
| DELETE | `/api/users/:id`      | Delete user            |

---

## 📸 Frontend Image Render Example

```tsx
<img src={`data:image/jpeg;base64,${user.image}`} alt="Profile Image" />
```

---

## ⚠️ Troubleshooting

- **CRLF/LF warnings in Git?**
  Run:
  ```bash
  git config --global core.autocrlf true
  ```

- **SQL Server not connecting?**
  Check if:
  - SQL Server is running
  - TCP/IP is enabled in SQL Server Configuration Manager
  - Correct credentials are in `.env`

---

## 📃 License

This project is licensed under the MIT License.

---

## 👩‍💻 Developed By

- [Your Name](https://github.com/jubayer8221)
