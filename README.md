# **Hungry Potter - Server** 🧙‍♂️🍲

🔗 **Repository URL**: [HungryPotterServer](https://github.com/shaySitri/HungryPotterServer)

---

### 📱 **Client Repository**
To see the client side of this project, visit the **[HungryPotterClient repository](https://github.com/shaySitri/HungryPotterClient)**.

---

### 👥 **Authors**
- **Itay Carmel** (📧: carmelit@post.bgu.ac.il)
- **Shay Sitri** (📧: sitri@post.bgu.ac.il)

---

### 📜 **Project Overview**
Welcome to the **server-side** of the **Hungry Potter** project! This repository contains the backend of a client-server application where the server manages and serves data, handles client requests, and ensures seamless communication with the client application.

---

### ⚙️ **Features**
- 📡 **Handles client requests** with responsive and efficient API endpoints.
- 🗄️ **Data Management**: Manages data storage, retrieval, and updates to maintain user data integrity.
- 📈 **Scalability**: Built to support multiple client requests simultaneously for a smooth experience.

---

### 🛠️ **Technologies**
- **Programming Language**: Node.js 🟩
- **Framework**: Express.js ⚙️
- **Database**: MySQL 🗄️
- **API Documentation**: Swagger 📝
- **Testing**: Postman 🔍

---

### 🚀 **Getting Started**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shaySitri/HungryPotterServer.git
   cd HungryPotterServer
   ```

2. **Install dependencies**:  
   Ensure **Node.js** and **npm** are installed, then install dependencies:
   ```bash
   npm install
   ```

3. **Configuration** 🔧:
   Set up a `.env` file in the root directory with your database credentials and any other configurations:
   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=hungry_potter
   ```

4. **Run the server**:
   ```bash
   npm start
   ```

5. **Testing**:
   Use **Postman** to test API endpoints or run available tests if provided.

---

### 🌐 **API Endpoints**

| Endpoint       | Method | Description                   |
|----------------|--------|-------------------------------|
| `/login`       | POST   | Authenticates users           |
| `/recipes`     | GET    | Retrieves recipe data         |
| `/recipes/:id` | PUT    | Updates a specific recipe     |

> 📄 **For more details**, refer to the Swagger documentation or the `docs/` folder.
