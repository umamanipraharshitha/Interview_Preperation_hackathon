# System Architecture

## Architecture Diagram

```mermaid
graph TD
    Client[Flutter App Candidate/Recruiter] --> LB[Load Balancer]
    LB --> Gateway1[API Gateway - Server 1]
    LB --> GatewayN[API Gateway - Server N]
    
    subgraph Microservices Layer (Horizontally Scaled for 10k+ users)
        Gateway1 --> ResumeSvc[Resume Service Cluster]
        GatewayN --> ResumeSvc
        Gateway1 --> InterviewSvc[Interview Service Cluster]
        GatewayN --> InterviewSvc
        Gateway1 --> AISvc[AI Evaluation Service Cluster]
        GatewayN --> AISvc
    end
    
    subgraph Asynchronous Processing Layer
        ResumeSvc --> Queue[Redis Queue / Celery]
        InterviewSvc --> Queue
        AISvc --> Queue
        Queue --> Worker[Worker Processing Layer]
    end
    
    subgraph Data & AI Layer
        Worker --> Gemini[Gemini API]
        Worker --> Postgres[(PostgreSQL Main DB)]
        Worker --> Qdrant[(Qdrant Vector DB)]
        Worker --> Cache[(Redis Cache)]
    end

    subgraph Integration Layer
        Worker --> GSheets[Google Sheets API]
        Worker --> EmailSvc[Email Notification Svc]
        EmailSvc --> SMTP[mpraharshitha2006@gmail.com]
    end
    
    subgraph Blockchain Audit Layer
        Worker --> BlockchainSvc[Blockchain Audit Service]
        BlockchainSvc --> SmartContract{Smart Contract}
    end
    
    classDef primary fill:#4a90e2,stroke:#333,stroke-width:2px,color:#fff;
    classDef secondary fill:#50e3c2,stroke:#333,stroke-width:2px,color:#000;
    classDef db fill:#f5a623,stroke:#333,stroke-width:2px,color:#fff;
    classDef queue fill:#9013fe,stroke:#333,stroke-width:2px,color:#fff;
    classDef integrations fill:#ff7eb3,stroke:#333,stroke-width:2px,color:#fff;
    
    class Client,Gateway primary;
    class ResumeSvc,InterviewSvc,AISvc,BlockchainSvc secondary;
    class Postgres,Qdrant,Cache db;
    class Queue,Worker queue;
    class GSheets,EmailSvc,SMTP integrations;
```

## Flow Description (Example: Resume Submission)

1. **Candidate** submits a resume via the Flutter App.
2. A **Load Balancer** distributes high volume traffic (handling 10,000+ concurrent connections) across multiple **API Gateway** server instances. The Gateway validates the JWT token and enforces rate limiting.
3. The request is routed to the **Resume Service**, which parses basic metadata and sends the payload to the **Redis Queue**.
4. The API immediately returns a `202 Accepted` response (200-400ms latency), providing a great user experience.
5. A **Worker Node** picks up the job from the queue and coordinates with the **AI Evaluation Engine** (Gemini) to extract structured data and generate an ATS score.
6. The detailed evaluation is saved to **PostgreSQL**, and resume embeddings are sent to **Qdrant**.
7. **CRM Sync**: The Worker uses the **Google Sheets API** to batch-append the new candidate's scores, ensuring we stay under Google's 60 req/min quota.
8. **Automated Offer**: If the candidate's ATS Score is > 85, the **Email Notification Service** fires an automated "You are selected!" email securely from `mpraharshitha2006@gmail.com` using the Gmail API/SMTP integration.
9. Finally, a SHA-256 hash of the evaluation data is generated and sent to the **Blockchain Audit Service**, which logs it permanently on a **Smart Contract** for tamper-proof verification.
