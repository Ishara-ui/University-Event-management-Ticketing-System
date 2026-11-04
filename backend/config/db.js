
const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
    try {
        const dnsServers = process.env.MONGO_DNS_SERVERS
            ?.split(',')
            .map((server) => server.trim())
            .filter(Boolean);
        if (dnsServers?.length) dns.setServers(dnsServers);

        const connectionUri = process.env.DATABASE_MODE === 'local'
            ? process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/university_event_management'
            : process.env.MONGO_URI;
        if (!connectionUri) throw new Error('MONGO_URI is not configured in backend/.env.');
        
        const conn = await mongoose.connect(connectionUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        const servers = error.reason?.servers;
        if (servers?.size) {
            for (const [address, server] of servers) {
                if (server.error) console.error(`${address}: ${server.error.message}`);
            }
        }
        process.exit(1); 
    }
};

module.exports = connectDB;