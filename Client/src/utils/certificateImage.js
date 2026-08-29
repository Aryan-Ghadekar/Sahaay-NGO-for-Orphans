// Renders a certificate entirely client-side (canvas -> PNG) and triggers
// a browser download — no certificate image is ever generated or stored
// server-side; issuing a certificate only records volunteer/event/hours,
// and this redraws it fresh from that data whenever it's downloaded.
const WIDTH = 1400;
const HEIGHT = 990;

function drawCertificate({ volunteerName, eventTitle, hours, issuedAt }) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = '#16324a';
  ctx.lineWidth = 10;
  ctx.strokeRect(30, 30, WIDTH - 60, HEIGHT - 60);
  ctx.strokeStyle = '#e2884f';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, WIDTH - 100, HEIGHT - 100);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#e2884f';
  ctx.font = '600 28px Poppins, Segoe UI, sans-serif';
  ctx.fillText('SAHAAY', WIDTH / 2, 150);

  ctx.fillStyle = '#16324a';
  ctx.font = '700 56px Poppins, Segoe UI, sans-serif';
  ctx.fillText('Certificate of Appreciation', WIDTH / 2, 240);

  ctx.fillStyle = '#5c564a';
  ctx.font = '400 24px Inter, Segoe UI, sans-serif';
  ctx.fillText('This certificate is proudly presented to', WIDTH / 2, 340);

  ctx.fillStyle = '#16324a';
  ctx.font = '700 64px Poppins, Segoe UI, sans-serif';
  ctx.fillText(volunteerName || 'Volunteer', WIDTH / 2, 430);

  ctx.fillStyle = '#5c564a';
  ctx.font = '400 24px Inter, Segoe UI, sans-serif';
  ctx.fillText('in recognition of dedicated volunteering at', WIDTH / 2, 500);

  ctx.fillStyle = '#234c70';
  ctx.font = '600 38px Poppins, Segoe UI, sans-serif';
  ctx.fillText(eventTitle || 'a Sahaay event', WIDTH / 2, 560);

  ctx.fillStyle = '#5c564a';
  ctx.font = '400 24px Inter, Segoe UI, sans-serif';
  ctx.fillText(`having contributed ${hours} volunteer hour${Number(hours) === 1 ? '' : 's'}`, WIDTH / 2, 620);

  ctx.fillStyle = '#7d7666';
  ctx.font = '400 20px Inter, Segoe UI, sans-serif';
  ctx.fillText(`Issued on ${issuedAt || ''}`, WIDTH / 2, HEIGHT - 100);

  return canvas.toDataURL('image/png');
}

export function downloadCertificate({ volunteerName, eventTitle, hours, issuedAt }) {
  const dataUrl = drawCertificate({ volunteerName, eventTitle, hours, issuedAt });
  const safeName = (volunteerName || 'volunteer').replace(/[^a-z0-9]+/gi, '-');
  const safeEvent = (eventTitle || 'event').replace(/[^a-z0-9]+/gi, '-');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `Certificate-${safeEvent}-${safeName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
