const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || 'Lead Nurse <onboarding@resend.dev>';
const COMPLIANCE_EMAIL = 'compliance@leadnurse.co.uk';

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

  return resend.emails.send({
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

  return resend.emails.send({
    from: FROM,
    to: COMPLIANCE_EMAIL,
    subject: `Reference Completed: ${refereeName} for ${workerName}`,
    html,
  });
};
