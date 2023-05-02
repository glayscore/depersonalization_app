import * as dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase } from './db';
import { NUM_CUSTOMERS, DELAY_THRESHOLD } from './constants';
import { Customer } from './schemas/customer.schema';
import { faker } from '@faker-js/faker';

const generateCustomers = async (numberOfCustomers: number) => {
    try {
        const customers = [];
        for (let i = 0; i < numberOfCustomers; i++) {
            const customer = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: faker.internet.email(),
                address: {
                    line1: faker.address.streetAddress(),
                    line2: faker.address.secondaryAddress(),
                    postcode: faker.address.zipCode('#####'),
                    city: faker.address.city(),
                    state: faker.address.state(),
                    country: faker.address.country(),
                },
            };
            customers.push(customer);
        }
        await Customer.insertMany(customers);
    } catch (error) {
        if (error.code === 11000) {
            console.log('Duplicate records:', error.insertedDocs);
        } else {
            throw error;
        }
    }
};

(async () => {
    try {
        await connectToDatabase();
        console.log('Application started');
        while (true) {
            const numCustomers =
                Math.floor(Math.random() * (NUM_CUSTOMERS - 1)) + 1;
            await generateCustomers(numCustomers);
            console.log(`Generated ${numCustomers} customers`);
            await new Promise((resolve) =>
                setTimeout(resolve, DELAY_THRESHOLD)
            );
        }
    } catch (error) {
        console.error('Application failed to start:', error);
        process.exit(1);
    }
})();
