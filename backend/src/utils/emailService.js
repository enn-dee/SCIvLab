import nodemailer from "nodemailer";

// ─── Singleton transporter (created once, reused) ───────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === "true",
    pool: true, // reuse connections
    maxConnections: 3, // safe for free tiers
    maxMessages: 50,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

// ─── Verify connection on startup (optional) ────────────────────
export const verifyEmailConnection = async () => {
  try {
    await getTransporter().verify();
    console.log("✅ Email transporter ready");
  } catch (err) {
    console.error("❌ Email transporter failed:", err.message);
  }
};

// ─── Core send function ─────────────────────────────────────────
export const sendEmail = async ({ to, subject, html, text }) => {
  //   console.log("📨 Attempting to send email:", { to, subject });

  if (!to) {
    // console.log("⏭️  Skipped — no recipient email");
    return { skipped: true };
  }

  const from = `"${process.env.SMTP_FROM_NAME || "SCiVLab"}" <${
    process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
  }>`;

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html,
    });
    // console.log("✅ Email sent:", info.messageId, "→", to);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    // console.error(`❌ Email failed for ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

// ─── Exam notification email ────────────────────────────────────
export const sendExamNotification = async ({ student, exam, teacherName }) => {
  //   console.log("📧 sendExamNotification called for:", student?.email);

  if (!student?.email) {
    // console.log("⏭️  Skipped — student has no email:", student?.fullName);
    return { skipped: true, reason: "Student has no email" };
  }

  // ─── Compute duration FIRST (before using it in the template) ───
  const durationMinutes =
    exam.startTime && exam.endTime
      ? Math.floor((new Date(exam.endTime) - new Date(exam.startTime)) / 60000)
      : null;

  const startStr = exam.startTime
    ? new Date(exam.startTime).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Not scheduled";

  const endStr = exam.endTime
    ? new Date(exam.endTime).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Not scheduled";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e7eb; padding: 24px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #22d3ee; margin: 0; font-size: 22px;">
          📝 New Exam Scheduled
        </h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6;">
        Hi <strong>${student.fullName || "Student"}</strong>,
      </p>

      <p style="font-size: 15px; line-height: 1.6;">
        <strong>${teacherName || "Your teacher"}</strong> has scheduled a new exam
        and you have been enrolled. Here are the details:
      </p>

      <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 10px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; color: #d1d5db;">
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Exam</td>
            <td style="padding: 6px 0; color: #fff; font-weight: 600; text-align: right;">
              ${exam.title}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Language</td>
            <td style="padding: 6px 0; color: #22d3ee; font-weight: 600; text-align: right; text-transform: uppercase;">
              ${exam.language || "python"}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Starts</td>
            <td style="padding: 6px 0; color: #fff; text-align: right;">
              ${startStr}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Ends</td>
            <td style="padding: 6px 0; color: #fff; text-align: right;">
              ${endStr}
            </td>
          </tr>
          ${
            durationMinutes
              ? `<tr>
                  <td style="padding: 6px 0; color: #9ca3af;">Duration</td>
                  <td style="padding: 6px 0; color: #fff; text-align: right;">
                    ${durationMinutes} minutes
                  </td>
                </tr>`
              : ""
          }
        </table>
      </div>

      

      <div style="background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 10px; padding: 12px; margin: 20px 0; font-size: 13px; color: #fde68a;">
        ⚠️ Do not refresh the page during the exam. Switching windows or exiting
        fullscreen mode will be recorded as a penalty.
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/student/exams"
           style="display: inline-block; background: linear-gradient(135deg, #22d3ee, #a855f7); color: #000; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View Exam
        </a>
      </div>

      <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 32px;">
        This is an automated message from SCiVLab. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: student.email,
    subject: `📝 New Exam: ${exam.title}`,
    html,
  });
};

// ─── Practical notification email ────────────────────────────────
export const sendPracticalNotification = async ({ student, practical, labName, teacherName }) => {
  if (!student?.email) {
    return { skipped: true, reason: "Student has no email" };
  }

  const deadlineStr = practical.deadline
    ? new Date(practical.deadline).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "No deadline";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e5e7eb; padding: 24px; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #34d399; margin: 0; font-size: 22px;">
          🧪 New Practical Published
        </h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6;">
        Hi <strong>${student.fullName || "Student"}</strong>,
      </p>

      <p style="font-size: 15px; line-height: 1.6;">
        <strong>${teacherName || "Your teacher"}</strong> has published a new practical
        in <strong>${labName || "your lab"}</strong>. Here are the details:
      </p>

      <div style="background: rgba(52, 211, 153, 0.08); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 10px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; color: #d1d5db;">
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Practical</td>
            <td style="padding: 6px 0; color: #fff; font-weight: 600; text-align: right;">
              ${practical.title}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Lab</td>
            <td style="padding: 6px 0; color: #34d399; font-weight: 600; text-align: right;">
              ${labName || "—"}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Deadline</td>
            <td style="padding: 6px 0; color: #fff; text-align: right;">
              ${deadlineStr}
            </td>
          </tr>
        </table>
      </div>

      ${
        practical.description
          ? `<div style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 14px; color: #c7d2fe;">
              <strong style="color: #818cf8;">Description:</strong><br/>
              ${practical.description}
            </div>`
          : ""
      }

      <div style="text-align: center; margin: 28px 0;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/student/lab/${practical.labId}?practical=${practical._id}"
           style="display: inline-block; background: linear-gradient(135deg, #34d399, #6366f1); color: #000; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
          View Practical
        </a>
      </div>

      <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 32px;">
        This is an automated message from SCiVLab. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: student.email,
    subject: `🧪 New Practical: ${practical.title}`,
    html,
  });
};
