const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

// 1. YOUR GAME DATABASE
const GAME_LINKS = {
    "Urban Reign": "https://your-link-here.com",
    "Minecraft": "https://your-link-here.com",
    "Test Product": "https://google.com"
};

// 2. EMAIL CONFIGURATION (Updated for Render Stability)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000 // Give it 10 seconds to connect
});

// 3. THE WEBHOOK LOGIC
app.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        console.log("Full Data received:", JSON.stringify(data));

        const customerEmail = data.payload.payment.entity.email;
        
        // Try to find the name in 'notes' first, then 'description'
        let productName = "Unknown";
        if (data.payload.payment.entity.notes && data.payload.payment.entity.notes.product_name) {
            productName = data.payload.payment.entity.notes.product_name;
        } else {
            productName = data.payload.payment.entity.description;
        }

        const link = GAME_LINKS[productName];

        if (link && link !== "Order Payment") {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: customerEmail,
                subject: `Your Download: ${productName}`,
                text: `Thank you for your purchase! Here is your link for ${productName}: ${link}`
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ Success! Sent ${productName} to ${customerEmail}`);
        } else {
            console.log(`⚠️ Match Failed. SmartBiz sent: "${productName}". Check your GAME_LINKS keys!`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).send('Internal Error');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
