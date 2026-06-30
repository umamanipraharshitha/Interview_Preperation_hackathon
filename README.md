# NextGen AI Interview & Hiring Platform

A comprehensive, distributed AI-powered platform designed to empower both candidates and recruiters. It features interactive, voice-enabled AI practice interviews to help candidates prepare, alongside automated resume screening and evaluation with a tamper-proof blockchain audit layer for recruiters.

## 🚀 Overview

This platform modernizes the hiring process from both sides. For candidates, it offers a real-time, voice-enabled **AI Practice Interview** module (built with React) that listens to spoken answers, asks context-aware follow-up questions, and provides detailed feedback and scoring. For recruiters, it parses high volumes of resumes and evaluates candidates asynchronously using AI (Gemini LLM). It ensures security and immutability by storing cryptographic hashes of all candidate evaluations on a blockchain smart contract. When a candidate meets the selection criteria, their details are synced to a Google Sheet and they receive an automated email from `mpraharshitha2006@gmail.com`.

## ✨ Features

- **Voice-Enabled AI Practice Interviews**: Real-time conversational AI interviewer that listens via microphone, asks context-aware questions based on your resume, and provides actionable feedback.
- **AI-Powered Evaluation**: Generates ATS scores, technical scores, and communication ratings using Gemini LLM.
- **Asynchronous Processing**: Uses Redis and Celery/Worker nodes to process 500+ resumes/minute without blocking the API.
- **Tamper-Proof Audit Trail**: Hashes evaluation results (SHA-256) and stores them on a blockchain to ensure hiring decisions are verifiable and immutable.
- **Semantic Search**: Integrates Qdrant Vector DB for fast and accurate resume embeddings and semantic candidate matching.
- **Automated Reporting & CRM**: Automatically updates a live Google Sheet via the Google Sheets API with candidate scores.
- **Automated Email Notifications**: Automatically sends an acceptance email from `mpraharshitha2006@gmail.com` via SMTP/Gmail API for candidates scoring above a defined threshold.
- **High Performance**: Achieves 200–400ms API response times and < 1 sec AI evaluation latency for cached profiles.

## 🏗️ System Architecture

- **API Gateway (FastAPI)**: Handles JWT Authentication, Routing, and Rate Limiting (e.g., 100 req/min per user).
- **Services**:
  - **Resume Service**: Upload, text extraction, structured data generation.
  - **Interview Service**: Handles real-time AI Q&A flow with context and history management.
  - **AI Evaluation Service**: Gemini integration for candidate scoring and final interview feedback.
- **Queue/Worker Layer**: Redis & Celery for handling heavy background AI jobs.
- **Database Layer**:
  - **PostgreSQL**: Primary DB for users, chat histories, results, and logs.
  - **Qdrant**: Vector database for resume embeddings.
  - **Redis**: Caching and queue storage.
- **Integration Layer**:
  - **Reporting Module**: Synchronizes candidate data to Google Sheets using batched updates.
  - **Notification Module**: Triggers asynchronous email alerts via SMTP.
- **Blockchain Audit Layer**: Smart contract (Solidity/Ethereum or Polygon) storing SHA-256 hashes of evaluation data.

## 📊 System Metrics

- **Throughput**: 500+ resumes/min processed asynchronously.
- **API Latency**: 200–400ms API response time.
- **AI Latency**: < 1 sec AI evaluation latency for cached data; 3-5 sec for cold starts.
- **Scalability**: Supports 10,000+ candidate records and 300+ concurrent interview sessions.
- **Rate Limiting (Internal)**: Gateway enforced at 100 requests per minute per IP/User.

## 💻 Tech Stack

- **Backend**: Python, FastAPI, Celery
- **Databases**: PostgreSQL, Qdrant (Vector DB), Redis
- **AI/LLM**: Google Gemini API
- **External APIs**: Google Sheets API, Web Speech API (Voice), Gmail API / SMTP
- **Blockchain**: Solidity, Web3.js / Ethers.js
- **Frontend (Web)**: React.js, Vite, CSS Modules
- **Frontend (Mobile)**: Flutter

## 🚀 Request Flow (Practice Interview)

1. **Start**: User uploads a resume and initiates a practice interview via the React Web App.
2. **Interact**: User speaks their answer using the microphone (Web Speech API). The text is sent to the Interview Service.
3. **Context-Aware Response**: The backend retrieves chat history, passes it to Gemini LLM, and returns a tailored follow-up question.
4. **Evaluate**: User clicks "End & Evaluate". The system sends the full transcript to the AI Evaluation Engine.
5. **Feedback**: The engine generates detailed suggestions, technical scores, and communication scores, which are saved to PostgreSQL and displayed to the user.
