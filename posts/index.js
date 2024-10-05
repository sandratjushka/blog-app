const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

console.log('Starting the server...');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    console.log('GET /posts endpoint called');
    res.send(posts);
});

app.post('/posts', async (req, res) => {
    console.log('POST /posts endpoint called');
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[id] = {
        id, title
    };

    await axios.post('http://localhost:3005/events', {
        type: 'PostCreated',
        data: {
            id, title
        }
    });

    res.status(201).send(posts[id]);
});

app.listen(3000, () => {
    console.log('Listening on 3000');
});
