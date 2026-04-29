# Workflow Automation System Backend

A comprehensive Node.js/Express backend API for workflow automation with role-based access control, task management, and comprehensive API documentation.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Employee, Manager, Admin)
  - Secure password hashing

- **Task Management System**
  - Create, view, update, and delete tasks
  - Workflow state management (Pending, Approved, Rejected, In Progress, Completed, Cancelled)
  - Task assignment and tracking
  - Transition history and audit trail
  - Task statistics and reporting

- **API Documentation**
  - Swagger UI documentation at `/api-docs`
  - Complete endpoint specifications
  - Request/response examples

## Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt for password hashing
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Supertest
- **Development**: Nodemon for hot reloading

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd workflow-automation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/workflow-system
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Task Management
- `POST /api/tasks/create` - Create new task (Admin/Manager)
- `GET /api/tasks/view` - View assigned tasks (All users)
- `PUT /api/tasks/:id/transition` - Update task state (Admin/Manager)
- `GET /api/tasks/all` - Get all tasks (Admin only)
- `DELETE /api/tasks/:id` - Delete task (Admin only)
- `GET /api/tasks/summary` - Task statistics (Admin/Manager)
- `GET /api/tasks/user-stats` - User-wise statistics (Admin/Manager)

### Health Check
- `GET /` - API status
- `GET /check` - Health check
- `GET /routes` - Available routes info

## Testing

### Postman Collection
Import the `postman_collection.json` file into Postman to test all API endpoints.

**Testing Steps:**
1. Import the collection
2. Set the `baseUrl` variable to `http://localhost:5000`
3. Register a user or login to get a token
4. The token will be automatically saved and used for authenticated requests

### Automated Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API Documentation

Access the interactive API documentation at:
```
http://localhost:5000/api-docs
```

The documentation includes:
- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests

## Project Structure

```
workflow-automation-system/
├── src/
│   ├── config/
│   │   ├── db.js              # Database connection
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── taskController.js  # Task management logic
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT authentication
│   │   └── roleMiddleware.js  # Role authorization
│   ├── models/
│   │   ├── userModel.js       # User schema
│   │   └── taskModel.js       # Task schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── taskRoutes.js      # Task endpoints
│   ├── utils/
│   │   └── generateToken.js   # JWT token generation
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── tests/
│   ├── auth.test.js           # Authentication tests
│   └── setup.js               # Test configuration
├── postman_collection.json    # Postman collection
├── package.json
├── jest.config.js
├── babel.config.js
└── README.md
```

## User Roles & Permissions

### Employee
- View assigned tasks
- Update task states (limited transitions)

### Manager
- All employee permissions
- Create new tasks
- View task summaries and statistics
- Update task states

### Admin
- All manager permissions
- View all tasks in the system
- Delete tasks
- Full system access

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['employee', 'admin', 'manager'], default: 'employee'),
  timestamps: true
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String,
  state: String (enum: workflow states),
  createdBy: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  metadata: Mixed,
  transitions: [Transition Schema],
  notifications: [Notification Schema],
  timestamps: true
}
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Request logging with Morgan

## Development

### Code Style
- ES6+ syntax with modules
- Async/await for asynchronous operations
- Consistent error handling
- Comprehensive JSDoc comments

### Testing Strategy
- Unit tests for controllers
- Integration tests for API endpoints
- Authentication middleware testing
- Database operation testing with MongoDB Memory Server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

ISC License
