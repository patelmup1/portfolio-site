# Meet Patel - Interactive Developer Portfolio

> A high-performance, accessible, and interactive portfolio website built with modern web technologies.

![Portfolio Preview](./photos/profile.webp)

## 🚀 Overview

This portfolio showcases my work as a **Software Engineer** and **Frontend Developer**, featuring interactive 3D elements, optimized performance, and a comprehensive blog. It is designed to be a **Progressive Web App (PWA)**, capable of working offline and installing on mobile devices.

**Live Demo:** [meetpatel.me](https://meetpatel.me)

## 🛠️ Tech Stack

-   **Core**: HTML5, Vanilla JavaScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (CDN)
-   **3D Graphics**: [Three.js](https://threejs.org/) (for the 3D Workspace)
-   **Typography**: Google Fonts (Oswald & Manrope)
-   **Icons**: [Lucide](https://lucide.dev/) (via SVG)
-   **PWA**: Service Worker (`sw.js`) + Manifest (`manifest.json`)
-   **Forms**: [Formsubmit.co](https://formsubmit.co/) (Secure, serverless form handling)

## ✨ Key Features

-   **High Performance**: Near-instant load times with `glContent` preloading and WebP image optimization.
-   **PWA Ready**: Installable on iOS/Android; works offline via Service Worker caching.
-   **SEO Optimized**: JSON-LD Schema (Person), Open Graph tags, and Semantic HTML5.
-   **Accessible**: High contrast text, proper ARIA labels, and keyboard navigation support.
-   **Secure**: Strict Content Security Policy (CSP), `rel="noopener"`, and HTTPS-only forms.
-   **Clean Code**: Organized, commented, and modular structure.

## 📂 Project Structure

```bash
portfolio/
├── index.html          # Main landing page
├── projects.html       # Portfolio showcase
├── blog.html           # Tech blog index
├── contact.html        # Contact form
├── sw.js               # Service Worker (Offline caching)
├── manifest.json       # PWA Manifest
├── sitemap.xml         # SEO Sitemap
├── human.txt           # Credits
└── photos/             # Optimized WebP assets
```

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/patelmup1/portfolio-v2.git
    cd portfolio-v2
    ```

2.  **Serve the files**:
    Since this uses ES modules and Service Workers, you need a local server.
    
    *Using Python:*
    ```bash
    python -m http.server 8000
    ```
    
    *Using VS Code:*
    Install the "Live Server" extension and click "Go Live".

3.  **Open in Browser**:
    Visit `http://localhost:8000`

## 🔒 Security

This site implements a strict **Content Security Policy (CSP)** to prevent XSS attacks. If you modify the code to include external scripts (like Analytics), remember to update the CSP meta tag in the `<head>` of every HTML file.

## 📄 License

© 2025 Meet Patel. All rights reserved.
Code available for educational purposes. Please do not use the design or content without permission.
