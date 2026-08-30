import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var: ${name}. Copy Server/.env.example to Server/.env and fill it in.`
    );
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  supabaseUrl: required('SUPABASE_URL'),
  supabaseAnonKey: required('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  orgFoundedYear: Number(process.env.ORG_FOUNDED_YEAR) || 2014,
  // Optional — the AI impact-narrative endpoint checks this itself and
  // returns a clear error rather than failing at startup when it's unset.
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  // Optional — email.service.js checks smtp.host itself and skips sending
  // (logging a warning) rather than failing at startup or breaking the
  // approval flow when it's unset.
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Sahaay <no-reply@sahaay.org>',
  },
};
