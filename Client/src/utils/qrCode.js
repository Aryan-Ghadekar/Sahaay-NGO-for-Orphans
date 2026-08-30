import QRCode from 'qrcode';

// Same "generate an image client-side, no server round-trip" pattern as
// imageToDataUrl.js/certificateImage.js. Encodes the raw applications.id —
// the same payload the approval email's QR carries — so this is purely a
// fallback view in case that email never arrives, not a separate code.
export function generateApplicationQrDataUrl(applicationId) {
  return QRCode.toDataURL(applicationId, { width: 240, margin: 2 });
}
