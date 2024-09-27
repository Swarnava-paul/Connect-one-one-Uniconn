<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation for One-on-One Session Booking System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        h1, h2, h3 {
            color: #2c3e50;
        }
        pre {
            background-color: #eaeaea;
            padding: 10px;
            border-radius: 5px;
        }
        code {
            background-color: #eaeaea;
            padding: 3px 5px;
            border-radius: 3px;
        }
        .flowchart {
            background-color: #ffffff;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>

<h1>API Documentation for One-on-One Session Booking System</h1>

<h2>Overview</h2>
<p>This document provides an overview of the API endpoints used for booking one-on-one sessions, managing user availability, and handling authentication. It is designed to help the frontend team understand how to interact with the backend effectively.</p>

<h2>Authentication Flow</h2>
<h3>User Login</h3>
<ul>
    <li>Users log in via Google OAuth.</li>
    <li>Upon successful login, a JWT token is generated and returned to the frontend.</li>
</ul>

<h3>Token Verification</h3>
<p>The token is used to authenticate requests to protected routes.</p>

<h2>API Endpoints</h2>

<h3>1. User Authentication</h3>
<p><strong>Endpoint:</strong> /login/auth/google<br>
<strong>Method:</strong> GET<br>
<strong>Description:</strong> Initiates the Google OAuth authentication process.</p>

<h3>2. Fetch User Information</h3>
<p><strong>Endpoint:</strong> /login/getUserInfo<br>
<strong>Method:</strong> GET<br>
<strong>Authentication:</strong> Required</p>
<p><strong>Request Headers:</strong></p>
<pre><code>Authorization: Bearer {token}</code></pre>
<p><strong>Response Body:</strong></p>
<pre><code>{
  "message": "User Fetched",
  "name": "User Name",
  "email": "user@example.com",
  "sharable_link": "http://localhost:5173/sharable?userId"
}</code></pre>

<h3>3. Generate Sharable Link</h3>
<p><strong>Endpoint:</strong> /api/v1/sharableLink<br>
<strong>Method:</strong> POST<br>
<strong>Authentication:</strong> Required</p>
<p><strong>Request Headers:</strong></p>
<pre><code>Authorization: Bearer {token}</code></pre>
<p><strong>Response Body:</strong></p>
<pre><code>{
  "response": true,
  "message": "Sharable Link Generated Successfully",
  "sharable_link": "http://localhost:5173/sharable?userId"
}</code></pre>

<h3>4. Update Availability Slots</h3>
<p><strong>Endpoint:</strong> /api/v1/slots<br>
<strong>Method:</strong> PATCH<br>
<strong>Authentication:</strong> Required</p>
<p><strong>Request Headers:</strong></p>
<pre><code>Authorization: Bearer {token}</code></pre>
<p><strong>Request Body:</strong></p>
<pre><code>{
  "availability": [
    {
      "month": 10,
      "date": 1,
      "slots": [
        { "start": "10:00", "end": "11:00" },
        { "start": "14:00", "end": "15:00" }
      ]
    }
  ]
}</code></pre>
<p><strong>Response:</strong></p>
<pre><code>{
  "message": "Slots Updated Successfully"
}</code></pre>

<h3>5. Configure Session</h3>
<p><strong>Endpoint:</strong> /api/v1/configure-session<br>
<strong>Method:</strong> GET<br>
<strong>Query Parameters:</strong> ?id=userId<br>
<strong>Description:</strong> Retrieves host information for booking a session.</p>
<p><strong>Response Body:</strong></p>
<pre><code>{
  "response": true,
  "message": "Successful",
  "info": {
    "name": "Host Name",
    "email": "host@example.com",
    "availability": [...]
  }
}</code></pre>

<h3>6. Book a Session</h3>
<p><strong>Endpoint:</strong> /api/v1/book-session<br>
<strong>Method:</strong> POST</p>
<p><strong>Request Body:</strong></p>
<pre><code>{
  "id": "booking_with_person_id",
  "startTime": "2024-09-30T14:00:00",
  "bookerEmail": "booker@example.com",
  "bookerName": "Booker Name",
  "bookerTimeZone": "America/New_York"
}</code></pre>
<p><strong>Response Body:</strong></p>
<pre><code>{
  "response": true,
  "message": "Session Scheduled Successfully",
  "bookingWithPersonInfo": {
    "name": "Host Name",
    "email": "host@example.com"
  },
  "bookingInfo": {
    "location": "Google Meet",
    "meetingLink": "https://meet.google.com/xxxxx",
    "meetingDate": "2024-09-30T14:00:00-05:00",
    "meetingDuration": "30 Minutes"
  }
}</code></pre>

<h2>Flowchart</h2>
<div class="flowchart">
    <p><strong>Interaction Flow:</strong></p>
    <pre>
+------------------+
| User Logs In     |
| via Google OAuth |
+------------------+
          |
          v
+------------------+
| Receive JWT Token|
+------------------+
          |
          v
+------------------+
| Generate Sharable|
| Link             |
+------------------+
          |
          v
+-------------------+
| User Sets Avail-  |
| ability Slots     |
+-------------------+
          |
          v
+-------------------+
| Another User      |
| with the sharable  |
| link will able to  |
| get availability   |
| details of host    |
| for session booking |
| (Get Host Info)   |
+-------------------+
          |
          v
+-------------------+
| Book Session      |
| (Create Google    |
| Meet Event)      |
+-------------------+
          |
          v
+-------------------+
| Receive Booking    |
| Confirmation       |
+-------------------+
    </pre>
</div>

</body>
</html>
