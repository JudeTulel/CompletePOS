# RelyOn POS Installation Guide

This guide provides step-by-step instructions for setting up and running the RelyOn POS application.

## 1. Prerequisites

Before installing, ensure you have the following setup:

### Database (MariaDB)
The application requires MariaDB. I have provided an automated script to handle the installation and configuration for you.

1.  **Run Automated Installer**: Right-click `install_mariadb.bat` in the root folder and select **Run as Administrator**.
2.  **What it does**:
    - Downloads MariaDB (if not already present).
    - Installs it silently.
    - Sets the `root` password to `@1234`.
    - Starts the MySQL/MariaDB service on port 3306.

*Note: If you already have MariaDB/MySQL installed with a different password, you must ensure the service is running and the password matches `@1234`, or update the app configuration.*

### Required for Developers
- **Node.js** (v18 or higher): [Download Node.js](https://nodejs.org/)
- **Rust Compiler**: Required for Tauri builds. [Install Rust](https://www.rust-lang.org/tools/install)
- **Visual Studio Build Tools**: Required for Rust/Tauri.

---

## 2. Desktop Application Setup (Recommended)

To install the application using the pre-built Windows installer:

1.  **Locate the Installer**: Open the following path in your file explorer:
    `C:\pos\POS\src-tauri\target\release\bundle\msi\RelyOn POS_0.1.0_x64_en-US.msi`
2.  **Run the Installer**: Double-click the `.msi` file and follow the on-screen instructions.
3.  **Launch**: Once installed, you can find **RelyOn POS** in your Start Menu.
4.  **Backend Sidecar**: The application automatically starts the backend server when launched. You do **not** need to run it manually.

---

## 3. Database Initialization

The application is designed to handle database setup automatically, but ensure your MySQL service is running:

1.  Open **Services** (type `services.msc` in Start Menu).
2.  Find **MySQL** or **MySQL80** and ensure the status is **Running**.
3.  The application will automatically create the `relyon_pos` database and all necessary tables on the first launch.

---

## 4. Default Credentials

Use the following details for the initial login:

- **Username**: `admin`
- **Password**: `admin123`

---
## 5. Development & Verification (Before Build)

To verify that the frontend and backend work correctly before creating a release build:

### Recommended: Separate Terminals (for Logs)
This is the best way to see error messages from both parts.

1.  **Terminal 1 (Backend)**:
    ```powershell
    cd backend
    npm run start:dev
    ```
    *Wait for "Nest application successfully started".*

2.  **Terminal 2 (Frontend/Tauri)**:
    ```powershell
    # Run as a regular web app
    cd next_pos
    npm run dev
    
    # OR run inside Tauri (Dev Mode)
    cd src-tauri
    npx tauri dev
    ```

### Unified Command
I have added a root `package.json` to simplify this. From the root directory:
```powershell
# Install concurrent manager
npm install

# Start both frontend and backend
npm run dev
```

---
## 6. Building the Final Installer
Once verified, you can generate the MSI installer:
1. Ensure the backend is built and sidecar is updated:
   ```powershell
   npm run build:backend
   ```
2. Build the Tauri application:
   ```powershell
   npx tauri build
   ```
The installer will be in `src-tauri/target/release/bundle/msi/`.

- **Connection Error**: Ensure MySQL is running on port 3306 with the password `@1234`.
- **404/500 Errors**: Check the backend logs. In the desktop app, the backend runs as a sidecar; in dev mode, check the terminal output.
- **Firewall**: Ensure your firewall allows local connections on ports 3000 (frontend) and 5000 (backend).

---

For further technical details, refer to the [walkthrough.md](file:///C:/Users/Dell/.gemini/antigravity/brain/a578a141-0301-48e7-ba19-4b4a800f3af3/walkthrough.md).
