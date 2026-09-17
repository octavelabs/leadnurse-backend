const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || 'Lead Nurse <onboarding@resend.dev>';
const COMPLIANCE_EMAIL = 'compliance@leadnurse.co.uk';
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || COMPLIANCE_EMAIL;

// resend.emails.send() does NOT reject on API-level failures (invalid key, rate
// limit, etc.) — it resolves with { data: null, error: {...} }. Every caller in
// this file relies on catching a rejection to know a send failed, so this
// wrapper turns an API error into a real thrown error.
async function sendMail(payload) {
  const result = await resend.emails.send(payload);
  if (result?.error) throw new Error(result.error.message || 'Resend send failed');
  return result;
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';

// Shared layout for the simpler, shift/compliance/payroll style notifications.
// Kept separate from the four templates above so their existing markup is untouched.
function baseTemplate({ bodyHtml, footerEmail = 'admin@leadnurse.co.uk' }) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
        <tr><td style="background:#3f3e59;padding:28px 40px;text-align:center">
          <img src="https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png" alt="Lead Nurse" height="36" style="display:block;margin:0 auto"/>
        </td></tr>
        <tr><td style="padding:40px">${bodyHtml}</td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Lead Nurse Limited &bull; ${footerEmail}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function ctaButton(url, label) {
  return `
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 8px">
      <tr><td style="background:#3f3e59;border-radius:8px;text-align:center">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px">
          ${label} &rarr;
        </a>
      </td></tr>
    </table>`;
}

function detailRow(label, value) {
  return `<tr><td style="padding:4px 0;font-size:14px;color:#6b7280;width:110px">${label}</td><td style="padding:4px 0;font-size:14px;color:#111827;font-weight:bold">${value}</td></tr>`;
}

// ─── Email verification ───────────────────────────────────────────────────────

exports.sendEmailVerificationEmail = async ({ name, email, verifyUrl }) => {
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
        <tr><td style="background:#3f3e59;padding:28px 40px;text-align:center">
          <img src="https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png" alt="Lead Nurse" height="36" style="display:block;margin:0 auto"/>
        </td></tr>
        <tr><td style="padding:40px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
            Welcome to Lead Nurse! Please verify your email address to activate your account.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px">
            <tr><td style="background:#3f3e59;border-radius:8px;text-align:center">
              <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px">
                Verify Email Address &rarr;
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 12px;font-size:13px;color:#6b7280;line-height:1.6">
            This link expires in 24 hours. If you did not create an account, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Lead Nurse Limited &bull; admin@leadnurse.co.uk</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your Lead Nurse email address',
    html,
  });
};

// ─── Password reset ───────────────────────────────────────────────────────────

exports.sendPasswordResetEmail = async ({ name, email, resetUrl }) => {
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
        <tr><td style="background:#3f3e59;padding:28px 40px;text-align:center">
          <img src="https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png" alt="Lead Nurse" height="36" style="display:block;margin:0 auto"/>
        </td></tr>
        <tr><td style="padding:40px">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
            We received a request to reset your Lead Nurse password. Click the button below to set a new password.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px">
            <tr><td style="background:#3f3e59;border-radius:8px;text-align:center">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px">
                Reset Password &rarr;
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
            This link expires in 1 hour. If you did not request a password reset, please ignore this email — your password will remain unchanged.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Lead Nurse Limited &bull; admin@leadnurse.co.uk</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your Lead Nurse password',
    html,
  });
};

// ─── Reference request email (sent to referee) ────────────────────────────────

exports.sendReferenceRequestEmail = async ({ refereeName, refereeEmail, workerName, formUrl, pdfUrl }) => {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#3f3e59;padding:28px 40px;text-align:center">
            <img src="https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png"
              alt="Lead Nurse" height="36" style="display:block;margin:0 auto" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px">
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">Dear Sir/Madam,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">I hope this email finds you well.</p>
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
              The above-named applicant <strong>${workerName}</strong> has provided your details as a referee in support
              of their application with Lead Nurse Limited.
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
              To ensure compliance with our recruitment and safeguarding procedures, we kindly ask that all
              correspondence and references are provided from your professional or company email address.
              Additionally, please confirm the applicant's employment dates using the MM/YY format (for example,
              05/24 to 06/26) on your organisation's official letterheaded paper, provided it contains the
              relevant information requested within the attached form.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7">
              Kindly provide the reference using the template sample attached.<br>
              We would be grateful if it is returned to us at your earliest convenience to
              <a href="mailto:${COMPLIANCE_EMAIL}" style="color:#de9f4f">${COMPLIANCE_EMAIL}</a>.
            </p>

            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px">
              <tr>
                <td style="background:#3f3e59;border-radius:8px;text-align:center">
                  <a href="${formUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px">
                    Complete Reference Form &rarr;
                  </a>
                </td>
              </tr>
            </table>

            ${pdfUrl ? `<p style="margin:0 0 28px;text-align:center">
              <a href="${pdfUrl}" style="font-size:13px;color:#6b7280;text-decoration:underline">
                Download reference form template (PDF)
              </a>
            </p>` : ''}

            <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
              Should you require any further information or clarification, please do not hesitate to contact us.
            </p>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0">

            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">
              <strong>STEPHANIE</strong><br>
              <span style="color:#6b7280">Compliance</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
              Lead Nurse Limited &bull; admin@leadnurse.co.uk &bull; 0338800828<br>
              This email is confidential and intended solely for the named recipient.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendMail({
    from: FROM,
    to: refereeEmail,
    subject: `Character Reference Request — ${workerName} | Lead Nurse Limited`,
    html,
    ...(pdfUrl ? { attachments: [{ filename: 'Lead-Nurse-Character-Reference-Form.pdf', path: pdfUrl }] } : {}),
  });
};

// ─── Notification email (sent to compliance team when reference is submitted) ──

exports.sendReferenceCompletedEmail = async ({ refereeName, workerName, adminViewUrl }) => {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">
        <tr>
          <td style="background:#3f3e59;padding:24px 40px;text-align:center">
            <img src="https://leadnurse.co.uk/wp-content/uploads/2026/02/Lead-Nurse-Logo-e1771949504571-1024x377.png"
              alt="Lead Nurse" height="32" style="display:block;margin:0 auto" />
          </td>
        </tr>
        <tr>
          <td style="padding:40px">
            <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:16px 20px;margin-bottom:24px">
              <p style="margin:0;font-size:14px;color:#065f46;font-weight:bold">&#x2713; Reference Submitted</p>
            </div>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">
              A character reference has been submitted by <strong>${refereeName}</strong> for applicant
              <strong>${workerName}</strong>.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7">
              Please log in to the Lead Nurse platform to review the completed reference.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#3f3e59;border-radius:8px">
                  <a href="${adminViewUrl}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none">
                    View Reference Response &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Lead Nurse Limited &bull; compliance@leadnurse.co.uk</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendMail({
    from: FROM,
    to: COMPLIANCE_EMAIL,
    subject: `Reference Completed: ${refereeName} for ${workerName}`,
    html,
  });
};

// ─── Shift confirmed ────────────────────────────────────────────────────────

exports.sendShiftConfirmedEmail = async ({ name, email, shiftTitle, facilityName, date, startTime, endTime }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Your shift has been <strong>confirmed</strong>. Here are the details:
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;background:#f9fafb;border-radius:8px;padding:16px 20px">
        ${detailRow('Shift', shiftTitle)}
        ${facilityName ? detailRow('Facility', facilityName) : ''}
        ${detailRow('Date', fmtDate(date))}
        ${detailRow('Time', `${fmtTime(startTime)} &ndash; ${fmtTime(endTime)}`)}
      </table>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        Please remember to check in and out via the Lead Nurse platform on the day of your shift.
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Shift Confirmed: ${shiftTitle}`, html });
};

// ─── Shift cancelled / unassigned ───────────────────────────────────────────

exports.sendShiftCancelledEmail = async ({ name, email, shiftTitle, date }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Your assignment to <strong>${shiftTitle}</strong>${date ? ` on ${fmtDate(date)}` : ''} has been cancelled.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        If you believe this was a mistake, please contact your administrator.
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Shift Cancelled: ${shiftTitle}`, html });
};

// ─── Shift application declined ─────────────────────────────────────────────

exports.sendApplicationDeclinedEmail = async ({ name, email, shiftTitle, date }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Your application for <strong>${shiftTitle}</strong>${date ? ` on ${fmtDate(date)}` : ''} was not successful this time.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        Keep an eye on the Lead Nurse platform for other available shifts.
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Shift Application Update: ${shiftTitle}`, html });
};

// ─── New shift application (to admins) ──────────────────────────────────────

exports.sendNewApplicationEmail = async ({ applicantName, shiftTitle, date, reviewUrl }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        <strong>${applicantName}</strong> has applied for <strong>${shiftTitle}</strong>${date ? ` on ${fmtDate(date)}` : ''}.
      </p>
      ${ctaButton(reviewUrl, 'Review Application')}`,
    footerEmail: ADMIN_NOTIFY_EMAIL,
  });
  return sendMail({ from: FROM, to: ADMIN_NOTIFY_EMAIL, subject: `New Shift Application: ${applicantName} — ${shiftTitle}`, html });
};

// ─── Shift starting soon ─────────────────────────────────────────────────────

exports.sendShiftStartingSoonEmail = async ({ name, email, shiftTitle, facilityName, startTime }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Reminder: your shift <strong>${shiftTitle}</strong>${facilityName ? ` at ${facilityName}` : ''} starts at
        <strong>${fmtTime(startTime)}</strong> &mdash; just under an hour from now.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        Don't forget to check in via the Lead Nurse platform when you arrive.
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Shift Starting Soon: ${shiftTitle}`, html });
};

// ─── Clock-out reminder ───────────────────────────────────────────────────────

exports.sendClockOutReminderEmail = async ({ name, email, shiftTitle, endTime }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Your shift <strong>${shiftTitle}</strong> ends at <strong>${fmtTime(endTime)}</strong> &mdash; just under an hour
        from now. Remember to check out on the Lead Nurse platform when your shift finishes.
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Reminder: Check Out Soon — ${shiftTitle}`, html });
};

// ─── Missed clock-out (to admins) ────────────────────────────────────────────

exports.sendMissedClockOutEmail = async ({ employeeName, shiftTitle, date, endTime }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        <strong>${employeeName}</strong> checked in to <strong>${shiftTitle}</strong>${date ? ` on ${fmtDate(date)}` : ''}
        (scheduled to end at ${fmtTime(endTime)}) but has not checked out.
      </p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
        Please follow up and confirm their hours worked.
      </p>`,
    footerEmail: ADMIN_NOTIFY_EMAIL,
  });
  return sendMail({ from: FROM, to: ADMIN_NOTIFY_EMAIL, subject: `Missed Clock-Out: ${employeeName} — ${shiftTitle}`, html });
};

// ─── Compliance document expiring soon ──────────────────────────────────────

exports.sendComplianceExpiringEmail = async ({ name, email, complianceType, expiryDate }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Your <strong>${complianceType.replace(/_/g, ' ')}</strong> document is expiring soon, on
        <strong>${fmtDate(expiryDate)}</strong>. Please renew and upload an updated document as soon as possible to
        avoid disruption to your shifts.
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Compliance Document Expiring Soon: ${complianceType.replace(/_/g, ' ')}`, html });
};

// ─── Compliance document expired ────────────────────────────────────────────

exports.sendComplianceExpiredEmail = async ({ name, email, complianceType, expiryDate }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Your <strong>${complianceType.replace(/_/g, ' ')}</strong> document expired on
        <strong>${fmtDate(expiryDate)}</strong>. Please upload a renewed document as soon as possible &mdash; you may not
        be eligible for shifts requiring this document until it's updated.
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Compliance Document Expired: ${complianceType.replace(/_/g, ' ')}`, html });
};

// ─── Payroll ready ────────────────────────────────────────────────────────────

exports.sendPayrollReadyEmail = async ({ name, email, periodStart, periodEnd, totalPay, earningsUrl }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        Your payroll for <strong>${fmtDate(periodStart)} &ndash; ${fmtDate(periodEnd)}</strong> has been processed.
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;background:#f9fafb;border-radius:8px;padding:16px 20px">
        ${detailRow('Total Pay', `&pound;${Number(totalPay || 0).toFixed(2)}`)}
      </table>
      ${earningsUrl ? ctaButton(earningsUrl, 'View Earnings') : ''}`,
  });
  return sendMail({ from: FROM, to: email, subject: 'Your Payroll Has Been Processed', html });
};

// ─── Account activated / deactivated ────────────────────────────────────────

exports.sendAccountStatusEmail = async ({ name, email, isActive }) => {
  const html = baseTemplate({
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7">Hi ${name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
        ${isActive
          ? 'Your Lead Nurse account has been <strong>reactivated</strong>. You can now log in as normal.'
          : 'Your Lead Nurse account has been <strong>deactivated</strong>. You will not be able to log in until it is reactivated. If you believe this is a mistake, please contact your administrator.'}
      </p>`,
  });
  return sendMail({ from: FROM, to: email, subject: `Account ${isActive ? 'Reactivated' : 'Deactivated'}`, html });
};
