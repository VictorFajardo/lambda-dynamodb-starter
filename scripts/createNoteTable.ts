import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { docClient } from '../lambda/utils/dynamoClient';

async function createNotesTable() {
    try {
        const result = await docClient.send(
            new CreateTableCommand({
                TableName: 'NotesTable',
                AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
                KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
                BillingMode: 'PAY_PER_REQUEST',
            })
        );
        console.log('✅ NotesTable created:', result.TableDescription?.TableName);
    } catch (error: unknown) {
        if (error instanceof Error && error?.name === 'ResourceInUseException') {
            console.log('⚠️ NotesTable already exists, skipping creation.');
        } else {
            console.error('❌ Failed to create NotesTable:', error);
            process.exit(1);
        }
    }
}

// Run it if this script is executed directly
if (require.main === module) {
    createNotesTable();
}

export default createNotesTable;
