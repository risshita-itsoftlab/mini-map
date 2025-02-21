import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Vector3 } from "three";

const Avatar = () => {
  const modelUrl = "stylized_epic_bull_man_warrior_animated/scene.gltf"; // Hardcoded model URL
  const { scene, animations } = useGLTF(modelUrl); // Load the model using the hardcoded URL
  const { actions } = useAnimations(animations, scene); // Hook to handle animations

  const avatarRef = useRef(); // Reference to the avatar model
  const [velocity, setVelocity] = useState(new Vector3(0, 0, 0)); // To track movement velocity
  const [isMoving, setIsMoving] = useState(false); // To check if the model is moving
  const [facingDirection, setFacingDirection] = useState("front"); // To track the direction the avatar is facing

  // Movement speed
  const speed = 0.1;

  // Listen for key presses to move the avatar
  useEffect(() => {
    const handleKeyDown = (event) => {
      let newVelocity = velocity.clone();

      switch (event.key) {
        case "w":
          newVelocity.z = -speed; // Move forward
          setFacingDirection("front");
          break;
        case "s":
          newVelocity.z = speed; // Move backward
          setFacingDirection("back");
          break;
        case "a":
          newVelocity.x = -speed; // Move left
          setFacingDirection("left");
          break;
        case "d":
          newVelocity.x = speed; // Move right
          setFacingDirection("right");
          break;
        default:
          break;
      }

      // If any key is pressed, the avatar is moving
      setIsMoving(true);
      setVelocity(newVelocity);
    };

    const handleKeyUp = (event) => {
      // Stop movement when the key is released
      if (["w", "a", "s", "d"].includes(event.key)) {
        setIsMoving(false);
        setVelocity(new Vector3(0, 0, 0)); // Reset velocity to stop movement
      }
    };

    // Add event listeners for keydown and keyup events
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup the event listeners
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [velocity]);

  // Update position based on velocity, control animation state, and rotation
  useEffect(() => {
    if (avatarRef.current) {
      avatarRef.current.position.add(velocity);
    }

    // Control the walking animation based on whether the avatar is moving
    if (isMoving) {
      if (actions["4338274725888_TempMotion"]) {
        actions["4338274725888_TempMotion"].play(); // Play walking animation
      }
    } else {
      if (actions["4338274725888_TempMotion"]) {
        actions["4338274725888_TempMotion"].stop(); // Stop walking animation if idle
      }
    }

    // Adjust avatar rotation based on movement direction
    if (avatarRef.current) {
      switch (facingDirection) {
        case "front":
          avatarRef.current.rotation.y = Math.PI ; // Face forward
          break;
        case "back":
          avatarRef.current.rotation.y =0; // Face backward (180 degrees)
          break;
        case "left":
          avatarRef.current.rotation.y = -Math.PI / 2; // Face left (90 degrees)
          break;
        case "right":
          avatarRef.current.rotation.y = Math.PI / 2; // Face right (-90 degrees)
          break;
        default:
          break;
      }
    }
  }, [velocity, isMoving, actions, facingDirection]);

  return <primitive object={scene} ref={avatarRef} />;
};

export default Avatar;

// import { useEffect } from "react";
// import React from "react";
// import { useGLTF } from "@react-three/drei";

// const Avatar = () => {
//   const modelUrl = "stylized_epic_bull_man_warrior_animated/scene.gltf"; // Hardcoded model URL
//   const { scene } = useGLTF(modelUrl); // Load the model using the hardcoded URL

//   // Use useEffect to modify the scale after the model is loaded
//   // useEffect(() => {
//   //   if (scene) {
//   //     // Decrease the height by scaling down the y-axis
//   //     scene.scale.set(0.01, 0.01, 0.01);
//   //   }
//   // }, [scene]);

//   return <primitive object={scene} />;
// };

// export default Avatar;

// Skating Animation wala code
// import { useEffect, useRef } from "react";
// import React from "react";
// import { useGLTF, useAnimations } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";

// const Avatar = () => {
//   const modelUrl = "stylized_epic_bull_man_warrior_animated/scene.gltf"; // Hardcoded model URL
//   const { scene, animations } = useGLTF(modelUrl); // Load the model using the hardcoded URL
//   const { actions } = useAnimations(animations, scene); // Get animations from the model
//   const avatarRef = useRef();

//   useEffect(() => {
//     if (scene) {
//       // Avatar size has been decreased
//       scene.scale.set(0.01, 0.01, 0.01);

//       // Ensure the "walk" animation is playing and looped
//       if (actions && actions["walk"]) {
//         actions["walk"].play().setLoop(true); // Loop the walk animation
//       }
//     }
//   }, [scene, actions]);

//   // Set up movement logic: Move the avatar while animating its legs
//   useFrame(() => {
//     if (avatarRef.current) {
//       // Apply movement to the parent node instead of directly moving the whole avatar
//       avatarRef.current.position.z += 0.02; // Adjust for walking speed

//       // Ensure the animation is running smoothly at the proper speed
//       if (actions && actions["walk"]) {
//         actions["walk"].timeScale = 1; // Ensure normal animation playback speed
//       }
//     }
//   });

//   return <primitive object={scene} ref={avatarRef} />;
// };

// export default Avatar;

// import React, { useEffect } from "react";
// import { useGLTF, useAnimations } from "@react-three/drei";

// const Avatar = () => {
//   const modelUrl = "stylized_epic_bull_man_warrior_animated/scene.gltf"; // Hardcoded model URL
//   const { scene, animations } = useGLTF(modelUrl); // Load the model using the hardcoded URL

//   const { actions } = useAnimations(animations, scene); // Hook to handle animations

//   useEffect(() => {
//     // Log all animation names present in the model (optional, can be removed if not needed)
//     animations.forEach((animation, index) => {
//       console.log(`Animation ${index + 1}: ${animation.name}`);
//     });

//     // Play the walking animation with the correct name
//     if (actions["4338274725888_TempMotion"]) {
//       actions["4338274725888_TempMotion"].play();
//     } else {
//       console.log(
//         "Walking animation not found under the name '4338274725888_TempMotion'."
//       );
//     }

//     // Clean up animations when the component unmounts
//     return () => {
//       actions["4338274725888_TempMotion"]?.stop();
//     };
//   }, [animations, actions]);

//   return <primitive object={scene} />;
// };

// export default Avatar;
