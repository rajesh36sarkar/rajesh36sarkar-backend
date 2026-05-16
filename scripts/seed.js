const nodemailer = require('nodemailer');
require('dotenv').config();

// 1. Instantiate the transporter pool exactly once outside the execution thread scope
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true, 
  maxConnections: 3,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

const sendContactEmail = async (contactData) => {
  const { name, email, subject, message } = contactData;

  // Pre-flight safeguard checks block dead transport threads
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Nodemailer Error: Missing EMAIL_USER or EMAIL_PASS environment variables.');
    return;
  }

  // Escape multiline text formats safely to protect HTML block presentation flow
  const formattedMessage = typeof message === 'string' ? message.replace(/\n/g, '<br/>') : '';

  // Email payload designated for you (admin notification)
  const adminMailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email, 
    subject: `📩 New Portfolio Contact: ${subject || 'No Subject'}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h3 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 8px;">New message from your portfolio</h3>
        <p><strong>Name:</strong> ${name || 'Anonymous User'}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject || 'No Subject Set'}</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #764ba2; margin: 15px 0;">
          <strong>Message:</strong><br/>
          ${formattedMessage}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
        <p style="font-size: 0.9rem; color: #666;">Reply directly to this email or reach out to: <a href="mailto:${email}">${email}</a></p>
      </div>
    `,
  };

  // Automated out-of-office response designated for your sender
  const autoReplyOptions = {
    from: `"Rajesh Sarkar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🤖 Re: Thank you for getting in touch!`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h3 style="color: #764ba2;">Hi ${name || 'there'},</h3>
        <p>Thank you for reaching out! I've successfully received your message regarding "<strong>${subject || 'General Inquiry'}</strong>".</p>
        <p>I value your time and am currently reviewing your details. I will get back to you within 24 hours (usually much faster!).</p>
        <br />
        <p style="margin-bottom: 0;">Best regards,</p>
        <strong style="color: #667eea;">Rajesh Sarkar</strong><br />
        <span style="font-size: 0.9rem; color: #666;">Full Stack Developer</span>
      </div>
    `,
  };

  try {
    // 2. Fire BOTH transmissions concurrently in a single non-blocking event loop execution
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(autoReplyOptions)
    ]);
    
    console.log(`✉️ Email dual-transmission successful to [Admin] and [User: ${email}]`);
  } catch (error) {
    console.error('❌ Nodemailer SMTP Core Exception:', error);
    throw error; 
  }
};

module.exports = sendContactEmail;