const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];

// Endpoint to receive events
app.post('/events', async (req, res) => {
    const event = req.body;
    events.push(event);

    const services = [
        'http://posts-clusterip-srv:3000/events', // Posts service
        'http://comments-srv:4001/events', // Comments service
        'http://query-srv:4002/events', // Query service
        'http://moderation-srv:4003/events'  // Moderation service
    ];

    // Send the event to all services
    for (const serviceUrl of services) {
        try {
            await axios.post(serviceUrl, event);
            console.log(`Event sent to ${serviceUrl}`);
        } catch (error) {
            console.error(`Error sending event to ${serviceUrl}:`, error.message);
        }
    }

    res.send({ status: 'OK' });
});

// Endpoint to get all events
app.get('/events', (req, res) => {
    res.send(events);
});

app.listen(3005, () => {
    console.log('Event Bus listening on port 3005');
});
