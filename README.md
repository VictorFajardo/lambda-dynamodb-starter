# Lambda-DynamoDB Infra

A **full-stack serverless note-taking platform** powered by **AWS Lambda, DynamoDB, API Gateway, and Cognito**, with a React-based UI.

[![CI](https://github.com/VictorFajardo/lambda-dynamodb-infra/actions/workflows/ci.yml/badge.svg)](https://github.com/VictorFajardo/lambda-dynamodb-infra/actions/workflows/ci.yml)
[![CD](https://github.com/VictorFajardo/lambda-dynamodb-infra/actions/workflows/cd.yml/badge.svg)](https://github.com/VictorFajardo/lambda-dynamodb-infra/actions/workflows/cd.yml)
[![codecov](https://codecov.io/github/VictorFajardo/lambda-dynamodb-infra/graph/badge.svg?token=RWL3X3IAMM)](https://codecov.io/github/VictorFajardo/lambda-dynamodb-infra)
[![Node.js](https://img.shields.io/badge/node-%3E=20-green)](https://nodejs.org/)
[![AWS CDK](https://img.shields.io/badge/CDK-v2-blueviolet)](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✅ Features

### Core API Endpoints

- `GET /notes` - Fetch all notes
- `GET /notes/{id}` - Fetch a single note by ID
- `POST /notes` - Create a new note
- `PUT /notes/{id}` - Update an existing note
- `DELETE /notes` - Delete a note

### Infrastructure (Provisioned with AWS CDK)

- AWS Lambda (Node.js) with **esbuild bundling**
- Amazon DynamoDB (NoSQL storage)
- API Gateway (REST interface, with **CORS enabled**)
- AWS Cognito for authentication (with auto-login demo flow)
- IAM policies scoped to least privilege
- Outputs API endpoint and resource ARNs for quick onboarding

### Authentication

- **AWS Cognito integration** for user authentication
- **Auto-login functionality**:
  The React UI can automatically log in a demo user and fetch an ID token, eliminating manual steps for first-time testers.

### Testing

- Unit tests using **Jest**
- API testing via **Postman Collection**
- GitHub Actions CI/CD pipeline with automated tests

### Request Validation

- Input validation using **Zod**
- Graceful error handling with structured responses

### Frontend

- React-based UI hosted via GitHub Pages
  👉 [UI — GitHub Pages](https://VictorFajardo.github.io/lambda-dynamodb-ui)

### Observability

- **AWS X-Ray** enabled for request tracing and monitoring
- CloudWatch logs with structured logging

### Security & Best Practices

- Secure **environment variables** for table names, regions, and auth config
- IAM roles with least-privilege access
- Modular architecture for Lambdas and CDK resources

---

## 🏗️ Architecture

Here’s how the system is structured:

![Architecture Diagram](./docs/architecture.png)

- React UI (GitHub Pages) calls API Gateway
- API Gateway routes requests to Lambda
- Lambda functions interact with DynamoDB
- Cognito manages authentication and auto-login
- GitHub Actions handles CI/CD

---

## 🔑 Authentication Flow

![Auth Flow](./docs/auth-flow.png)

- Users authenticate via AWS Cognito
- Tokens are passed automatically to the API (auto-login demo in UI)
- API Gateway verifies identity before invoking Lambdas

---

## 📁 Repositories

| Repository                                                                        | Description                 |
| --------------------------------------------------------------------------------- | --------------------------- |
| [`lambda-dynamodb-infra`](https://github.com/VictorFajardo/lambda-dynamodb-infra) | Core backend infrastructure |
| [`lambda-dynamodb-ui`](https://github.com/VictorFajardo/lambda-dynamodb-ui)       | Frontend React UI           |

---

## 🧪 Local Development

This project supports full **local emulation** of the stack using Docker + SAM:

```bash
# Start local DynamoDB in Docker
npm run db:up

# Create and seed the DynamoDB table
npm run db:create
npm run db:seed

# Prepare local CloudFormation template
npm run local-prepare

# Run the API locally with AWS SAM
npm run local-api
```

- Run unit tests with **Jest**: `npm run test`
- Run API tests with **Postman** or `curl`
- DynamoDB data can be reset anytime using `db:create` + `db:seed`

---

## 🚀 CI/CD

- **CI**: GitHub Actions run linting, tests, and upload coverage reports to Codecov on each PR.
- **CD**: On merges to `main`, GitHub Actions automatically:
  - Run `cdk synth` to validate CloudFormation templates
  - Run `cdk diff` to preview changes
  - Deploy with `cdk deploy` (no manual approval required)
- Secure AWS OIDC integration (no long-lived AWS keys in secrets)

---

## 🏁 Getting Started

```bash
git clone https://github.com/VictorFajardo/lambda-dynamodb-infra
cd lambda-dynamodb-infra
npm install
cdk bootstrap
cdk deploy
```

For **local development**:

```bash
npm run db:up
npm run db:create
npm run db:seed
npm run local-prepare
npm run local-api
```

After deployment, check the CDK outputs for:

- API endpoint
- DynamoDB table name
- Cognito user pool info

---

## 🔑 Using Auto-Login in the UI

The frontend includes a **demo auto-login flow**:

1. Open the [UI on GitHub Pages](https://VictorFajardo.github.io/lambda-dynamodb-ui).
2. The app auto-logs in a demo user via Cognito and stores a valid token.
3. Start creating, updating, or deleting notes immediately.

This flow is meant to reduce friction when testing the project.

---

## 📸 Screenshots

![App UI](./docs/app-0.png)
![App UI](./docs/app-1.png)
![App UI](./docs/app-2.png)

---

## 🏆 Production-Ready Enhancements (Future Work)

For a real-world deployment, I would extend the infrastructure with:

1. Multi-Environment Deployment Pipelines

- Separate dev/staging/prod stacks, promoted via CI/CD.

2. Custom Domains & Secure HTTPS

- Route53 + ACM certificates for a branded API endpoint.

3. Ephemeral Preview Environments

- Automatic “review stacks” for each Pull Request.

4. Enterprise-Grade Monitoring & Alerts

- Centralized logs, metrics, and tracing (CloudWatch + X-Ray + OpenTelemetry).

5. Governance & Cost Optimization

- Resource tagging by environment/team/cost center.
- AWS Budgets + alarms for proactive cost control.

---

## 📄 License

MIT
