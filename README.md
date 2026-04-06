# Firebase Studio

This is a NextJS starter project for Gastronomic AI.

## Getting Started

Before running the application, you need to set up your local environment variables. These keys allow the application to connect to your Firebase project and Google AI services.

1.  **Create an environment file:**
    In the root of the project, create a new file named `.env`.

2.  **Copy the contents from `.env.example`:**
    Copy the entire content of the `.env.example` file and paste it into your new `.env` file.

3.  **Fill in your Firebase keys:**
    - Go to your [Firebase Console](https://console.firebase.google.com/).
    - Select your project.
    - Go to **Project Settings** (the gear icon next to "Project Overview").
    - In the **General** tab, under the "Your apps" section, find your web app.
    - Copy the configuration values (apiKey, authDomain, etc.) and paste them into the corresponding `NEXT_PUBLIC_` variables in your `.env` file.

4.  **Fill in your Gemini API key:**
    - Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    - Create or copy an existing API key.
    - Paste this key into the `GEMINI_API_KEY` variable in your `.env` file.

5.  **Install dependencies and run the app:**
    ```bash
    npm install
    npm run dev
    ```

## Admin Access

To access the admin dashboard, you'll first need to sign in. The default login page is at `/login`.

Make sure you have enabled Google as a sign-in provider in your Firebase project's **Authentication > Sign-in method** tab. You also need to add your app's domain to the **Authorized domains** list in the same section.
