# Smart Campus Operations Hub

> A full-stack team project for managing campus facilities, bookings, maintenance, and notifications.

**Stack:** Spring Boot (Backend) + React.js (Frontend)

---


---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+

---

### Backend Setup

```bash
cd backend

# Run with H2 in-memory DB (no MySQL needed for development)
mvn spring-boot:run
```

- API runs at: `http://localhost:8080`
- H2 Console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:smartcampusdb`
  - Username: `sa` | Password: *(empty)*

**Swagger/API Docs** *(TODO: Member 1 — add springdoc-openapi)*

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (proxies /api → backend)
npm run dev
```

- App runs at: `http://localhost:3000`
- API proxy: All `/api/*` calls are forwarded to `http://localhost:8080`

---

## 🔑 API Endpoints Summary

### Auth — Member 1
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, receive JWT |

### Resources — Member 3
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/resources` | List all resources |
| GET | `/api/resources/available` | Available only |
| GET | `/api/resources/type/{type}` | Filter by type |
| POST | `/api/resources` | Create (Admin) |
| PUT | `/api/resources/{id}` | Update (Admin) |
| DELETE | `/api/resources/{id}` | Delete (Admin) |

### Bookings — Member 2
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | All bookings (Admin) |
| GET | `/api/bookings/user/{userId}` | User's bookings |
| POST | `/api/bookings` | Create booking |
| PATCH | `/api/bookings/{id}/status` | Update status |
| DELETE | `/api/bookings/{id}` | Cancel booking |

### Tickets — Member 4
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | All tickets (Admin/Staff) |
| GET | `/api/tickets/user/{userId}` | User's tickets |
| POST | `/api/tickets` | Report issue |
| PUT | `/api/tickets/{id}` | Update ticket |
| DELETE | `/api/tickets/{id}` | Close ticket |

### Notifications — Member 1
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/user/{userId}` | User's notifications |
| GET | `/api/notifications/user/{userId}/unread` | Unread count |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| PATCH | `/api/notifications/user/{userId}/read-all` | Mark all read |

---

## 🔐 Authentication

- JWT token stored in `localStorage` → auto-attached by Axios interceptor
- Token expires in **24 hours** (configurable in `application.properties`)
- Unauthenticated requests to protected routes → redirect to `/login`

### Test Login Flow
1. `POST /api/auth/register` with name, email, password
2. Use the returned `token` in `Authorization: Bearer <token>` header

---

## 🛠 Development Guidelines

### Backend
- **Add new entity** → `model/` → `repository/` → `service/` (interface + impl) → `controller/`
- **Throw exceptions** using `ResourceNotFoundException` or `BadRequestException` — handled globally
- **Use DTOs** — never expose JPA entities directly to the API layer

### Frontend
- **All API calls** must go through `services/` — never call `axios` directly
- **Auth state** → use `useAuth()` hook, never read from localStorage directly
- **Loading/Error** → use `useApi()` hook for consistent UX
- **Styling** → use CSS variables from `index.css` — no hardcoded colors

---


---

## 🔗 Useful Links

- [Spring Boot Docs](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [React Router v6](https://reactrouter.com/en/main)
- [Axios Docs](https://axios-http.com/docs/intro)
- [Spring Security JWT Guide](https://www.baeldung.com/spring-security-oauth-jwt)
