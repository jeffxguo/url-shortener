# Cloud-Native URL Shortener on AWS

A full-stack URL shortener application built with React and Node.js, containerized with Docker, and deployed to AWS with a fully automated CI/CD pipeline using GitHub Actions.

---

### **Features**
-   Shorten any valid long URL.
-   Redirect users from the short URL to the original URL.
-   Reuses existing short links for URLs that have already been shortened.

---

### **Technologies Used**
-   **Frontend:** React (Vite), Axios
-   **Backend:** Node.js, Express
-   **Database:** PostgreSQL
-   **Containerization:** Docker
-   **Cloud Provider:** AWS
    -   **Compute:** ECS on Fargate
    -   **Database:** RDS
    -   **Networking:** Application Load Balancer, VPC, Security Groups
    -   **Container Registry:** ECR
-   **CI/CD:** GitHub Actions

---

### **CI/CD Pipeline**

This project uses GitHub Actions for automated deployments. Every push to the `main` branch triggers a workflow that:
1.  Builds the frontend and backend Docker images.
2.  Pushes the images to Amazon ECR.
3.  Forces a new deployment in Amazon ECS to pull the latest images.

