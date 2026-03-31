const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

// --- STEP A: YOUR GAME LIBRARY ---
// Make sure these names match your SmartBiz product names EXACTLY
const GAME_LINKS = {
    "Minecraft Test Ps4 FPKG": "https://dl.surf/f/eed4fd45",
    "Letter Quest Remastered Test Ps4 Fpkg": "https://dl.surf/f/177af12d",
    "Urban Reign Game PS2 to PS4 (FPKG)": "https://dl.surf/f/53eaa8d6"
};

// --- STEP B: THE EMAIL SENDER ---
async function sendAutomatedEmail(customerEmail, productName, downloadLink) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Uses the Key you just made in Render
            pass: process.env.EMAIL_PASS  // Uses the Key you just made in Render
        }
    });

    const mailOptions = {
        from: '"PsHackHub Support" <pshackhub@gmail.com>',
        to: customerEmail,
        subject: `🎮 Your Download: ${productName} is ready!`,
        text: `Hi!\n\nThank you for your purchase of ${productName}!\n\nDownload Link: ${downloadLink}\n\nImportant: This link expires in 24 hours. If you need help, reply to this email.\n\nHappy Gaming,\nThe PsHackHub Team`
    };

    return transporter.sendMail(mailOptions);
}

// --- STEP C: THE WEBHOOK ---
app.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        
        // This is the new line for debugging
        console.log("Full Data from Razorpay:", JSON.stringify(data, null, 2));

        const customerEmail = data.payload.payment.entity.email;
        const productName = data.payload.payment.entity.description; 

        const link = GAME_LINKS[productName];

        if (link) {
            // Added .catch here to see why it fails
            await sendAutomatedEmail(customerEmail, productName, link).catch(err => console.log("Email Error Details:", err));
            console.log(`✅ Successfully sent ${productName} to ${customerEmail}`);
        } else {
            console.log(`⚠️ Product "${productName}" not found in GAME_LINKS library.`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error("❌ Webhook Error:", error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
