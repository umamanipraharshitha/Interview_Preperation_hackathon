# Step-by-Step Implementation Plan

## Phase 1: Core Setup, Load Balancing, & API Gateway
1. **Initialize Project:** Set up the Python virtual environment and FastAPI boilerplate.
2. **Horizontal Scaling & Load Balancing:** Provision multiple application servers and configure a Load Balancer (e.g., NGINX, AWS ALB) to manage and route traffic, ensuring the system can easily process 10,000+ concurrent requests.
3. **API Gateway:** Implement JWT authentication and role-based access control (Recruiter vs. Candidate) across all gateway instances.
4. **Rate Limiting:** Integrate `slowapi` or Redis-based rate limiting on the FastAPI gateways (e.g., 100 requests / minute / IP).

## Phase 2: Microservices & Data Layer
1. **Database Schema (PostgreSQL):** Use SQLAlchemy to define `Users`, `Resumes`, `Interviews`, and `Evaluations` tables.
2. **Resume & Interview Services:** Build CRUD endpoints for uploading resumes and starting interview sessions.
3. **Vector DB (Qdrant):** Set up a Qdrant instance. Create logic to generate vector embeddings from resumes and store them for semantic search.

## Phase 3: Asynchronous Processing (Message Queue)
1. **Redis & Celery/BullMQ Setup:** Spin up a Redis instance. Configure Celery workers to handle background tasks.
2. **Job Scheduling:** Update services to push processing jobs to the queue instead of blocking the main thread, maintaining 200-400ms API response times.
3. **Worker Implementation:** Write worker functions that pull jobs, call the AI Evaluation Service, and update the PostgreSQL database.

## Phase 4: AI Evaluation Engine
1. **Gemini Integration:** Obtain API keys and set up the Google Gemini SDK.
2. **Prompt Engineering:** Create robust prompts that output structured JSON containing the ATS Score, Technical Score, and Communication Score.
3. **Resilience:** Implement exponential backoff in the worker to handle Gemini API rate limits or transient errors, maintaining a sub-1 second latency for cached calls.

## Phase 5: GSheets CRM & Automated Email Notifications (NEW)
1. **Google Sheets API Integration:** 
   - Set up Google Cloud service account credentials.
   - Use `gspread` or `google-api-python-client` to append candidate scores to a designated tracking sheet.
   - Implement batching logic to adhere to the 60 requests/minute per user API quota limits.
2. **Automated Emails:**
   - Configure SMTP or the Gmail API using `mpraharshitha2006@gmail.com` credentials (via App Passwords or OAuth2).
   - Write a conditional check in the worker: `if ats_score >= 85: send_selection_email()`.
   - Use asynchronous email dispatching to avoid blocking the queue worker.

## Phase 6: Blockchain Audit Layer
1. **Smart Contract Development:** Write a Solidity contract with `storeEvaluationHash(bytes32 hash, string candidateId)`.
2. **Deployment:** Deploy the contract to a testnet (e.g., Polygon Amoy) to keep gas costs low.
3. **Blockchain Service Integration:** Use `web3.py` in the worker pipeline to generate a SHA-256 hash of the AI's output and send a transaction to the smart contract.

## Phase 7: Frontend & Final Polish
1. **Flutter App:** Build the candidate UI and the recruiter dashboard.
2. **Performance Tuning:** Ensure the system meets the target metrics (500+ resumes/min throughput).
3. **Documentation:** Finalize README, architecture diagrams, and API docs.
