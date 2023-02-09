import pg from 'pg';

const {Client} = pg;

const connectionData = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const client = new Client(connectionData);

client.connect();

export default client;
