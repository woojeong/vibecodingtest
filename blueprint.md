# **Wednesday and Sea Glass: The Flowing River**

## **Project Overview**
A minimalist and artistic web experience featuring a top-down view of a flowing river. The text "수요일과 바다 유리" (Wednesday and Sea Glass) will be scattered across the water, drifting gracefully with the current to create a meditative and visually engaging atmosphere.

## **Project Features & Design**
- **Top-Down View (Orthographic):** A clean, flattened perspective that focuses on the surface of the water.
- **Dynamic Water Shader:** A Three.js-based animated shader to simulate flowing water with subtle ripples and light reflections.
- **Flowing Text Entities:** Characters and phrases from "수요일과 바다 유리" will be rendered as drifting objects, moving from top to bottom and reappearing to create an infinite flow.
- **Responsive Design:** The canvas will automatically adjust to fit any screen size, ensuring a seamless experience on both desktop and mobile.
- **Minimalist Aesthetic:** A palette of deep teals, soft blues, and crisp white text, complemented by subtle noise textures for a premium feel.

## **Current Implementation Status**
- [x] Project Reset & Setup
- [x] Core Three.js Scene Initialization
- [x] Water Shader/Flowing Surface Implementation
- [x] Flowing Text "수요일과 바다 유리" Logic
- [x] Mouse Interaction & Flow Disturbance
- [ ] Visual Polish & Responsiveness

## **Detailed Outline**
- **Initial Version:** Redesigning from scratch as a top-view river with flowing text.
- **Tech Stack:** HTML5, CSS3, JavaScript (ES Modules), Three.js (via CDN).
- **Key Visuals:** Animated water noise, orthographic top-down perspective, scattered Korean text elements drifting.
- **Mouse Interaction (New):**
    - **Interactive Flow:** The mouse acts as a physical object in the water, creating "wakes" or "disturbances."
    - **Repulsion Logic:** Text elements will be pushed away when the mouse approaches, using a physics-based approach with velocity and damping.
    - **Directional Influence:** The speed and direction of the mouse movement will temporarily alter the drift path of nearby text.
    - **Visual Feedback:** The water shader may be updated to reflect mouse position as a "ripple" source.
