import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import path from "path";

const TABLE_NAME = process.env.TABLE_NAME || "NotesTable";
const REGION = process.env.REGION || "us-east-1";
const DYNAMO_ENDPOINT = process.env.DYNAMO_ENDPOINT; // Optional for local dev

const client = new DynamoDBClient({
    region: REGION,
    endpoint: DYNAMO_ENDPOINT, // Only used if defined
});

const docClient = DynamoDBDocumentClient.from(client);

const items = [
    { "id": "1", "title": "First note", "content": "Hello world" },
    { "id": "2", "title": "Second note", "content": "Another note" }
];

async function seed() {
    console.log(`Seeding ${items.length} items into ${TABLE_NAME}...`);

    for (const item of items) {
        try {
            await docClient.send(
                new PutCommand({
                    TableName: TABLE_NAME,
                    Item: item,
                })
            );
            console.log(`Inserted: ${item.id}`);
        } catch (err) {
            console.error(`Failed to insert ${item.id}:`, err);
        }
    }

    console.log("✅ Seeding complete");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
