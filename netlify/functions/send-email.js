// netlify/functions/send-email.js
const sgMail = require('@sendgrid/mail');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      filename = 'orders.xlsx',
      base64,
      to = process.env.TO_EMAIL,
      subject = 'orders.xlsx',
      message = ''
    } = body;

    if (!base64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing base64 file data' }) };
    }
    if (!process.env.SENDGRID_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'SENDGRID_API_KEY not configured' }) };
    }
    if (!to) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No recipient configured' }) };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to,
      from: process.env.FROM_EMAIL || process.env.TO_EMAIL,
      subject,
      text: message || 'Attached is the Excel file.',
      attachments: [
        {
          content: base64,
          filename,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: 'Email sent' })
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error', details: err.message })
    };
  }
};
