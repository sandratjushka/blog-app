const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
    switch (type) {
        case 'PostCreated':
            const { id, title } = data;
            posts[id] = { id, title, comments: [] };
            break;

        case 'CommentCreated':
            const { id: commentId, content, postId, status } = data;
            const post = posts[postId];
            if (post) {
                post.comments.push({ id: commentId, content, status });
            } else {
                console.warn(`Post with ID ${postId} not found for CommentCreated.`);
            }
            break;

        case 'CommentUpdated':
            const { id: updatedId, content: updatedContent, postId: updatedPostId, status: updatedStatus } = data;
            const updatedPost = posts[updatedPostId];
            if (updatedPost) {
                const comment = updatedPost.comments.find(comment => comment.id === updatedId);
                if (comment) {
                    comment.status = updatedStatus;
                    comment.content = updatedContent;
                } else {
                    console.warn(`Comment with ID ${updatedId} not found.`);
                }
            } else {
                console.warn(`Post with ID ${updatedPostId} not found for CommentUpdated.`);
            }
            break;

        default:
            console.warn(`Unknown event type: ${type}`);
            break;
    }
};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    handleEvent(type, data);
    res.send({});
});

app.listen(3002, async () => {
    console.log('Listening on 3002');
    try {
        const response = await axios.get('http://localhost:3005/events');
        const events = response.data;

        for (let event of events) {
            console.log('Processing event:', event.type);
            handleEvent(event.type, event.data);
        }
    } catch (error) {
        console.error('Error fetching events:', error.message);
    }
});
