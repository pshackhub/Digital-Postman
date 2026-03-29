const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

// 1. Setup your email "Postman"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pshackhub@gmail.com', // Your Gmail
    pass: 'pyiw dpsw phup tjyz'    // Your 16-character App Password
  }
});

// 2. The Webhook Listener
app.post('/webhook', (req, res) => {
    console.log("Payment received!");

    // Razorpay sends customer details in the request body
    const payment = req.body.payload.payment.entity;
    const customerEmail = payment.email;

    const mailOptions = {
      from: 'pshackhub@gmail.com',
      to: customerEmail,
      subject: 'Your Game Download Link!',
      text: 'Thank you for your purchase! Here is your link: https://dl.surf/file/eed4fd45'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send("Error sending email");
      }
      console.log('Email sent: ' + info.response);
      res.status(200).send('OK');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Postman is listening on port ${PORT}`));
