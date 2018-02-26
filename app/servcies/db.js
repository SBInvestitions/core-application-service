import mongoose from 'mongoose';
import config from '../../config';
import log from '../utils/log';

const MONGO_URL = process.env.MONGO_URL || config.database;

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL);
var db = mongoose.connection;

db.on('connected', function () {
    log.info('DB connected to ' + MONGO_URL);
});

db.on('error',function (err) {
     log.error('DB connection error: ' + err.message);
});

db.on('disconnected', function () {
    log.info('DB disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        log.error('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});