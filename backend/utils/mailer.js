const nodemailer = require("nodemailer");

/**
 * Resolve environment variables cleanly with fallback support
 */
function getEmailConfig() {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.MAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "").trim();
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.MAIL_FROM || process.env.FRIEND_EMAIL || user || "").trim();
  const host = (process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT, 10) || 587;
  const secure = port === 465 || process.env.EMAIL_SECURE === "true" || process.env.SMTP_SECURE === "true";

  return { user, pass, adminEmail, host, port, secure };
}

let transporter = null;

/**
const dns = require("dns");
const util = require("util");
const lookupAsync = util.promisify(dns.lookup);

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

let cachedIpv4Host = null;

async function resolveIPv4(hostname) {
  if (hostname === "smtp.gmail.com") {
    try {
      const res = await lookupAsync(hostname, 4);
      if (res && res.address && !res.address.includes(":")) {
        return res.address;
      }
    } catch (e) {
      // Use official Google SMTP IPv4
    }
    return "142.251.10.108";
  }

  try {
    const res = await lookupAsync(hostname, 4);
    if (res && res.address && !res.address.includes(":")) {
      return res.address;
    }
  } catch (err) {
    console.warn(`[MAIL] IPv4 resolution failed for ${hostname}:`, err.message);
  }
  return hostname;
}

async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const config = getEmailConfig();

  if (!config.user || !config.pass) {
    console.warn("[EMAIL] Warning: EMAIL_USER or EMAIL_PASS is not defined in environment variables.");
    return null;
  }

  const rawHost = config.host || "smtp.gmail.com";
  const targetHost = await resolveIPv4(rawHost);

  transporter = nodemailer.createTransport({
    host: targetHost,
    port: config.port || 587,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    },
    tls: {
      servername: rawHost,
      rejectUnauthorized: false
    },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000
  });

  return transporter;
}

/**
 * Verify SMTP connection safely (never leaks passwords)
 */
async function verifyMailer() {
  const config = getEmailConfig();
  const mailTransport = await getTransporter();
  if (!mailTransport) {
    return {
      configured: false,
      connected: false,
      message: "EMAIL_USER or EMAIL_PASS not configured"
    };
  }

  try {
    await mailTransport.verify();
    console.log(`[EMAIL] ✅ SMTP Transporter ready. Sending from: ${config.user} -> Admin: ${config.adminEmail}`);
    return {
      configured: true,
      connected: true,
      user: config.user,
      adminEmail: config.adminEmail
    };
  } catch (err) {
    console.error(`[EMAIL] ❌ SMTP Verification Error: ${err.message}`);
    // Invalidate broken transporter so it can retry fresh on next call
    transporter = null;
    return {
      configured: true,
      connected: false,
      user: config.user,
      adminEmail: config.adminEmail,
      error: err.message
    };
  }
}

/**
 * Send new booking notification to Admin
 * @param {Object} booking - Booking document from MongoDB
 */
async function sendBookingNotificationEmail(booking) {
  const mailTransport = await getTransporter();
  if (!mailTransport) {
    console.warn("[EMAIL] Skipping email dispatch: Transporter not configured.");
    return {
      success: false,
      error: "Mailer not configured"
    };
  }

  // Extract structured pickup details
  const pickupAddr = typeof booking.pickup === "object" && booking.pickup ? booking.pickup.address : (booking.pickup || "Not specified");
  const hasCoords =
    typeof booking.pickup === "object" &&
    booking.pickup &&
    booking.pickup.latitude !== null &&
    booking.pickup.latitude !== undefined &&
    booking.pickup.longitude !== null &&
    booking.pickup.longitude !== undefined;

  const coordsText = hasCoords
    ? `\nGPS Coordinates: ${booking.pickup.latitude}, ${booking.pickup.longitude}\nGoogle Maps: https://www.google.com/maps?q=${booking.pickup.latitude},${booking.pickup.longitude}`
    : "";

  const coordsHtml = hasCoords
    ? `<tr style="background:#f8fafc;">
        <td style="padding:10px 14px;font-weight:600;color:#475569;border:1px solid #e2e8f0;">GPS Location</td>
        <td style="padding:10px 14px;color:#0f172a;border:1px solid #e2e8f0;">
          <a href="https://www.google.com/maps?q=${booking.pickup.latitude},${booking.pickup.longitude}" target="_blank" style="color:#1d4ed8;font-weight:600;text-decoration:underline;">
            📍 View on Google Maps (${Number(booking.pickup.latitude).toFixed(4)}, ${Number(booking.pickup.longitude).toFixed(4)})
          </a>
        </td>
      </tr>`
    : "";

  const travelDate = booking.date || booking.tdate || "Flexible";
  const vehicle = booking.carType || booking.car || "Any / Suggest me";
  const specialRequest = booking.message || booking.request || "None";
  const bookingId = booking._id ? String(booking._id) : "N/A";
  const placedTime = booking.createdAt ? new Date(booking.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : new Date().toLocaleString("en-IN");

  // Plain Text Version
  const textContent =
    `========================================\n` +
    `🚖 NEW BOOKING REQUEST - SHREE SANWARIYA TRAVELS\n` +
    `========================================\n\n` +
    `Booking ID: ${bookingId}\n` +
    `Received At: ${placedTime} (IST)\n\n` +
    `CUSTOMER DETAILS:\n` +
    `----------------------------------------\n` +
    `• Name:  ${booking.name}\n` +
    `• Phone: ${booking.phone}\n\n` +
    `JOURNEY DETAILS:\n` +
    `----------------------------------------\n` +
    `• Pickup:      ${pickupAddr}${coordsText}\n` +
    `• Destination: ${booking.destination}\n` +
    `• Travel Date: ${travelDate}\n` +
    `• Vehicle:     ${vehicle}\n` +
    `• Special Note: ${specialRequest}\n\n` +
    `Status: Pending Confirmation\n\n` +
    `Please contact the customer promptly to confirm the booking.\n` +
    `Shree Sanwariya Travels • Ujjain, MP\n`;

  // Professional Responsive HTML Version
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #d4af37; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }
          .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 10px; }
          .content { padding: 24px; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 16px 0 8px 0; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; }
          table td { border: 1px solid #e2e8f0; }
          .cta-wrap { text-align: center; margin: 24px 0 12px 0; }
          .cta-btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚕 SHREE SANWARIYA TRAVELS</h1>
            <p>New Trip Booking Notification</p>
            <span class="badge">Booking ID: ${bookingId}</span>
          </div>
          <div class="content">
            <p style="font-size:15px;line-height:1.5;margin-top:0;">
              You have received a new booking inquiry on <strong>${placedTime}</strong>.
            </p>

            <div class="section-title">👤 Customer Information</div>
            <table>
              <tr>
                <td style="width:35%;padding:10px 14px;font-weight:600;color:#475569;background:#f8fafc;">Customer Name</td>
                <td style="padding:10px 14px;font-weight:700;color:#0f172a;">${booking.name}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;color:#475569;background:#f8fafc;">Phone Number</td>
                <td style="padding:10px 14px;color:#0f172a;">
                  <a href="tel:${booking.phone}" style="color:#0284c7;font-weight:700;text-decoration:none;">📞 +91 ${booking.phone}</a>
                </td>
              </tr>
            </table>

            <div class="section-title">🗺️ Trip & Vehicle Details</div>
            <table>
              <tr>
                <td style="width:35%;padding:10px 14px;font-weight:600;color:#475569;background:#f8fafc;">Pickup Address</td>
                <td style="padding:10px 14px;font-weight:600;color:#0f172a;">${pickupAddr}</td>
              </tr>
              ${coordsHtml}
              <tr>
                <td style="padding:10px 14px;font-weight:600;color:#475569;background:#f8fafc;">Destination</td>
                <td style="padding:10px 14px;font-weight:600;color:#0f172a;">${booking.destination}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;color:#475569;background:#f8fafc;">Travel Date</td>
                <td style="padding:10px 14px;color:#0f172a;">${travelDate}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;color:#475569;background:#f8fafc;">Preferred Vehicle</td>
                <td style="padding:10px 14px;color:#0f172a;">${vehicle}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;color:#475569;background:#f8fafc;">Special Requests</td>
                <td style="padding:10px 14px;color:#64748b;">${specialRequest}</td>
              </tr>
            </table>

            <div class="cta-wrap">
              <a href="https://wa.me/91${String(booking.phone).replace(/\D/g, "")}" class="cta-btn" target="_blank">
                💬 Reply Customer on WhatsApp
              </a>
            </div>
          </div>
          <div class="footer">
            Shree Sanwariya Travels • H35 Hatkeshwar Vihar, Nanakheda, Ujjain, MP<br/>
            Contact: +91 98933 30713 | 24/7 Cab & Outstation Travel
          </div>
        </div>
      </body>
    </html>
  `;

  const config = getEmailConfig();
  try {
    console.log(`[MAIL] Dispatching booking notification email to: ${config.adminEmail}...`);
    const info = await mailTransport.sendMail({
      from: `"Shree Sanwariya Travels" <${config.user}>`,
      to: config.adminEmail,
      subject: `🚗 New Booking Request: ${booking.name} (${pickupAddr} ➔ ${booking.destination})`,
      text: textContent,
      html: htmlContent
    });

    console.log(`[MAIL] ✅ sendMail succeeded. MessageId: ${info.messageId}, Accepted: ${JSON.stringify(info.accepted)}, Response: ${info.response}`);
    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    };
  } catch (err) {
    console.error(`[MAIL] ❌ sendMail failed: ${err.message}`);
    transporter = null;
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  getTransporter,
  verifyMailer,
  sendBookingNotificationEmail
};
