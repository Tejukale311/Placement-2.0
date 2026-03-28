const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // For development, if SMTP credentials are not configured, log to console
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || 
      process.env.SMTP_USER === 'your-email@gmail.com' || 
      process.env.SMTP_PASS === 'your-app-password') {
    console.log('=== EMAIL (Development Mode) ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('OTP:', options.otp || 'N/A');
    console.log('==============================');
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Placement Portal'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    // Fallback to console logging
    console.log('=== EMAIL (Fallback to Console) ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('OTP:', options.otp || 'N/A');
    console.log('===================================');
    return false;
  }
};

// Email templates
const emailTemplates = {
  otpVerification: (name, otp) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 20px; }
          .logo h1 { color: #6366F1; margin: 0; }
          .otp-box { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Placement Portal</h1>
            </div>
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with Placement Preparation Portal. Please verify your email address using the OTP below:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Placement Preparation Portal. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },
  
  loginOtp: (name, otp) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login OTP</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 20px; }
          .logo h1 { color: #6366F1; margin: 0; }
          .otp-box { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Placement Portal</h1>
            </div>
            <h2>Welcome back, ${name}!</h2>
            <p>Your login OTP is:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Placement Preparation Portal. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },
  
  welcomeEmail: (name) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 20px; }
          .logo h1 { color: #6366F1; margin: 0; }
          .features { list-style: none; padding: 0; }
          .features li { padding: 10px 0; border-bottom: 1px solid #eee; }
          .features li:last-child { border-bottom: none; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Placement Portal</h1>
            </div>
            <h2>Welcome to Placement Preparation Portal, ${name}!</h2>
            <p>Your account has been successfully verified. Here's what you can do:</p>
            <ul class="features">
              <li>✓ Practice aptitude questions across multiple categories</li>
              <li>✓ Solve coding problems with our integrated editor</li>
              <li>✓ Prepare for company-specific interviews</li>
              <li>✓ Take mock tests to evaluate your progress</li>
              <li>✓ Compete on the leaderboard</li>
              <li>✓ Build your professional resume</li>
            </ul>
            <p>Start your placement preparation journey today!</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Placement Preparation Portal. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },
  
  passwordResetOtp: (name, otp) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .logo { text-align: center; margin-bottom: 20px; }
          .logo h1 { color: #6366F1; margin: 0; }
          .otp-box { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <h1>Placement Portal</h1>
            </div>
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Use the OTP below to reset your password:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP will expire in 10 minutes.</p>
            <div class="warning">
              <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Placement Preparation Portal. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

module.exports = { sendEmail, emailTemplates };

