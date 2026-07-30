# E-Commerce Microservices

A modern e-commerce platform built with a microservices architecture using **Spring Boot 4.1.0**, **Java 26**, and **Docker**.

## Architecture

This project is composed of the following microservices:

| Service | Responsibility |
|---|---|
| **API Gateway** | Single entry point — routes requests to the appropriate backend service |
| **User Service** | User registration, authentication, and profile management |
| **Product Service** | Product catalog, categories, search, and inventory tracking |
| **Cart Service** | Shopping cart management for authenticated users |
| **Order Service** | Order placement, status tracking, and history |
| **Payment Service** | Payment processing and transaction management |
| **Inventory Service** | Stock levels, warehouse management, and supply tracking |
| **Notification Service** | Email, SMS, and push notification delivery |

## Tech Stack

- **Language:** Java 26
- **Framework:** Spring Boot 4.1.0
- **Database:** PostgreSQL (per-service database)
- **ORM:** Spring Data JPA / Hibernate
- **Security:** Spring Security with JWT
- **API:** RESTful with OpenAPI documentation
- **Containerization:** Docker & Docker Compose
- **Build Tool:** Maven

## Prerequisites

- Java 26+
- Maven
- Docker & Docker Compose

## Getting Started

### 1. Start the infrastructure

```bash
docker compose up -d
```

This starts the required PostgreSQL databases for each service.

### 2. Build all services

```bash
cd api-gateway && mvn clean install && cd ..
cd user-service && mvn clean install && cd ..
# ... repeat for each service
```

### 3. Run individual services

```bash
cd user-service && mvn spring-boot:run
```

Each service starts on its own port (e.g., User Service on `8081`, API Gateway on `8080`).

## Project Status

🚧 **Under active development** – Initial scaffolding complete. Authentication and core services being built out.
