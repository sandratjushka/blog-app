const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/events', (req, res) => {
    const event = req.body;

    const services = [
        'http://localhost:3000/events',
        'http://localhost:3001/events',
        'http://localhost:3002/events' 
    ];

    services.forEach(async (serviceUrl) => {
        try {
            await axios.post(serviceUrl, event);
            console.log(`Event sent to ${serviceUrl}`);
        } catch (error) {
            console.error(`Error sending event to ${serviceUrl}:`, error.message);
        }
    });

    res.send({ status: 'OK' });
});

app.listen(3005, () => {
    console.log('Event Bus listening on 3005');
});
