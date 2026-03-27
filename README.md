<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2e4ec8d5-3587-4bee-9bd6-5016db059643

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


🏠 House Maintenance Management System

📌 Project Overview
  The House Maintenance Management System is designed to help homeowners efficiently manage and track all maintenance activities such as structural repairs, electrical work, plumbing, cleaning, and safety checks.
  This system automates scheduling, reminders, and record-keeping to ensure regular maintenance, reducing unexpected failures and costly repairs.

🎯 Problem Statement
   Maintaining a house involves multiple tasks such as structural repairs, electrical and plumbing maintenance, cleaning, and safety checks.
   In many households, these activities are performed irregularly or only when problems occur. This reactive approach leads to:

   * Water leakage
   * Electrical faults
   * Poor hygiene
   * Increased repair costs
   * Safety risks

⚠️ Limitations
   → Mostly manual tracking
   → No automation or smart alerts
   → Not designed for individual households
   → No integration of all maintenance tasks in one place
   → Difficult for beginners to use

💡 Proposed Solution

   The proposed system provides an automated workflow:

👉 Task → Schedule → Reminder → Maintenance → Record Update

✅ Key Benefits
   → Automatic scheduling of maintenance tasks
   → Smart reminders and alerts
   → Centralized tracking system
   → Easy-to-use interface
   → Maintenance history storage
   → Improved safety and cost reduction

🔄 Workflow
    User adds maintenance task
        (e.g., plumbing check, electrical inspection)
    System schedules the task
        (daily / weekly / monthly)
   Reminder is sent before due date

After completion:
   → Task status is updated
   → Record is saved in database
   → Dashboard displays:
   → Pending tasks
   → Completed tasks
   → Upcoming maintenance
   → Alerts for urgent issues

🚀 Final Stack Summary

   Frontend	        -    React.js 
   Backend	        -    Node.js + Express
   Database	        -    MongoDB (Mongoose)
   Authentication	  -    JWT (JSON Web Token)

📊 Workflow Diagram (Text Form)
   User Login
       ↓
   Add Maintenance Task
       ↓
   Store in Database
       ↓
   Set Schedule
       ↓
   Send Reminder(node-schedule)
       ↓
   Perform Task
       ↓
   Update Status
       ↓
   Save History
       ↓
  Display Dashboard   

