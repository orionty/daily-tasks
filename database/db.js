import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const Connection = () => {

    const MONGODB_URI = 'mongodb+srv://Orionty:dailytasks123@cluster0.eg4gliu.mongodb.net/';
    
    mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

    mongoose.connection.on('connected', () => {
        console.log('Database connected Successfully');
    })

    mongoose.connection.on('disconnected', () => {
        console.log('Database disconnected');
    })

    mongoose.connection.on('error', () => {
        console.log('Error while connecting with the database ', error.message);
    })
}

export default Connection;
