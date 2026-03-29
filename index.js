const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

// Setup your email "Postman" (Example using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'your-email@gmail.com', pass: 'your-app-password' }
});

app.post('/webhook', (req, res) => {
    // Razorpay sends the customer email in the payment entity
    const customerEmail = req.body.payload.payment.entity.email;
    const orderId = req.body.payload.payment.entity.order_id;

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: customerEmail,
      subject: `Your Game Download: Order ${orderId}`,
      text: `Thank you for your purchase! Download your game here: https://dl.surf/file/eed4fd45
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).send(error.toString());
      res.status(200).send('Email Sent!');
    });
});

app.listen(process.env.PORT || 3000);
