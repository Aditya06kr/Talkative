# Talkative - Real-Time Chat App

This repository contains the source code for Talkative, a real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. The app allows users to engage in live chat conversations, displays online users, and features a modern and simple design that is responsive across all devices.

## Features

- Real-time messaging: Engage in live chat conversations with other users.
- Online and Offline Indicators: See an indicator referring to online and offline users.
- Send Files: Users can send messages as well as files.
- Edit and Delete Feature: Messages and files can be edited or deleted as well.
- Extras: Users are sorted based on the most recent message sent or received.
- Responsivity: The app is designed to work seamlessly on all devices, including desktops, tablets, and mobile devices.
- Modern and simple design: The user interface is clean and intuitive, providing a smooth and enjoyable chat experience.

## Tech Stack

- Frontend: React
- Backend: Node.js and Express
- Database: MongoDB
- Real-time communication: Socket.IO

## Prerequisites

- Node.js and npm installed on your machine
- MongoDB database connection

## Installation

1. Clone the repository:

   ````bash
   git clone https://github.com/Aditya06kr/Talkative.git

2. Install the dependencies:

   ````bash
   cd frontend && npm install
   cd backend && npm install

3. Create a `.env` file in the backend directory and provide the following environment variables:

   ````plaintext
   MONGODB_URL=<your-mongodb-connection-url>
   API_PORT = 8080
   CLIENT_KEY = http://localhost:5173
   SECRET =<secret_code>
   EXPIRY = <expiry_time>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret> 

4. Create a `.env` file in the frontend directory and provide the following environment variables:

   ````plaintext
   VITE_KEY=http://localhost:8080/api/v1

5. Start the frontend and backend server:

   ````bash
   cd frontend && npm run dev
   cd backend && npm run dev

6. Open your browser and visit `http://localhost:5173` to access the Talkative application.

## Folder Structure

The project structure is organized as follows:

- `frontend`: Contains the React frontend code.
- `backend`: Contains the Node.js,Express and Socket.io configuration.

## ScreenShots

![LoginPage](https://github.com/Aditya06kr/Talkative/blob/main/assets/LoginPage.png)
![ChatPage](https://github.com/Aditya06kr/Talkative/blob/main/assets/ChatPage.png)

## Acknowledgements

- [Socket.IO](https://socket.io/)
- [Create vite@latest](https://vitejs.dev/guide/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

Enjoy using Talkative