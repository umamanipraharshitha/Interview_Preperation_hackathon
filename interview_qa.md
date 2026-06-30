# Interview Q&A for Distributed AI Hiring System

## General System Overview

**Q: Tell me about the AI Hiring system you built.**
**A:** "I designed and implemented a distributed AI hiring system that automates resume screening and interview evaluation. It uses a microservices architecture with an API Gateway (FastAPI), queue-based asynchronous processing (Redis/Celery), and worker nodes to decouple heavy AI tasks. We used the Gemini LLM for generating candidate scores and a Qdrant Vector DB for semantic resume search. Additionally, we automated recruiter workflows by syncing data to Google Sheets and sending automated selection emails from `mpraharshitha2006@gmail.com`. Finally, to ensure the AI's decisions are transparent, we integrated a blockchain audit layer that stores cryptographic hashes of all evaluation results."

## Scalability & Performance Metrics

**Q: How did you handle high volumes of resume uploads without crashing the system?**
**A:** "We decoupled the ingestion layer from the processing layer using an event-driven architecture. When a resume is uploaded, the API Gateway returns a `202 Accepted` response in about **200–400ms**. The actual parsing and AI evaluation are pushed to a Redis Queue. Our Celery worker nodes process these jobs asynchronously, allowing us to handle spikes of **500+ resumes per minute**. We also implemented rate limiting at the API Gateway (**100 requests per minute per user**) to prevent DDoS or abuse."

**Q: How do you handle external rate limits, like the Google APIs for Sheets and Email?**
**A:** "External APIs are a common bottleneck. For the Google Sheets integration, the API has a strict quota of **60 requests per minute per user per project**. If we processed 500 resumes a minute, writing to Sheets individually would result in a `429 Too Many Requests` error. To solve this, I implemented batching in the worker nodes—grouping evaluations together and writing them in a single batched API request every few seconds. For sending emails from `mpraharshitha2006@gmail.com`, I dispatched the SMTP calls asynchronously in a separate lightweight queue to ensure the primary AI evaluation queue was never blocked by network I/O."

**Q: How do you handle AI API failures or latency?**
**A:** "AI calls can be slow or fail due to external rate limits. By placing the Gemini API calls inside our background worker layer, the user is never blocked. If a call fails, the worker uses exponential backoff and retries the job. For identical or frequently processed data, we implemented a Redis caching layer, which brings the AI evaluation latency down to **less than 1 second** for cached profiles."

## Workflow Automations (Sheets & Email)

**Q: Can you explain the automated reporting and notification flow?**
**A:** "Once the worker node finishes the Gemini AI evaluation and saves the structured data to PostgreSQL, it triggers two CRM functions. First, it appends the candidate's ATS and interview scores to a shared Google Sheet using the Google Sheets API. Second, it checks a selection condition—for example, if the ATS score is greater than **85**. If the condition is met, it connects to an SMTP server (or Gmail API) using my service email (`mpraharshitha2006@gmail.com`) and automatically sends an acceptance/next-steps email to the candidate without any human intervention."

## Blockchain & Security

**Q: Why use Blockchain for an ATS/Hiring system?**
**A:** "AI in hiring often faces scrutiny regarding bias and tampering. We store the full evaluation data in PostgreSQL, but we generate a SHA-256 hash of that data and store ONLY the hash (along with a timestamp) on a Smart Contract. This creates a tamper-proof audit trail. If a candidate or auditor ever questions the integrity of a score, we can re-hash the database record and verify it matches the blockchain exactly."

**Q: What specific data is put on the blockchain? Doesn't that violate privacy laws like GDPR?**
**A:** "No PII (Personally Identifiable Information) goes on the blockchain. We only store the SHA-256 hash of the evaluation payload. Because hashing is a one-way mathematical function, you cannot reverse-engineer the hash to find out who the candidate is or what their score was. This provides security and immutability while remaining fully GDPR compliant."

**Q: How is the API Gateway configured?**
**A:** "The API Gateway acts as our entry point, routing requests to the Resume, Interview, and AI services. We implemented JWT-based authentication so only verified users can upload or access data. We configured strict rate limiting rules—specifically, **100 requests per minute per IP**—to protect the downstream services from being overwhelmed. We used FastAPI for its incredible async performance and automatic OpenAPI documentation generation."
