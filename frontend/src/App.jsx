import React from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Avatar from "./components/Avatar";
import Wall from "./components/Wall";
import Floor from "./components/Floor";
import ShoppingRack from "./components/ShoppingRack";
import Door from "./components/Door";
import BillingCounter from "./components/BillingCounter";
import io from "socket.io-client";
import { useEffect } from "react";

const App = () => {
  const floorSize = [88, 100];

  //For ShoppingRack
  const numRacksPerRow = 12; // Number of racks in a single row
  const numRows = 7; // Number of rows (columns ke liye)
  const rackSpacing = 8; // Spacing between racks in a row
  const rowSpacing = 9; // Spacing between rows (to form columns)

  const numCounters = 9; // Number of counters
  const counterSpacing = 10; // Spacing between counters in the row

  useEffect(() => {
    // Establish socket connection
    const socket = io("https://localhost:5173");

    // Listen for IMU update from the backend
    socket.on("imu-update", (data) => {
      console.log("Received IMU update:", data);
      // You can use this data to update your 3D models or trigger events in your app
    });

    // Simulate sending IMU data to the backend
    const imuData = {
      accelData: { x: 1, y: 2, z: 3 },
      rotationData: { alpha: 0, beta: 0, gamma: 0 },
      magnetData: { x: 0, y: 0, z: 0 },
      deltaTime: 0.016, // Assume 60 FPS or you can calculate the delta time dynamically
    };

    socket.emit("imu-data", imuData);

    // Cleanup socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Canvas camera={{ position: [0, 20, 20], fov: 60 }}>
      <ambientLight />
      <pointLight position={[10, 20, 10]} intensity={1} />

      <Avatar />

      <Floor />
      {/* Add the walls around the floor */}
      <Wall floorSize={floorSize} side="top" />
      <Wall floorSize={floorSize} side="bottom" />
      <Wall floorSize={floorSize} side="left" />
      <Wall floorSize={floorSize} side="right" />

      {/* Render the first Door at one position */}
      <Door
        position={[-40, 2.5, -47]}
        rotation={[0, 8, 0]}
        scale={[0.02, 0.02, 0.02]}
      />

      {/* Render the second Door at another position */}
      <Door
        position={[40, 3, -30]}
        rotation={[0, 8, 0]}
        scale={[0.02, 0.02, 0.02]}
      />

      {/* Multiple Rows (Columns) of Shopping Racks */}
      {Array.from({ length: numRows }).map((_, rowIndex) =>
        Array.from({ length: numRacksPerRow }).map((_, colIndex) => {
          // Generate the rack number inside the map
          const rackNumber = rowIndex * numRacksPerRow + colIndex;

          return (
            <ShoppingRack
              key={`rack-${rackNumber}`} // Ensure each rack has a unique key
              position={[
                colIndex * rackSpacing -
                  ((numRacksPerRow - 1) * rackSpacing) / 2, // X-axis: Horizontal alignment
                0, // Y-axis: Height remains the same
                rowIndex * rowSpacing - ((numRows - 1) * rowSpacing) / 4, // Z-axis: Vertical alignment
              ]}
              rackNumber={rackNumber} // Pass the unique number to the ShoppingRack component
            />
          );
        })
      )}

      {/* Create multiple BillingCounters in a row */}
      {Array.from({ length: numCounters }).map((_, index) => (
        <BillingCounter
          key={`counter-${index}`}
          position={[-40 + index * counterSpacing, 0, -40]} // Adjust positions so they align in a row
          counterNumber={index + 1} // Pass the counter number to each counter
        />
      ))}
      <OrbitControls />
    </Canvas>
  );
};
export default App;
