import { Schema, Model, model } from 'mongoose';
import { ICustomer } from '../interfaces/customer.interface';

export const CustomerSchema: Schema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        address: {
            line1: { type: String, required: true },
            line2: String,
            postcode: { type: String, required: true },
        },
    },
    { timestamps: true }
);

export const Customer: Model<ICustomer> = model<ICustomer>(
    'Customer',
    CustomerSchema
);
export const CustomerAnonymised: Model<ICustomer> = model<ICustomer>(
    'Customers_Anonymised',
    CustomerSchema
);
