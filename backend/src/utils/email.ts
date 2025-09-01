import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiration = (): Date => {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 10); // 10 minutes from now
  return expiration;
};

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    console.log('📧 Sending email via Resend to:', options.to);
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'HD Notes <noreply@hdnotes.dev>',
      to: [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully via Resend, ID:', data?.id);
  } catch (error) {
    console.error('🚨 Email sending failed:', error);
    
    // Development fallback - log the OTP to console
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
      console.log('🔧 DEV MODE: Email failed, but continuing...');
      if (options.html.includes('OTP')) {
        const otpMatch = options.html.match(/>\s*(\d{6})\s*</); 
        if (otpMatch) {
          console.log('🔑 DEV OTP for', options.to, ':', otpMatch[1]);
        }
      }
    }
    
    throw new Error('Failed to send email');
  }
};

export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p style="font-size: 16px; color: #666; text-align: center;">
          Thank you for signing up! Please use the following OTP to verify your email address:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #007bff; color: white; padding: 15px 25px; font-size: 24px; letter-spacing: 3px; border-radius: 5px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">
          This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          Note Taking App - Your personal note management solution
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - OTP Code',
    html
  });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to Note Taking App!</h2>
        <p style="font-size: 16px; color: #666;">
          Hi ${name},
        </p>
        <p style="font-size: 16px; color: #666;">
          Welcome to your personal note-taking application! Your account has been successfully verified and you can now:
        </p>
        <ul style="font-size: 14px; color: #666;">
          <li>Create and organize your notes</li>
          <li>Pin important notes</li>
          <li>Tag and categorize your content</li>
          <li>Access your notes from anywhere</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Start Taking Notes
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          Note Taking App - Your personal note management solution
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Note Taking App!',
    html
  });
};
