const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

// Route to get all posts
app.get('/posts', (req, res) => {
    console.log('GET /posts endpoint called');
    res.send(posts);
});

// Route to create a post
app.post('/posts', async (req, res) => {
    console.log('POST /posts endpoint called');
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[id] = { id, title };

    try {
        await axios.post('http://event-bus-srv:3005/events', {
            type: 'PostCreated',
            data: { id, title }
        });
    } catch (error) {
        console.error('Error posting event:', error.message);
    }

    res.status(201).send(posts[id]);
});

// Route to receive events from the event bus
app.post('/events', (req, res) => {
    console.log('Event received in posts service:', req.body.type);

    const { type, data } = req.body;

    if (type === 'PostCreated') {
        const { id, title } = data;
        posts[id] = { id, title };
    }

    res.send({});
});

app.listen(3000, () => {
    console.log('v20');
    console.log('Posts service listening on 3000');
});
