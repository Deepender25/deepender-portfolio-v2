import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
app.set('trust proxy', 1); // important for rate-limiting when behind proxies like Vercel/Render
app.use(express.json());

// Apply rate limiting to contact endpoint (max 3 emails per 15 mins per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per `window`
  message: { error: 'Too many requests sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/contact', contactLimiter);

// POST /api/contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_EMAIL,       // Gmail account you send FROM
      pass: process.env.SENDER_APP_PASSWORD, // 16-char Gmail App Password
    },
  });

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.SENDER_EMAIL}>`,
    to: process.env.RECEIVER_EMAIL, // your personal email where you receive messages
    replyTo: email,
    subject: `New Message from ${name} — Portfolio`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 12px;">
          New Contact Form Submission
        </h2>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <tr>
            <td style="padding:8px 0; color:#666; font-weight:bold; width:100px;">Name:</td>
            <td style="padding:8px 0; color:#1a1a1a;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#666; font-weight:bold;">Email:</td>
            <td style="padding:8px 0; color:#1a1a1a;">
              <a href="mailto:${email}" style="color:#0070f3;">${email}</a>
            </td>
          </tr>
        </table>
        <h3 style="margin-top:24px; color:#1a1a1a;">Message:</h3>
        <div style="background:#f5f5f5; border-radius:8px; padding:16px; color:#333; white-space:pre-wrap; line-height:1.6;">
          ${message}
        </div>
        <p style="margin-top:24px; color:#999; font-size:12px;">
          Sent via your portfolio contact form.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Nodemailer error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.SERVER_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`);
  });
}

export default app;
