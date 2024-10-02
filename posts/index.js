const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');

console.log('Starting the server...'); // Debugging line

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    console.log('GET /posts endpoint called'); // Debugging line
    res.send(posts);
});

app.post('/posts', (req, res) => {
    console.log('POST /posts endpoint called'); // Debugging line
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[id] = {
        id, title
    };

    res.status(201).send(posts[id]);
});

app.listen(3000, () => {
    console.log('Listening on 3000'); // Debugging line
});
