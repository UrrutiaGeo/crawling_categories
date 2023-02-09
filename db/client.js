import pg from 'pg';

const {Client} = pg;

const connectionData = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'dswapper',
    password: 'secret',
    port: 5432,
};

const client = new Client(connectionData);

client.connect();

export default client;
