// netlify/functions/send-email.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { filename = 'orders.xlsx', base64, subject = 'orders.xlsx', message = '' } = body;

    if (!base64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing base64 file data' }) };
    }

    const from = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const to = process.env.TO_EMAIL || 'pharmazonlimited@gmail.com';

    const response = await resend.emails.send({
      from,
      to,
      subject,
      text: message || 'Attached is the Excel file.',
      attachments: [
        {
          filename,
          content: base64,
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data: response }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

