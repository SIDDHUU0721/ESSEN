import crypto from 'crypto';
import QRCode from 'qrcode';

export const generateSecureToken = (prefix = 'TOK'): string => {
  const random = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${random}`;
};

export const generateQRCodeDataURL = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err: any) {
    throw new Error(`Failed to generate QR code: ${err.message}`);
  }
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}${random}`;
};

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${random}`;
};

export const generateVoucherCode = (): string => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `VOUCH-${random}`;
};

export const generateRedemptionCode = (): string => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RDM-${random}`;
};

export const generateBookingReference = (): string => {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TB-${random}`;
};

export const generateOtp = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
