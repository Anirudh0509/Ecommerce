'use strict'
import express from 'express';
import cluster from 'cluster';
import mongoose from 'mongoose';
const bodyParser  = require("body-parser");

import {inventoryUploadScript} from './src/services/inventoryService';

const numCPUs = require('os').cpus().length;
const port = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const accountRoutes = require('./src/routes/accountRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

app.use('/account', accountRoutes);
app.use('/order', orderRoutes);

mongoose.connect("mongodb://localhost/ecommerce", { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const serverStart = () => {
    let noOfProcesses = 1 || numCPUs;
    if (cluster.isMaster) {

        // Create a worker for each CPU
        for (let i = 0; i < noOfProcesses; i++) cluster.fork();

        //Listen for dying workers, Replace the dead worker
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died, code = ${code}, signal = ${signal}!`);
            cluster.fork();
        });

    } else {
        app.listen(port, () => {
            console.log(`Server starting on port ${port}`);
        });
        console.log(`Worker running`, cluster.worker.id);
    }
    /**
     * Running a script to Upload the inventory sample data!
     * */
    inventoryUploadScript();
};

serverStart();