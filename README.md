# Taskmanager

A practice MERN/microservices project for learning how independent Node.js services can communicate with MongoDB and RabbitMQ.

This project contains separate services for users, tasks, and notifications. The user and task services expose REST APIs, MongoDB stores the data, and RabbitMQ is used to publish a task-created event that the notification service can consume.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- RabbitMQ
- Docker and Docker Compose
- amqplib for RabbitMQ messaging

## Project Structure

```text
Taskmanager/
├── docker-compose.yml
├── user-service/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── task-service/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
└── notification-service/
    ├── Dockerfile
    ├── index.js
    └── package.json
```

## Services

### User Service

Runs on port `3001`.

Responsibilities:

- Connects to MongoDB database `users`
- Creates users
- Lists all users

Endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Health/basic test route |
| GET | `/users` | Get all users |
| POST | `/users` | Create a new user |

Example request:

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\"}"
```

Example response:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "_id": "..."
}
```

### Task Service

Runs on port `3002`.

Responsibilities:

- Connects to MongoDB database `tasks`
- Creates tasks
- Lists all tasks
- Publishes a `task_created` event to RabbitMQ when a task is created

Endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Health/basic test route |
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create a new task |

Example request:

```bash
curl -X POST http://localhost:3002/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Docker\",\"description\":\"Practice Docker Compose with services\",\"userId\":\"USER_ID_HERE\"}"
```

Example response:

```json
{
  "title": "Learn Docker",
  "description": "Practice Docker Compose with services",
  "userId": "USER_ID_HERE",
  "createdAt": "...",
  "_id": "..."
}
```

### Notification Service

Consumes messages from RabbitMQ queue `task_created`.

Responsibilities:

- Connects to RabbitMQ
- Listens for task-created events
- Logs a simulated notification for the user

When a task is created, the task service sends a message like:

```json
{
  "taskId": "...",
  "userId": "USER_ID_HERE",
  "title": "Learn Docker"
}
```

The notification service receives the event and prints notification details in the console.

Note: `notification-service` has a Dockerfile, but it is not currently included as a service in `docker-compose.yml`. Add it to Compose or run it separately if you want the consumer to start with the rest of the system.

## Docker Compose Services

The current `docker-compose.yml` starts:

- `mongo` on port `27017`
- `rabbitmq` on ports `5672` and `15672`
- `user-service` on port `3001`
- `task-service` on port `3002`

RabbitMQ management dashboard:

```text
http://localhost:15672
```

Default RabbitMQ login:

```text
Username: guest
Password: guest
```

## Getting Started

### Prerequisites

Install:

- Docker
- Docker Compose

### Run the Project

From the root folder:

```bash
docker compose up --build
```

The services will be available at:

- User service: `http://localhost:3001`
- Task service: `http://localhost:3002`
- RabbitMQ dashboard: `http://localhost:15672`
- MongoDB: `localhost:27017`

### Stop the Project

```bash
docker compose down
```

To stop the project and remove the MongoDB volume:

```bash
docker compose down -v
```

## Running Services Manually

Because the source code uses Docker network hostnames such as `mongo` and `rabbitmq`, manual local runs require MongoDB and RabbitMQ to be reachable by those names, or the connection strings must be changed to `localhost`.

Inside each service folder:

```bash
npm install
node index.js
```

## Example Flow

1. Start the system:

```bash
docker compose up --build
```

2. Create a user:

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice\",\"email\":\"alice@example.com\"}"
```

3. Create a task for that user:

```bash
curl -X POST http://localhost:3002/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Build practice app\",\"description\":\"Create a MERN microservices task manager\",\"userId\":\"USER_ID_FROM_STEP_2\"}"
```

4. Check tasks:

```bash
curl http://localhost:3002/tasks
```

5. Check users:

```bash
curl http://localhost:3001/users
```

6. If the notification service is running, check its logs to see the task-created event.

## Current Functionality

- Create users
- Fetch all users
- Create tasks
- Fetch all tasks
- Store user data in MongoDB
- Store task data in MongoDB
- Publish task creation events to RabbitMQ
- Consume task creation events in the notification service
- Simulate user notification through console logs
- Run the main services with Docker Compose

## Practice Goals

This project is useful for practicing:

- Building Express APIs
- Connecting Node.js services to MongoDB
- Defining Mongoose schemas and models
- Splitting an app into small services
- Using Dockerfiles for Node.js services
- Running multiple containers with Docker Compose
- Using RabbitMQ for async communication
- Publishing and consuming queue messages

## Notes for Future Improvements

- Add `notification-service` to `docker-compose.yml`
- Move hardcoded ports and connection strings into environment variables
- Add validation for request bodies
- Add user lookup before creating a task
- Add update and delete endpoints for users and tasks
- Add authentication and authorization
- Add automated tests
- Add a frontend client
- Improve error handling around RabbitMQ publishing
- Fix spelling and encoding issues in notification logs

## License

This is a practice project. Add a license if you plan to share or publish it.
