# School Management System - Backend

## Project Description

This is the backend service for the **School Management System**. It is built using **Node.js** and **Express**, and it connects to a **MongoDB** database. The backend handles all the API requests for managing school resources such as users, roles (Admin, Staff, Librarian), and cloud-based file uploads using **Cloudinary**. It also supports JWT-based authentication for secure access.

---

## Setup Instructions

### Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js** (v16 or later)
- **NPM** (v7 or later) or **Yarn**
- **MongoDB Atlas** (For remote database access)
- **Cloudinary** account for file management

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/school-management-backend.git
    cd school-management-backend
    ```

2. **Install the dependencies**:
    Using NPM:
    ```bash
    npm install
    ```
    Using Yarn:
    ```bash
    yarn install
    ```

3. **Set up the environment variables**:

    Create a `.env` file in the root of the project and add the following variables:

    ```plaintext
    PORT=4000
    MONGODB_URI=mongodb+srv://hennamaria2001:3XjkCcoERLWL4OdD@cluster0.y3tcx.mongodb.net/schoolManagement
    ACCESS_TOKEN_SECRET_KEY=secret
    ACCESS_TOKEN_EXPIRY=1d
    CLOUDINARY_CLOUD_NAME=yourname
    CLOUDINARY_CLOUD_API_KEY=api
    CLOUDINARY_CLOUD_API_SECERT=secert
    ```

    Replace the values with your actual credentials if needed.

4. **Run the server**:
    Using NPM:
    ```bash
    npm start
    ```
    Using Yarn:
    ```bash
    yarn start
    ```

    The server should now be running at `http://localhost:4000`.

---

## Environment Variables

Here is the `.env` file setup for this project:

```plaintext
PORT=4000
MONGODB_URI=mongodb+srv://hennamaria2001:3XjkCcoERLWL4OdD@cluster0.y3tcx.mongodb.net/schoolManagement
ACCESS_TOKEN_SECRET_KEY=Hi8C6mp9?/SSFWN4ozt?UhF0mFn-!0HoOxIJ4KLfMa4WAXgw=Mg2cxo-0KF5WoUt
ACCESS_TOKEN_EXPIRY=1d
CLOUDINARY_CLOUD_NAME=freestyle07
CLOUDINARY_CLOUD_API_KEY=286239639171635
CLOUDINARY_CLOUD_API_SECERT=4P3a70oZ_TsyPL84AObN9QjC77Y
