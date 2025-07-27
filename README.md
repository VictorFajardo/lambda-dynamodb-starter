# Lambda + DynamoDB CDK Starter (TypeScript)

A serverless starter template using AWS CDK, Lambda, API Gateway, and DynamoDB — written in TypeScript.

[![codecov](https://codecov.io/gh/VictorFajardo/nestkit-backend/branch/main/graph/badge.svg)](https://codecov.io/gh/VictorFajardo/nestkit-backend)

## 🚀 Features

- AWS CDK infrastructure (TypeScript)
- Lambda functions written in TypeScript
- REST API to create notes
- DynamoDB table integration

## 🧱 Stack Components

- **API Gateway** – Exposes REST endpoint `/notes`
- **Lambda Function** – `createNote`
- **DynamoDB Table** – Stores notes with `id` as partition key

## 🛠 Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Bootstrap AWS CDK
cdk bootstrap

# Deploy stack
npm run deploy
```

## 📡 API Usage

### POST /notes

Creates a new note.

#### Request Body

```json
{
  "content": "My first note"
}
```

#### Response

```json
{
  "message": "Note created",
  "note": {
    "id": "<timestamp>",
    "content": "My first note",
    "createdAt": "<ISO timestamp>"
  }
}
```

## 🧼 Cleanup

```bash
npm run destroy
```

## 📘 Notes

- Extend `app-stack.ts` to add more endpoints (GET, PUT, DELETE)
- Add validation and logging
- Use IAM roles and CDK best practices for production
- Enable tests using `jest` or `vitest`
