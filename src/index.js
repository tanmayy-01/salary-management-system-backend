const express = require('express');
const { ServerConfig, Logger } = require('./config');
const apiroutes = require('./routes');
const serverConfig = require('./config/server-config');
const { initSalaryCron } = require('./cron/salary-cron');

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiroutes);

app.listen(serverConfig.PORT, () => {
    console.log(`Successfully started the server on port : ${serverConfig.PORT}`);
    // Start automated background salary calculation cron job
    initSalaryCron();
});