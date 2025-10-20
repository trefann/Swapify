# **App Name**: SkillSwap

## Core Features:

- User Authentication: Enable users to sign up and log in using email and Google authentication via Firebase Auth.
- User Profiles: Create and manage user profiles with skills offered, skills wanted, profile picture, bio, and availability. Stored in Firestore.
- Skill Browsing and Search: Allow users to browse and search for skills offered by others using Firestore.
- Credit System: Implement a credit-based system where teaching for 1 hour earns 1 credit, and learning for 1 hour spends 1 credit. Track credits in Firestore.
- Swap Requests: Enable users to request skill-swapping sessions with other users. Include accept/decline flow managed via Firestore.
- In-App Scheduling: Implement an in-app calendar picker for scheduling swap sessions.  Just store date/time and participants in Firestore. The AI acts as a tool to check if the scheduler event conflicts with another event. 
- Chat System: Add a basic 1-to-1 chat system under each swap request to facilitate communication. Messages are stored in Firestore.
- Rating and Feedback: Allow users to rate and provide feedback after a session ends. Store ratings and feedback in Firestore.

## Style Guidelines:

- Primary color: Dark blue (#0A0A2A) for a sophisticated base.
- Background color: Darker shade of blue (#151535) at a desaturated (25%) brightness suitable for a dark scheme, providing a modern look.
- Accent color: Very dark blue (#00001A), an analogous hue which is different enough to ensure good contrast, enhancing key interactive elements.
- Font pairing: 'Poppins' (sans-serif) for headlines and short amounts of text and 'Inter' (sans-serif) for body text.
- Use minimalistic, line-based icons to represent skills and actions, ensuring they are easily recognizable.
- Maintain a clean, card-based layout with ample spacing to enhance readability and user experience. Use Surface/Card color: #2A2A4A for each container card
- Implement subtle animations for transitions and feedback, such as fade-in effects and button presses, to improve the app's interactivity. For all button actions, use a shadow highlight.