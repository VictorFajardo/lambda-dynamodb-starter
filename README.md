# Lambda-DynamoDB Infra

A full-stack serverless note-taking API powered by AWS Lambda, DynamoDB, and API Gateway!

[![codecov](https://codecov.io/gh/VictorFajardo/lambda-dynamodb-starter/branch/main/graph/badge.svg)](https://codecov.io/gh/VictorFajardo/lambda-dynamodb-starter)

---

## ✅ Features

### Core API Endpoints
- `GET /notes` - Fetch all notes
- `GET /notes/{id}` - Fetch a single note by ID
- `POST /notes` - Create a new note
- `PUT /notes/{id}` - Update an existing note
- `DELETE /notes/{id}` - Delete a note

### Infrastructure (Provisioned with AWS CDK)
- AWS Lambda (Node.js) with esbuild bundling
- Amazon DynamoDB (NoSQL storage)
- API Gateway (REST interface)
- IAM Permissions configured for secure access
- Outputs API Gateway endpoint and resource ARNs

### Testing
- Unit tests using **Jest**
- API testing via **Postman Collection**

### Request Validation
- Input validation using **Zod**
- Graceful error handling for all endpoints

### Frontend
- React-based UI hosted via GitHub Pages  
  👉 [UI Simple Test — GitHub Pages](https://VictorFajardo.github.io/lambda-dynamodb-ui)

### Security & Best Practices
- Environment variables used securely
- IAM policies scoped to least privilege
- Validation on input payloads
- CORS-ready (for frontend use)

---

## 📁 Repositories

| Repository | Description |
|-----------|-------------|
| [`lambda-dynamodb-infra`](https://github.com/VictorFajardo/lambda-dynamodb-infra) | Core backend infrastructure |
| [`lambda-dynamodb-ui`](https://github.com/VictorFajardo/lambda-dynamodb-ui) | Frontend React test UI |

---

## 🧪 Local Development

- Use `cdk synth` and `cdk deploy` to bootstrap infrastructure.
- Test locally using unit tests and Postman.
- (Optional) You can enable `serverless-offline` or `AWS SAM` for local Lambda simulation.

---

## 🚀 CI/CD (Optional)

- Jest testing
- Linting and formatting

---

## 🏁 Getting Started

```bash
git clone https://github.com/VictorFajardo/lambda-dynamodb-infra
cd lambda-dynamodb-infra
npm install
cdk bootstrap
cdk deploy
