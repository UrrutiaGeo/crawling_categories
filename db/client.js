import * as dotenv from 'dotenv'
import pg from 'pg';
dotenv.config();

const {Client} = pg;

const connectionData = {
    user: `${process.env.DB_USER}`,
    host: `${process.env.DB_HOST}`,
    database: `${process.env.DB_NAME}`,
    password: `${process.env.DB_PASSWORD}`,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: !(process.env.DB_SSL_MODE === false || process.env.DB_SSL_MODE === 'false'),
    }
};

const client = new Client(connectionData);

client.connect();

export default client;
