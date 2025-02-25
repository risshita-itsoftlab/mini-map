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

import express from "express";
import cors from "cors";
import https from "https";
import fs from "fs"; // Required for loading the certificates
import { Server as socketIo } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
//Load SSL certificates
const privateKey = fs.readFileSync(
  join(__dirname, process.env.SSL_KEY_PATH),
  "utf8"
);

const certificate = fs.readFileSync(
  join(__dirname, process.env.SSL_CERT_PATH),
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app); // Create an HTTPs server to integrate with Socket.io
const io = new socketIo(server); // Initialize Socket.io

const port = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Kalman filter function (Same as frontend, but placed on the server side)
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

// Initialize state variables for Kalman filter errors
let accelEstimate = { x: 0, y: 0, z: 0 };
let accelEstimateError = { x: 1, y: 1, z: 1 };
let rotationEstimate = { alpha: 0, beta: 0, gamma: 0 };
let rotationEstimateError = { alpha: 1, beta: 1, gamma: 1 };
let magnetEstimate = { x: 0, y: 0, z: 0 };
let magnetEstimateError = { x: 1, y: 1, z: 1 };

let velocity = { x: 0, y: 0, z: 0 };
let position = { x: 0, y: 0, z: 0 };

// Socket.io connection event
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for IMU data from the frontend
  socket.on("imu-data", (data) => {
    const { accelData, rotationData, magnetData, deltaTime } = data;

    // Apply Kalman filter to accelerometer data
    const accelX = kalmanFilter(
      accelData.x,
      accelEstimate.x,
      accelEstimateError.x,
      0.001, // process noise
      0.1 // measurement noise
    );
    const accelY = kalmanFilter(
      accelData.y,
      accelEstimate.y,
      accelEstimateError.y,
      0.001,
      0.1
    );
    const accelZ = kalmanFilter(
      accelData.z,
      accelEstimate.z,
      accelEstimateError.z,
      0.001,
      0.1
    );

    // Integrate acceleration to get velocity (Velocity = Acceleration * Time)
    const newVelocityX = velocity.x + accelX.updatedEstimate * deltaTime;
    const newVelocityY = velocity.y + accelY.updatedEstimate * deltaTime;
    const newVelocityZ = velocity.z + accelZ.updatedEstimate * deltaTime;

    // Update the velocity
    velocity = { x: newVelocityX, y: newVelocityY, z: newVelocityZ };

    // Integrate velocity to get position (Position = Velocity * Time)
    const newPosX = position.x + newVelocityX * deltaTime;
    const newPosY = position.y + newVelocityY * deltaTime;
    const newPosZ = position.z + newVelocityZ * deltaTime;

    // Update the position
    position = { x: newPosX, y: newPosY, z: newPosZ };

    // Update accelerometer estimates with filtered data
    accelEstimate = {
      x: accelX.updatedEstimate,
      y: accelY.updatedEstimate,
      z: accelZ.updatedEstimate,
    };
    accelEstimateError = {
      x: accelX.updatedEstimateError,
      y: accelY.updatedEstimateError,
      z: accelZ.updatedEstimateError,
    };

    // Apply Kalman filter to rotation data (Gyroscope)
    const rotAlpha = kalmanFilter(
      rotationData.alpha,
      rotationEstimate.alpha,
      rotationEstimateError.alpha,
      0.001,
      0.1
    );
    const rotBeta = kalmanFilter(
      rotationData.beta,
      rotationEstimate.beta,
      rotationEstimateError.beta,
      0.001,
      0.1
    );
    const rotGamma = kalmanFilter(
      rotationData.gamma,
      rotationEstimate.gamma,
      rotationEstimateError.gamma,
      0.001,
      0.1
    );

    // Update rotation estimates with filtered data
    rotationEstimate = {
      alpha: rotAlpha.updatedEstimate,
      beta: rotBeta.updatedEstimate,
      gamma: rotGamma.updatedEstimate,
    };
    rotationEstimateError = {
      alpha: rotAlpha.updatedEstimateError,
      beta: rotBeta.updatedEstimateError,
      gamma: rotGamma.updatedEstimateError,
    };

    // Apply Kalman filter to magnetometer data
    const magX = kalmanFilter(
      magnetData.x,
      magnetEstimate.x,
      magnetEstimateError.x,
      0.001,
      0.1
    );
    const magY = kalmanFilter(
      magnetData.y,
      magnetEstimate.y,
      magnetEstimateError.y,
      0.001,
      0.1
    );
    const magZ = kalmanFilter(
      magnetData.z,
      magnetEstimate.z,
      magnetEstimateError.z,
      0.001,
      0.1
    );

    // Update magnetometer estimates with filtered data
    magnetEstimate = {
      x: magX.updatedEstimate,
      y: magY.updatedEstimate,
      z: magZ.updatedEstimate,
    };
    magnetEstimateError = {
      x: magX.updatedEstimateError,
      y: magY.updatedEstimateError,
      z: magZ.updatedEstimateError,
    };

    // Emit the updated position, velocity, and sensor data to the client
    socket.emit("imu-update", {
      position,
      velocity,
      accelEstimate,
      rotationEstimate,
      magnetEstimate,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
