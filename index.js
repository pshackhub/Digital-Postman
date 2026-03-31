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
        // This is crucial: it shows us the secret folders in the Render logs
        console.log("DEBUG: Full Data Received ->", JSON.stringify(data, null, 2));

        const payload = data.payload.payment.entity;
        const customerEmail = payload.email;
        
        // --- THE MASTER SEARCH ---
        // We check 'notes', then 'description', then 'vpa' just in case.
        let productName = "Unknown";
        
        if (payload.notes && payload.notes.product_name) {
            productName = payload.notes.product_name;
        } else if (payload.notes && Object.values(payload.notes)[0]) {
            productName = Object.values(payload.notes)[0]; // Takes the first note found
        } else if (payload.description && payload.description !== "Order Payment") {
            productName = payload.description;
        }

        console.log(`Searching for link for: "${productName}"`);
        const link = GAME_LINKS[productName];

        if (link) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: customerEmail,
                subject: `Download Link: ${productName}`,
                text: `Thanks for your purchase! Download ${productName} here: ${link}`
            };
            await transporter.sendMail(mailOptions);
            console.log(`✅ Success! Sent to ${customerEmail}`);
        } else {
            // This message tells us EXACTLY what to fix in GAME_LINKS
            console.log(`⚠️ ERROR: No link found for "${productName}". Update your GAME_LINKS to match this exactly.`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(500).send('Internal Error');
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
