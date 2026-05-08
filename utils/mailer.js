const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendContactEmail = async (contactData) => {
  const { name, email, subject, message } = contactData;
  
  // Email to you (admin)
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `New Portfolio Contact: ${subject}`,
    html: `
      <h3>New message from your portfolio</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      <hr/>
      <p>Reply directly to: <a href="mailto:${email}">${email}</a></p>
    `,
  };
  
  // Auto-reply to the person who contacted you
  const autoReplyOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Thank you for contacting me`,
    html: `
      <h3>Hi ${name},</h3>
      <p>Thank you for reaching out. I have received your message and will get back to you within 24 hours.</p>
      <p>Best regards,<br/>Rajesh</p>
    `,
  };
  
  await transporter.sendMail(adminMailOptions);
  await transporter.sendMail(autoReplyOptions);
};

module.exports = sendContactEmail;