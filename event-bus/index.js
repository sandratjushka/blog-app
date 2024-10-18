const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];

app.post('/events', (req, res) => {
    const event = req.body;

    events.push(event);

    const services = [
        'http://localhost:3000/events',
        'http://localhost:3001/events',
        'http://localhost:3002/events', 
        'http://localhost:3003/events' 

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

app.post('/events', (req, res) => {
    res.send(events);
});

app.listen(3005, () => {
    console.log('Event Bus listening on 3005');
});
