/**
 * TechSolve Pro — Mailer API v2.0 (Brevo)
 * Hosted on Render.com | Uses Brevo HTTPS API — no SMTP, never blocked
 * Free tier: 300 emails/day
 * Build: 2026-05-05
 */

require('dotenv').config();
const express = require('express');
const axios   = require('axios');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Brevo API base ────────────────────────────────────────────────────────────
const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

// ── CORS ──────────────────────────────────────────────────────────────────────
// Public contact form API — no credentials, safe to allow all origins
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Brevo send helper ─────────────────────────────────────────────────────────
async function sendBrevoEmail({ to, subject, html, replyTo }) {
    const fromName  = process.env.FROM_NAME  || 'TechSolve Pro';
    const fromEmail = process.env.FROM_EMAIL || process.env.BREVO_SENDER_EMAIL;

    const payload = {
        sender:      { name: fromName, email: fromEmail },
        to:          [{ email: to }],
        subject,
        htmlContent: html
    };

    if (replyTo) payload.replyTo = { email: replyTo };

    await axios.post(BREVO_API, payload, {
        headers: {
            'api-key':      process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept':       'application/json'
        }
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function genRefId() {
    return 'TSP-' + Date.now().toString(36).toUpperCase();
}

function row(label, value, shaded = false) {
    const bg = shaded ? '#1e293b' : '#111827';
    return `<tr style="background:${bg};">
      <td style="padding:12px 16px;color:#64748b;font-size:0.85rem;width:130px;font-weight:600;">${label}</td>
      <td style="padding:12px 16px;color:#e2e8f0;font-size:0.9rem;">${value}</td>
    </tr>`;
}

// ── Email templates ───────────────────────────────────────────────────────────
function adminEmailHTML(d) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#e63946,#f5a623);padding:28px 32px;border-radius:12px 12px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:1.4rem;">&#128276; New Contact Request</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">Reference #${d.refId}</p>
      </td></tr>
      <tr><td style="background:#111827;padding:32px;border-radius:0 0 12px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${row('Name',    escHtml(d.name))}
          ${row('Email',   `<a href="mailto:${escHtml(d.email)}" style="color:#e63946;">${escHtml(d.email)}</a>`, true)}
          ${row('Phone',   escHtml(d.phone)   || 'Not provided')}
          ${row('Company', escHtml(d.company) || 'Not provided', true)}
          ${row('Service', serviceLabel(d.service))}
          ${row('Urgency', escHtml(d.urgency) || 'Medium', true)}
        </table>
        <div style="margin-top:20px;padding:20px;background:#1e293b;border-radius:8px;border-left:4px solid #e63946;">
          <p style="margin:0 0 8px;color:#94a3b8;font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;">Message</p>
          <p style="margin:0;color:#e2e8f0;line-height:1.7;">${escHtml(d.message).replace(/\n/g,'<br>')}</p>
        </div>
        <p style="margin-top:24px;color:#64748b;font-size:0.8rem;text-align:center;">
          Sent via TechSolve Pro contact form &bull; ${new Date().toUTCString()}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function clientEmailHTML(d) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#e63946,#f5a623);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:1.5rem;">TechSolve Pro</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:0.9rem;">Professional IT Solutions</p>
      </td></tr>
      <tr><td style="background:#111827;padding:36px 32px;border-radius:0 0 12px 12px;">
        <h2 style="margin:0 0 16px;color:#e2e8f0;font-size:1.3rem;">Thank you, ${escHtml(d.name)}!</h2>
        <p style="margin:0 0 16px;color:#94a3b8;line-height:1.8;">
          We have received your enquiry regarding
          <strong style="color:#f5a623;">${serviceLabel(d.service)}</strong>
          and our team is already reviewing it.
        </p>
        <p style="margin:0 0 24px;color:#94a3b8;line-height:1.8;">
          We will get back to you <strong style="color:#e2e8f0;">within 24 hours</strong> with a detailed response.
        </p>
        <div style="padding:20px;background:#1e293b;border-radius:8px;border-left:4px solid #f5a623;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#64748b;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;">Your message</p>
          <p style="margin:0;color:#e2e8f0;line-height:1.7;font-style:italic;">${escHtml(d.message).replace(/\n/g,'<br>')}</p>
        </div>
        <div style="text-align:center;padding:16px;background:rgba(230,57,70,0.08);border-radius:8px;margin-bottom:24px;">
          <p style="margin:0;color:#94a3b8;font-size:0.85rem;">Reference Number</p>
          <p style="margin:4px 0 0;color:#e63946;font-size:1.4rem;font-weight:700;">#${d.refId}</p>
        </div>
        <p style="text-align:center;margin:0 0 24px;">
          <a href="https://wa.me/254704003130" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#e63946,#f5a623);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:0.9rem;">
            &#128172; WhatsApp Us
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 20px;">
        <p style="margin:0;color:#64748b;font-size:0.8rem;text-align:center;">
          &copy; ${new Date().getFullYear()} TechSolve Pro &bull; Kahawa, Nairobi, Kenya &bull;
          <a href="tel:+254704003130" style="color:#e63946;text-decoration:none;">+254 70 400 3130</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Health / keep-alive endpoints ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'TechSolve Pro Mailer API is running ✅' });
});

// UptimeRobot monitors this URL every 14 min to prevent Render sleeping
app.get('/ping', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: Math.floor(process.uptime()) + 's',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', service: 'TechSolve Pro Mailer API', version: '2.0.0' });
});

// ── Contact endpoint ──────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, company, service, urgency, message } = req.body;

        // Validate
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
        const d = {
            name: name.trim(), email: email.trim(),
            phone: (phone||'').trim(), company: (company||'').trim(),
            service, urgency: urgency || 'medium',
            message: message.trim(), refId
        };

        const ADMIN = process.env.ADMIN_EMAIL;

        // 1. Admin notification
        await sendBrevoEmail({
            to:      ADMIN,
            subject: `New Contact: ${serviceLabel(service)} — ${name.trim()}`,
            html:    adminEmailHTML(d),
            replyTo: email
        });

        // 2. Client confirmation
        await sendBrevoEmail({
            to:      email,
            subject: `We received your enquiry — TechSolve Pro (Ref #${refId})`,
            html:    clientEmailHTML(d)
        });

        return res.json({ success: true, message: 'Message sent successfully!', refId });

    } catch (err) {
        const detail = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error('Brevo error:', detail);
        return res.status(500).json({
            success: false,
            message: 'Email sending failed. Please try again or contact us directly.',
            error: detail
        });
    }
});

app.listen(PORT, () => console.log(`🚀 TechSolve Mailer API (Brevo) running on port ${PORT}`));
