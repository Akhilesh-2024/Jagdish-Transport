# Jagdish Transport Management System

A comprehensive transport management system built with Spring Boot to streamline logistics operations, billing, and vehicle management for transport businesses.

## Overview

Jagdish Transport Management System is a web-based application designed to automate and manage the day-to-day operations of a transport company. The system provides tools for managing vehicles, tracking trips, handling billing and invoicing, and maintaining customer information.

## Features

### Vehicle Management
- Register and track vehicles
- Categorize vehicles by type
- Manage vehicle maintenance schedules
- Generate vehicle statements

### Trip Management
- Create and track trip vouchers
- Manage trip areas and routes
- Record trip details and expenses

### Billing & Invoicing
- Generate party bills and invoices
- Configure bill settings
- Track payment status
- Manage different rate types (Freight, CDWT, Waiting, etc.)

### Customer Management
- Maintain party (customer) master records
- Track customer transactions
- Manage customer locations and areas

### User Management
- Secure user authentication and authorization
- User profile management
- Role-based access control

### Dashboard & Reporting
- View key performance indicators
- Access recent transactions
- Generate various reports

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.4.3
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL Database

### Frontend
- Thymeleaf templating engine
- HTML/CSS/JavaScript
- Bootstrap (assumed)

### Additional Tools
- Maven for dependency management
- Spring Mail for email notifications
- Lombok for reducing boilerplate code
- Hibernate Validator for data validation

## Getting Started

### Prerequisites
- JDK 17 or higher
- MySQL 8.0 or higher
- Maven

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Atharva-2510/Jagdish-Transport.git
   cd Jagdish-Transport
   ```

2. **Configure the database**
   - Create a MySQL database named `jagdishtransport_db`
   - Update the database credentials in `src/main/resources/application.properties`
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/jagdishtransport_db?createDatabaseIfNotExist=true
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```

3. **Configure email settings (for notifications)**
   - Update the email configuration in `src/main/resources/application.properties`
   ```properties
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   ```

4. **Build the application**
   ```bash
   mvn clean install
   ```

5. **Run the application**
   ```bash
   mvn spring-boot:run
   ```
   
   The application will be available at `http://localhost:8081`

## Project Structure

```
src/main/java/com/example/JagdishTransport/
├── Config/                  # Configuration classes
├── Controller/              # Web controllers
├── dto/                     # Data Transfer Objects
├── model/                   # Entity classes
├── repository/              # Data access interfaces
├── service/                 # Business logic
│   └── impl/                # Service implementations
└── JagdishTransportApplication.java  # Main application class
```

## Key Components

### Models
- Vehicle-related: `VehicleMaster`, `VehicleType`
- Customer-related: `PartyMaster`, `Location`, `AreaMaster`
- Transaction-related: `TripVoucher`, `PartyBill`, `PartyBillDetail`
- User-related: `UserCredential`, `UserProfile`

### Controllers
- `VehicleMasterController` - Manages vehicle operations
- `PartyMasterController` - Handles customer management
- `TripVoucherController` - Manages trip records
- `PartyBillController` - Handles billing operations
- `DashboardStatsController` - Provides dashboard statistics

### Services
- `VehicleMasterService` - Business logic for vehicle operations
- `PartyMasterService` - Business logic for customer management
- `TripVoucherService` - Business logic for trip management
- `PartyBillService` - Business logic for billing operations
- `MailService` - Handles email notifications

## Security

The application implements Spring Security with:
- Form-based authentication
- BCrypt password encoding
- Role-based access control
- CSRF protection (disabled for specific endpoints)

## Database

The application uses MySQL with JPA/Hibernate for data persistence. The database schema is automatically created and updated using Hibernate's `ddl-auto=update` feature.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## Contact

Your Name - [atharvapimparkar1416@example.com](atharvapimparkar1416@example.com)

Project Link: [https://github.com/Atharva-2510/Jagdish-Transport](https://github.com/Atharva-2510/Jagdish-Transport)