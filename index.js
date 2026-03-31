const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

// 1. YOUR GAME DATABASE
const GAME_LINKS = {
    "Urban Reign Game PS2 to PS4 (FPKG)": "https://dl.surf/f/53eaa8d6",
    "Minecraft Ps4 FPKG": "https://dl.surf/f/eed4fd45",
    "Letter Quest Remastered Test Ps4 Fpkg": "https://dl.surf/f/177af12d"
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
        // This will print the WHOLE data packet so we can see the hidden names
        console.log("DEBUG DATA:", JSON.stringify(data, null, 2));

        const payment = data.payload.payment.entity;
        const customerEmail = payment.email;
        
        // --- THE MASTER SEARCH ---
        // We check Notes first, then Description, then a fallback
        let productName = "Unknown";

        if (payment.notes && Object.values(payment.notes).length > 0) {
            // This grabs the first thing written in the "Notes" section
            productName = Object.values(payment.notes)[0];
        } else if (payment.description && payment.description !== "Order Payment") {
            productName = payment.description;
        }

        console.log(`System is looking for a link for: "${productName}"`);
        const link = GAME_LINKS[productName];

        if (link) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: customerEmail,
                subject: `Your Game Download: ${productName}`,
                text: `Thanks for your purchase! Download ${productName} here: ${link}`
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`✅ SUCCESS! Email sent to ${customerEmail}`);
        } else {
            console.log(`⚠️ ERROR: No link found for "${productName}". Match this name in GAME_LINKS!`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(500).send('Internal Error');
    }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
