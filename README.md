# CareConnect

CareConnect is a capstone project for HTTP-5310-0NA, designed to streamline healthcare management and improve patient-provider communication.

## Features

- Patient registration and management
- Appointment scheduling
- Secure messaging between patients and providers
- Medical records management

## Technologies Used

- Node.js
- Express.js
- MongoDB
- React

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/CareConnect.git
    cd CareConnect
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create `.env` files for both the server and client using the examples below.

4. Start the application:
    ```bash
    npm start
    ```

## .env Example

### Server (`/server/.env`)
```
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/careconnect

# JWT secret key
JWT_SECRET=your_jwt_secret

# Server port
PORT=3000

# Email service credentials
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### Client (`/client/.env`)
```
# API base URL
REACT_APP_API_URL=http://localhost:3000/api

# Any other client-side environment variables
```

## License

This project is licensed under the MIT License.

## Authors

- Jinal Patel
