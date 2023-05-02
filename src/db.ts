import mongoose from 'mongoose';
import { MONGODB_URI } from './constants';

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to database');
    } catch (error) {
        console.error('Failed to connect to database: ', error);
        process.exit(1);
    }
};

export const db = mongoose.connection;
