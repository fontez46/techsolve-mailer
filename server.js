/**
 * TechSolve Pro — Mailer API
 * Hosted on Render.com | Uses Gmail SMTP via Nodemailer
 */

require('dotenv').config();
const express  = require('express');
const nodemailer = require('nodemailer');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS — allow only your InfinityFree domain ──────────────────────────────
const allowedOrigins = [
    'https://techsolvepro.kesug.com',
    'http://techsolvepro.kesug.com',
    'http://localhost',                 // local dev / XAMPP
    'http://127.0.0.1'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (e.g. Postman, mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS blocked: ' + origin));
        }
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Gmail SMTP transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS   // 16-char App Password (no spaces)
    }
});

// Verify connection on startup
transporter.verify(function (err) {
    if (err) {
        console.error('❌ Gmail SMTP connection failed:', err.message);
    } else {
        console.log('✅ Gmail SMTP ready — server listening on port', PORT);
    }
});

// ── Service label map ────────────────────────────────────────────────────────
const SERVICE_LABELS = {
    maintenance: 'IT Maintenance & Support',
    design:      'Website Design',
    development: 'Web Development',
    system:      'System Administration',
    security:    'Cybersecurity',
    consulting:  'Software Consulting',
    other:       'Other'
};

function serviceLabel(key) {
    return SERVICE_LABELS[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Not specified');
}

// ── Helpers: HTML email templates ───────────────────────────────────────────
function adminEmailHTML(data) {
    const { name, email, phone, company, service, urgency, message, refId } = data;
    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#e63946,#f5a623);padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;color:#fff;font-size:1.4rem;">🔔 New Contact Request</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">Reference #${refId}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111827;padding:32px;border-radius:0 0 12px 12px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Name',    name)}
            ${row('Email',   `<a href="mailto:${email}" style="color:#e63946;">${email}</a>`, true)}
            ${row('Phone',   phone   || 'Not provided')}
            ${row('Company', company || 'Not provided', true)}
            ${row('Service', serviceLabel(service))}
            ${row('Urgency', urgency || 'Medium', true)}
          </table>

          <div style="margin-top:20px;padding:20px;background:#1e293b;border-radius:8px;border-left:4px solid #e63946;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;">Message</p>
            <p style="margin:0;color:#e2e8f0;line-height:1.7;">${escHtml(message).replace(/\n/g,'<br>')}</p>
          </div>

          <p style="margin-top:24px;color:#64748b;font-size:0.8rem;text-align:center;">
            Sent via TechSolve Pro contact form &bull; ${new Date().toUTCString()}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function clientEmailHTML(data) {
    const { name, service, message, refId } = data;
    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#e63946,#f5a623);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:1.5rem;">TechSolve Pro</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">Professional IT Solutions</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#111827;padding:36px 32px;border-radius:0 0 12px 12px;">
          <h2 style="margin:0 0 16px;color:#e2e8f0;font-size:1.3rem;">Thank you, ${escHtml(name)}! 🎉</h2>
          <p style="margin:0 0 16px;color:#94a3b8;line-height:1.8;">
            We have received your enquiry regarding
            <strong style="color:#f5a623;">${serviceLabel(service)}</strong>
            and our team is already reviewing it.
          </p>
          <p style="margin:0 0 24px;color:#94a3b8;line-height:1.8;">
            We will get back to you <strong style="color:#e2e8f0;">within 24 hours</strong>
            with a detailed response.
          </p>

          <!-- Message recap -->
          <div style="padding:20px;background:#1e293b;border-radius:8px;border-left:4px solid #f5a623;margin-bottom:24px;">
            <p style="margin:0 0 8px;color:#64748b;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;">Your message</p>
            <p style="margin:0;color:#e2e8f0;line-height:1.7;font-style:italic;">${escHtml(message).replace(/\n/g,'<br>')}</p>
          </div>

          <!-- Reference -->
          <div style="text-align:center;padding:16px;background:rgba(230,57,70,0.08);border-radius:8px;margin-bottom:24px;">
            <p style="margin:0;color:#94a3b8;font-size:0.85rem;">Reference Number</p>
            <p style="margin:4px 0 0;color:#e63946;font-size:1.4rem;font-weight:700;">#${refId}</p>
          </div>

          <!-- Contact links -->
          <p style="color:#64748b;font-size:0.85rem;text-align:center;margin-bottom:4px;">Need immediate help?</p>
          <p style="text-align:center;margin:0 0 24px;">
            <a href="https://wa.me/254704003130" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#e63946,#f5a623);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:0.9rem;">
              💬 WhatsApp Us
            </a>
          </p>

          <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 20px;">
          <p style="margin:0;color:#64748b;font-size:0.8rem;text-align:center;">
            © ${new Date().getFullYear()} TechSolve Pro &bull; Kahawa, Nairobi, Kenya &bull;
            <a href="tel:+254704003130" style="color:#e63946;text-decoration:none;">+254 70 400 3130</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Table row helper
function row(label, value, shaded = false) {
    const bg = shaded ? '#1e293b' : '#111827';
    return `<tr style="background:${bg};">
      <td style="padding:12px 16px;color:#64748b;font-size:0.85rem;width:120px;font-weight:600;">${label}</td>
      <td style="padding:12px 16px;color:#e2e8f0;font-size:0.9rem;">${value}</td>
    </tr>`;
}

// HTML entity escaping
function escHtml(str) {
    return String(str || '')
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;');
}

// Generate a short reference ID
function genRefId() {
    return 'TSP-' + Date.now().toString(36).toUpperCase();
}

// ── Route: Health check ──────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'TechSolve Pro Mailer API is running ✅' });
});

// ── Route: Send contact email ────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, company, service, urgency, message } = req.body;

        // ── Server-side validation ──
        const errors = {};
        if (!name    || !name.trim())    errors.name    = 'Name is required';
        if (!email   || !email.trim())   errors.email   = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
        if (!service || !service.trim()) errors.service = 'Please select a service';
        if (!message || !message.trim()) errors.message = 'Message is required';

        if (Object.keys(errors).length > 0) {
            return res.status(422).json({ success: false, message: 'Please correct the errors below', errors });
        }

        const refId = genRefId();
        const emailData = { name: name.trim(), email: email.trim(), phone: (phone||'').trim(),
                            company: (company||'').trim(), service, urgency: urgency || 'medium',
                            message: message.trim(), refId };

        // ── 1. Admin notification ──
        await transporter.sendMail({
            from:    `"TechSolve Pro" <${process.env.GMAIL_USER}>`,
            to:      process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
            replyTo: email,
            subject: `New Contact: ${serviceLabel(service)} — ${name.trim()}`,
            html:    adminEmailHTML(emailData)
        });

        // ── 2. Client confirmation ──
        await transporter.sendMail({
            from:    `"TechSolve Pro" <${process.env.GMAIL_USER}>`,
            to:      email,
            subject: `We received your enquiry — TechSolve Pro (Ref #${refId})`,
            html:    clientEmailHTML(emailData)
        });

        return res.json({
            success: true,
            message: 'Your message has been sent successfully!',
            refId
        });

    } catch (err) {
        console.error('Mailer error:', err);
        return res.status(500).json({
            success: false,
            message: 'Email sending failed. Please try again or contact us directly.'
        });
    }
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Mailer API running on port ${PORT}`));
