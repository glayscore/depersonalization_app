import dotenv from 'dotenv';
dotenv.config();

import { ICustomer } from './interfaces/customer.interface';
import { anonymize } from './utils/anonymize';
import { Customer, CustomerAnonymised } from './schemas/customer.schema';
import { connectToDatabase } from './db';
import { BATCH_SIZE, BATCH_THRESHOLD } from './constants';

let batch: ICustomer[] = [];

const insertAnonymisedBatch = async () => {
    if (batch.length > 0) {
        try {
            await CustomerAnonymised.insertMany(batch);
        } catch (error) {
            if (error.code !== 11000) {
                console.error('Error inserting batch:', error);
            }
        }
        batch = [];
    }
};

setInterval(insertAnonymisedBatch, BATCH_THRESHOLD);

const anonymizeAndSaveCustomer = async (customer: ICustomer) => {
    const anonymisedCustomer = new CustomerAnonymised({
        firstName: anonymize(customer.firstName),
        lastName: anonymize(customer.lastName),
        email: `${anonymize(customer.email.split('@')[0])}@${
            customer.email.split('@')[1]
        }`,
        address: {
            line1: anonymize(customer.address.line1),
            line2: customer.address.line2
                ? anonymize(customer.address.line2)
                : undefined,
            postcode: anonymize(customer.address.postcode),
        },
    });

    batch.push(anonymisedCustomer);

    if (batch.length === BATCH_SIZE) {
        await insertAnonymisedBatch();
    }
};

const main = async () => {
    await connectToDatabase();

    if (process.argv.includes('--full-reindex')) {
        try {
            console.log('Starting full reindex');
            const customers = await Customer.find();

            for (const customer of customers) {
                await anonymizeAndSaveCustomer(customer);
            }

            await insertAnonymisedBatch();
            console.log(
                `Full reindex completed, processed number of documents: ${customers.length}`
            );
            process.exit(0);
        } catch (error) {
            console.error('Error during full reindex:', error);
            process.exit(1);
        }
    } else {
        try {
            console.log('Starting real-time sync');
            Customer.watch().on('change', async (data) => {
                if (
                    data.operationType === 'insert' ||
                    data.operationType === 'update'
                ) {
                    const customer = await Customer.findById(
                        data.documentKey._id
                    );

                    if (customer) {
                        await anonymizeAndSaveCustomer(customer);
                        console.log(
                            `Document ${data.documentKey._id} was processed`
                        );
                    }
                }
            });
        } catch (error) {
            console.error('Error during real-time sync:', error);
        }
    }
};

main().catch(console.error);
