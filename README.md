<div align="center">
  <img src="https://img.shields.io/badge/Transport-Management-45b8d8?style=for-the-badge&logo=truck&logoColor=white" alt="Transport Management" />
  <h1>🚚 Jagdish Transport Management System 🚚</h1>
  <p><b>A comprehensive web-based application designed to automate and manage the day-to-day operations of a transport company</b></p>
  <img src="img/Dashboard.png" alt="Dashboard Preview" width="80%" style="border-radius: 12px; box-shadow: 0 4px 24px #0002; margin: 20px 0;" />
</div>

---
<br/>
<div align="center">
  <img alt="Java" src="https://img.shields.io/badge/-Java-007396?style=for-the-badge&logo=java&logoColor=white" />
  <img alt="Spring Boot" src="https://img.shields.io/badge/-Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img alt="Thymeleaf" src="https://img.shields.io/badge/-Thymeleaf-005F0F?style=for-the-badge&logo=thymeleaf&logoColor=white" />
  <img alt="Bootstrap" src="https://img.shields.io/badge/-Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" />
</div>

---
## ✨ Features
<ul>
  <li>🚗 <b>Vehicle Management</b> - Register, track, categorize vehicles and manage maintenance schedules</li>
  <li>🛣️ <b>Trip Management</b> - Create vouchers, manage routes, and record trip details</li>
  <li>💰 <b>Billing & Invoicing</b> - Generate bills, configure settings, and track payments</li>
  <li>👥 <b>Customer Management</b> - Maintain customer records and track transactions</li>
  <li>🔐 <b>User Management</b> - Secure authentication and role-based access control</li>
  <li>📊 <b>Dashboard & Reporting</b> - View KPIs and generate various reports</li>
</ul>

---
## 🖼️ Screenshots

<div align="center">
  <img src="img/Login.png" alt="Login Page" width="45%" style="margin: 10px" />
  <img src="img/TripVoucher.png" alt="Trip Voucher" width="45%" style="margin: 10px" />
  <img src="img/PartyBill.png" alt="Party Bill" width="45%" style="margin: 10px" />
  <img src="img/vehicalStatement.png" alt="Vehicle Statement" width="45%" style="margin: 10px" />
</div>

---
## 🛠️ Technology Stack

<div align="center">
  <h3>Backend</h3>
  <img alt="Java 17" src="https://img.shields.io/badge/-Java_17-007396?style=flat-square&logo=java&logoColor=white" />
  <img alt="Spring Boot" src="https://img.shields.io/badge/-Spring_Boot_3.4.3-6DB33F?style=flat-square&logo=spring-boot&logoColor=white" />
  <img alt="Spring Security" src="https://img.shields.io/badge/-Spring_Security-6DB33F?style=flat-square&logo=spring-security&logoColor=white" />
  <img alt="Hibernate" src="https://img.shields.io/badge/-Hibernate-59666C?style=flat-square&logo=hibernate&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  
  <h3>Frontend</h3>
  <img alt="Thymeleaf" src="https://img.shields.io/badge/-Thymeleaf-005F0F?style=flat-square&logo=thymeleaf&logoColor=white" />
  <img alt="HTML5" src="https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img alt="CSS3" src="https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img alt="Bootstrap" src="https://img.shields.io/badge/-Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white" />
  
  <h3>Additional Tools</h3>
  <img alt="Maven" src="https://img.shields.io/badge/-Maven-C71A36?style=flat-square&logo=apache-maven&logoColor=white" />
  <img alt="Spring Mail" src="https://img.shields.io/badge/-Spring_Mail-6DB33F?style=flat-square&logo=spring&logoColor=white" />
  <img alt="Lombok" src="https://img.shields.io/badge/-Lombok-BC4521?style=flat-square&logo=lombok&logoColor=white" />
  <img alt="Hibernate Validator" src="https://img.shields.io/badge/-Hibernate_Validator-59666C?style=flat-square&logo=hibernate&logoColor=white" />
</div>

---
## 🚀 Getting Started

<ol>
  <li><b>Clone the repository</b>
    <pre><code>git clone https://github.com/Atharva-2510/Jagdish-Transport.git
cd Jagdish-Transport</code></pre>
  </li>
  <li><b>Configure the database</b>
    <ul>
      <li>Create a MySQL database named <code>jagdishtransport_db</code></li>
      <li>Update the database credentials in <code>src/main/resources/application.properties</code></li>
    </ul>
    <pre><code>spring.datasource.url=jdbc:mysql://localhost:3306/jagdishtransport_db?createDatabaseIfNotExist=true
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password</code></pre>
  </li>
  <li><b>Configure email settings (for notifications)</b>
    <pre><code>spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password</code></pre>
  </li>
  <li><b>Build the application</b>
    <pre><code>mvn clean install</code></pre>
  </li>
  <li><b>Run the application</b>
    <pre><code>mvn spring-boot:run</code></pre>
    The application will be available at <code>http://localhost:8081</code>
  </li>
</ol>

---
## 📂 Project Structure

```text
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

---
## 🔒 Security

<ul>
  <li>🔐 <b>Form-based authentication</b></li>
  <li>🔑 <b>BCrypt password encoding</b></li>
  <li>👮 <b>Role-based access control</b></li>
  <li>🛡️ <b>CSRF protection</b></li>
</ul>

---
## 🗄️ Database

The application uses MySQL with JPA/Hibernate for data persistence. The database schema is automatically created and updated using Hibernate's `ddl-auto=update` feature.

---
## 👥 Contributing

<ol>
  <li>Fork the repository</li>
  <li>Create your feature branch (<code>git checkout -b feature/amazing-feature</code>)</li>
  <li>Commit your changes (<code>git commit -m 'Add some amazing feature'</code>)</li>
  <li>Push to the branch (<code>git push origin feature/amazing-feature</code>)</li>
  <li>Open a Pull Request</li>
</ol>

---  
## 📬 Contact  

<p align="center">  
  <a href="https://github.com/Atharva-2510/Jagdish-Transport/graphs/contributors">  
    <img src="https://contrib.rocks/image?repo=Atharva-2510/Jagdish-Transport" />  
  </a>  
</p>    

<p align="center">  
  <a href="mailto:atharvapimparkar1416@gmail.com">  
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />  
  </a>  
  <a href="https://github.com/Atharva-2510">  
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />  
  </a>  
  <a href="https://www.linkedin.com/in/atharva-pimparkar">  
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />  
  </a>  
</p>  

<p align="center">  
  <a href="mailto:akhilesh0222r@gmail.com">  
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />  
  </a>  
  <a href="https://github.com/Akhilesh-2024">  
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />  
  </a>  
  <a href="https://www.linkedin.com/in/akhilesh2022">  
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />  
  </a>  
</p>  

---

## 📄 License

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License" />
</p>
<p align="center">This project is licensed under the MIT License - see the LICENSE file for details.</p>
