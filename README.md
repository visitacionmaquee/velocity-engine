# Velocity Engine
Velocity Engine is a production-grade, full-stack hardware telemetry system designed to monitor and visualize system performance in real-time. It leverages a containerized architecture to provide scalable, reliable observability.

# 🚀 Live Demo
Access the live dashboard here: https://velocity-frontend-fdwh.onrender.com

# 🛠️ Architecture Overview
The system is built as a cohesive microservice cluster, ensuring clean separation between data ingestion, storage, and visualization.

Layer                              Technology                              Role

Telemetry Harvest	                Node.js (os module)	            Captures low-level CPU and RAM metrics.

Data Persistence	                PostgreSQL	                    Stores performance snapshots and historical logs.

API Gateway	                      Express.js	                    Manages data ingestion and analytics queries.

UI Dashboard	                    React + Vite	                  Renders the real-time performance visual grid.

Deployment	                      Docker + Render	                Orchestrates the containerized cloud environment.


# ⚙️ Key Features
-Real-Time Monitoring: Low-latency tracking of system resource utilization.

-Persistent Storage: Historical metric logging for performance trend analysis.

-Cloud-Native Deployment: Fully containerized setup, ensuring environment parity from development to production.

# 🛠️ Development & Deployment
The project is architected using Infrastructure-as-Code principles via render.yaml, enabling automated cloud provisioning.

Local Setup
Clone the Repository:

Bash
git clone https://github.com/visitacionmaquee/velocity-engine.git
cd velocity-engine
2.  **Environment Configuration:** Create a `.env` file in the root directory following the provided template:
    ```env
    DB_USER=your_user
    DB_PASSWORD=your_password
    DB_NAME=velocity_db
    DB_HOST=db
    DB_PORT=5432
Run with Docker:

Bash
docker-compose up --build

---

## 🔮 Future Roadmap
* **Alerting Engine:** Implementing custom threshold triggers for high CPU/RAM usage via webhooks.
* **Time-Series Analytics:** Integrating interactive date-range toggles for historical trend visualization.
* **Distributed Monitoring:** Developing a lightweight agent for cross-device telemetry collection.
