
# Project Blueprint

## Overview

This project is a simple web application that displays a 3D model of a house created with line drawings. The user can rotate the house 360 degrees using the mouse wheel.

## Features

*   **3D House Model:** A cute house with a roof, a round window on the roof, and square windows on the first floor.
*   **Line Drawing Style:** The house is rendered in a wireframe/line-drawing style.
*   **Interactive Rotation:** The user can rotate the house around the y-axis by scrolling the mouse wheel.
*   **Modern Web Technologies:** The project uses Three.js for 3D graphics and modern JavaScript (ES Modules).

## Implementation Plan

1.  **HTML Setup (`index.html`):**
    *   Create a basic HTML structure.
    *   Add a `<canvas>` element for the Three.js scene.
    *   Include the Three.js library from a CDN.
    *   Link the `main.js` and `style.css` files.

2.  **CSS Styling (`style.css`):**
    *   Make the canvas fill the entire viewport.
    *   Remove default margins and paddings.
    *   Set a background color for the scene.

3.  **JavaScript Logic (`main.js`):**
    *   **Scene and Renderer:**
        *   Create a `Scene`, `PerspectiveCamera`, and `WebGLRenderer`.
        *   Set the renderer size to match the window dimensions.
        *   Append the renderer's DOM element to the body.
    *   **House Geometry:**
        *   Create the house body using a `BoxGeometry` and `LineBasicMaterial`.
        *   Create the roof using a custom `BufferGeometry`.
        *   Create the windows (one round, two square) using custom `BufferGeometry`.
        *   Group all the house parts into a single `Group` object.
    *   **Rotation Control:**
        *   Add a `wheel` event listener to the window.
        *   Update the `rotation.y` property of the house group based on the wheel's delta.
    *   **Animation Loop:**
        *   Create a function to render the scene.
        *   Use `requestAnimationFrame` to call the render function continuously.
