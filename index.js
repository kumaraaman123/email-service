const express = require('express');
const bodyParser = require('body-parser');
const EmailService = require('./EmailService');

const app = express();
const port = 3000;

const emailService = new EmailService();

app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
    const { id, to, subject, body } = req.body;

    if (!id || !to || !subject || !body) {
        return res.status(400).send('Missing required fields');
    }

    const email = { id, to, subject, body };

    try {
        const result = await emailService.sendEmail(email);
        res.status(200).json(result);
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).send(`Failed to send email: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Email service running on http://localhost:${port}`);
});
