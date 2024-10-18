const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];
    comments.push({ id: commentId, content, status: 'pending' });
    commentsByPostId[req.params.id] = comments;

    try {
        await axios.post('http://localhost:3005/events', {
            type: 'CommentCreated',
            data: {
                id: commentId,
                content,
                postId: req.params.id,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error posting event:', error.message);
        return res.status(500).send({ error: 'Failed to post event.' });
    }

    res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
    console.log('Event Received', req.body.type);
    const { type, data } = req.body;

    if (type === 'CommentModerated') {
        const { postId, id, status } = data;
        const comments = commentsByPostId[postId];

        if (comments) {
            const comment = comments.find(comment => comment.id === id);
            if (comment) {
                comment.status = status;

                try {
                    await axios.post('http://localhost:3005/events', {
                        type: 'CommentUpdated',
                        data: {
                            id,
                            status,
                            postId,
                            content: comment.content
                        }
                    });
                } catch (error) {
                    console.error('Error posting updated comment event:', error.message);
                }
            } else {
                console.warn(`Comment with ID ${id} not found for post ${postId}.`);
            }
        } else {
            console.warn(`No comments found for post ${postId}.`);
        }
    }

    res.send({});
});

app.listen(3001, () => {
    console.log('Listening on 3001');
});
