// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);  // Create an HTTP server to integrate with Socket.io
// const io = socketIo(server);  // Initialize Socket.io

// const port = process.env.PORT || 5173;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Example route
// app.get('/', (req, res) => {
//   res.send('Hello from the backend!');
// });

// // Socket.io connection event
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Listen for a custom event from the client
//   socket.on('message', (data) => {
//     console.log('Message received:', data);

//     // Emit a response event to the client
//     socket.emit('response', { message: 'Hello from server!' });
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });

// // Start the server
// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// import express from "express";
// import cors from "cors";
// import fs from "fs"; // Required for loading the certificates
// import { Server as socketIo } from "socket.io";
// import { fileURLToPath } from "url";
// import { dirname, join } from "path";
// import dotenv from "dotenv";
// import http from "http";

// dotenv.config();
// const app = express();
// const __dirname = dirname(fileURLToPath(import.meta.url));
// //Load SSL certificates
// // const privateKey = fs.readFileSync(
// //   join(__dirname, process.env.SSL_KEY_PATH),
// //   "utf8"
// // );

// // const certificate = fs.readFileSync(
// //   join(__dirname, process.env.SSL_CERT_PATH),
// //   "utf8"
// // );
// // const credentials = { key: privateKey, cert: certificate };

// const server = http.createServer(app); // Create an HTTPs server to integrate with Socket.io
// const io = new socketIo(server); // Initialize Socket.io

// const port = process.env.PORT || 5175;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Kalman filter function (Same as frontend, but placed on the server side)
// const kalmanFilter = (
//   measurement,
//   estimate,
//   estimateError,
//   processNoise,
//   measurementNoise
// ) => {
//   // Prediction
//   const predictedEstimate = estimate;
//   const predictedEstimateError = estimateError + processNoise;

//   // Update
//   const kalmanGain =
//     predictedEstimateError / (predictedEstimateError + measurementNoise);
//   const updatedEstimate =
//     predictedEstimate + kalmanGain * (measurement - predictedEstimate);
//   const updatedEstimateError = (1 - kalmanGain) * predictedEstimateError;

//   return { updatedEstimate, updatedEstimateError };
// };

// // Initialize state variables for Kalman filter errors
// let accelEstimate = { x: 0, y: 0, z: 0 };
// let accelEstimateError = { x: 1, y: 1, z: 1 };
// let rotationEstimate = { alpha: 0, beta: 0, gamma: 0 };
// let rotationEstimateError = { alpha: 1, beta: 1, gamma: 1 };
// let magnetEstimate = { x: 0, y: 0, z: 0 };
// let magnetEstimateError = { x: 1, y: 1, z: 1 };

// let velocity = { x: 0, y: 0, z: 0 };
// let position = { x: 0, y: 0, z: 0 };

// // Socket.io connection event
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   // Listen for IMU data from the frontend
//   socket.on("imu-data", (data) => {
//     const { accelData, rotationData, magnetData, deltaTime } = data;

//     // Apply Kalman filter to accelerometer data
//     const accelX = kalmanFilter(
//       accelData.x,
//       accelEstimate.x,
//       accelEstimateError.x,
//       0.001, // process noise
//       0.1 // measurement noise
//     );
//     const accelY = kalmanFilter(
//       accelData.y,
//       accelEstimate.y,
//       accelEstimateError.y,
//       0.001,
//       0.1
//     );
//     const accelZ = kalmanFilter(
//       accelData.z,
//       accelEstimate.z,
//       accelEstimateError.z,
//       0.001,
//       0.1
//     );

//     // Integrate acceleration to get velocity (Velocity = Acceleration * Time)
//     const newVelocityX = velocity.x + accelX.updatedEstimate * deltaTime;
//     const newVelocityY = velocity.y + accelY.updatedEstimate * deltaTime;
//     const newVelocityZ = velocity.z + accelZ.updatedEstimate * deltaTime;

//     // Update the velocity
//     velocity = { x: newVelocityX, y: newVelocityY, z: newVelocityZ };

//     // Integrate velocity to get position (Position = Velocity * Time)
//     const newPosX = position.x + newVelocityX * deltaTime;
//     const newPosY = position.y + newVelocityY * deltaTime;
//     const newPosZ = position.z + newVelocityZ * deltaTime;

//     // Update the position
//     position = { x: newPosX, y: newPosY, z: newPosZ };

//     // Update accelerometer estimates with filtered data
//     accelEstimate = {
//       x: accelX.updatedEstimate,
//       y: accelY.updatedEstimate,
//       z: accelZ.updatedEstimate,
//     };
//     accelEstimateError = {
//       x: accelX.updatedEstimateError,
//       y: accelY.updatedEstimateError,
//       z: accelZ.updatedEstimateError,
//     };

//     // Apply Kalman filter to rotation data (Gyroscope)
//     const rotAlpha = kalmanFilter(
//       rotationData.alpha,
//       rotationEstimate.alpha,
//       rotationEstimateError.alpha,
//       0.001,
//       0.1
//     );
//     const rotBeta = kalmanFilter(
//       rotationData.beta,
//       rotationEstimate.beta,
//       rotationEstimateError.beta,
//       0.001,
//       0.1
//     );
//     const rotGamma = kalmanFilter(
//       rotationData.gamma,
//       rotationEstimate.gamma,
//       rotationEstimateError.gamma,
//       0.001,
//       0.1
//     );

//     // Update rotation estimates with filtered data
//     rotationEstimate = {
//       alpha: rotAlpha.updatedEstimate,
//       beta: rotBeta.updatedEstimate,
//       gamma: rotGamma.updatedEstimate,
//     };
//     rotationEstimateError = {
//       alpha: rotAlpha.updatedEstimateError,
//       beta: rotBeta.updatedEstimateError,
//       gamma: rotGamma.updatedEstimateError,
//     };

//     // Apply Kalman filter to magnetometer data
//     const magX = kalmanFilter(
//       magnetData.x,
//       magnetEstimate.x,
//       magnetEstimateError.x,
//       0.001,
//       0.1
//     );
//     const magY = kalmanFilter(
//       magnetData.y,
//       magnetEstimate.y,
//       magnetEstimateError.y,
//       0.001,
//       0.1
//     );
//     const magZ = kalmanFilter(
//       magnetData.z,
//       magnetEstimate.z,
//       magnetEstimateError.z,
//       0.001,
//       0.1
//     );

//     // Update magnetometer estimates with filtered data
//     magnetEstimate = {
//       x: magX.updatedEstimate,
//       y: magY.updatedEstimate,
//       z: magZ.updatedEstimate,
//     };
//     magnetEstimateError = {
//       x: magX.updatedEstimateError,
//       y: magY.updatedEstimateError,
//       z: magZ.updatedEstimateError,
//     };

//     // Emit the updated position, velocity, and sensor data to the client
//     socket.emit("imu-update", {
//       position,
//       velocity,
//       accelEstimate,
//       rotationEstimate,
//       magnetEstimate,
//     });
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

// // Start the server
// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

import express from "express";
import bodyParser from "express";
import { Server as SocketIoServer } from "socket.io";
import http from "http";
import cors from "cors";

// Create an Express app
const app = express();
// Enable CORS for express routes
app.use(cors());
const server = http.createServer(app);
const io = new SocketIoServer(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
}); // Create socket.io server

// Middleware to parse incoming request body
app.use(bodyParser.json());

// Kalman filter function
const kalmanFilter = (
  measurement,
  estimate,
  estimateError,
  processNoise,
  measurementNoise
) => {
  // Prediction
  const predictedEstimate = estimate;
  const predictedEstimateError = estimateError + processNoise;

  // Update
  const kalmanGain =
    predictedEstimateError / (predictedEstimateError + measurementNoise);
  const updatedEstimate =
    predictedEstimate + kalmanGain * (measurement - predictedEstimate);
  const updatedEstimateError = (1 - kalmanGain) * predictedEstimateError;

  return { updatedEstimate, updatedEstimateError };
};

// Constants for Kalman filter noise values
const processNoise = 0.001;
const measurementNoise = 0.1;

// Create a map to track each client's avatar position
let avatarPositions = {};

// Endpoint to handle incoming IMU data (sensor data)
// app.post("/process-imu", (req, res) => {
//   const { acceleration, rotationRate, alpha, beta, gamma, clientId } = req.body;

//   // Ensure that clientId is provided, and if not, we respond with an error.
//   if (!clientId) {
//     return res.status(400).json({ error: "clientId is required." });
//   }

//   // Initialize client's avatar position if not already tracked
//   if (!avatarPositions[clientId]) {
//     avatarPositions[clientId] = {
//       position: { x: 0, y: 0, z: 0 },
//       velocity: { x: 0, y: 0, z: 0 },
//       accelEstimate: { x: 0, y: 0, z: 0 },
//       rotationEstimate: { alpha: 0, beta: 0, gamma: 0 },
//     };
//   }

app.post("/process-imu", (req, res) => {
  try {
    const { acceleration, rotationRate, alpha, beta, gamma, clientId } =
      req.body;

    // Ensure that clientId is provided, and if not, respond with an error
    if (!clientId) {
      return res.status(400).json({ error: "clientId is required." });
    }

    // Initialize client's avatar position if not already tracked
    if (!avatarPositions[clientId]) {
      avatarPositions[clientId] = {
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        accelEstimate: { x: 0, y: 0, z: 0 },
        rotationEstimate: { alpha: 0, beta: 0, gamma: 0 },
      };
    }

    const avatar = avatarPositions[clientId];

    // Default values if the data is missing
    const accelX = acceleration?.x || 0;
    const accelY = acceleration?.y || 0;
    const accelZ = acceleration?.z || 0;

    const rotAlpha = rotationRate?.alpha || 0;
    const rotBeta = rotationRate?.beta || 0;
    const rotGamma = rotationRate?.gamma || 0;

    // Apply Kalman filter to accelerometer data
    const accelXFiltered = kalmanFilter(
      accelX,
      avatar.accelEstimate.x,
      1, // Assume initial error of 1 for simplicity
      processNoise,
      measurementNoise
    );
    const accelYFiltered = kalmanFilter(
      accelY,
      avatar.accelEstimate.y,
      1,
      processNoise,
      measurementNoise
    );
    const accelZFiltered = kalmanFilter(
      accelZ,
      avatar.accelEstimate.z,
      1,
      processNoise,
      measurementNoise
    );

    // Update acceleration estimates
    avatar.accelEstimate = {
      x: accelXFiltered.updatedEstimate,
      y: accelYFiltered.updatedEstimate,
      z: accelZFiltered.updatedEstimate,
    };

    // Integrate acceleration to get velocity (Velocity = Acceleration * Time)
    // For this example, deltaTime = 1s (for simplicity)
    avatar.velocity.x += accelXFiltered.updatedEstimate;
    avatar.velocity.y += accelYFiltered.updatedEstimate;
    avatar.velocity.z += accelZFiltered.updatedEstimate;

    // Integrate velocity to get position (Position = Velocity * Time)
    avatar.position.x += avatar.velocity.x;
    avatar.position.y += avatar.velocity.y;
    avatar.position.z += avatar.velocity.z;

    // Apply Kalman filter to rotation data
    const rotAlphaFiltered = kalmanFilter(
      rotAlpha,
      avatar.rotationEstimate.alpha,
      1,
      processNoise,
      measurementNoise
    );
    const rotBetaFiltered = kalmanFilter(
      rotBeta,
      avatar.rotationEstimate.beta,
      1,
      processNoise,
      measurementNoise
    );
    const rotGammaFiltered = kalmanFilter(
      rotGamma,
      avatar.rotationEstimate.gamma,
      1,
      processNoise,
      measurementNoise
    );

    // Update rotation estimates
    avatar.rotationEstimate = {
      alpha: rotAlphaFiltered.updatedEstimate,
      beta: rotBetaFiltered.updatedEstimate,
      gamma: rotGammaFiltered.updatedEstimate,
    };

    // Respond with filtered IMU data
    res.json({
      position: avatar.position,
      velocity: avatar.velocity,
      rotation: avatar.rotationEstimate,
    });
  } catch (error) {
    // If an error occurs during the execution of the route logic,
    // it is caught and logged, then a 500 error is sent back to the client
    console.error("Error processing IMU data:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }

  // Emit the position update to the frontend via Socket.io
  io.emit("avatarPositionUpdate", {
    clientId: "deerrerfr",
    position: avatar.position,
    velocity: avatar.velocity,
  });
});

// Start the server on port 3000
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
