/**
 * WhatsApp Payment Configuration & Message Generator
 * DMOSTHIGH Clothing Brand
 */

export const WHATSAPP_CONFIG = {
  PHONE_NUMBER: '2349060534459', // Clean international format for wa.me
  DISPLAY_PHONE: '09060534459',
  BANK_NAME: 'OPay / Bank Transfer',
  ACCOUNT_NUMBER: '9060534459',
  ACCOUNT_NAME: 'DAVID OLORUNFEMI JONES',
};

/**
 * Format currency in Naira
 */
const formatPrice = (num) => {
  return '₦' + Number(num || 0).toLocaleString('en-NG');
};

/**
 * Generate formatted WhatsApp message for customer order
 */
export const generateWhatsAppOrderMessage = ({ order, items, customer, deliveryFee, serviceFee, total }) => {
  const orderNumber = order?.orderNumber || 'DMH-ORDER';
  const orderItems = items && items.length > 0 ? items : order?.items || [];

  let itemsText = '';
  orderItems.forEach((item) => {
    const name = item.name || item.productName || 'Piece';
    const color = item.color || '';
    const size = item.size || '';
    const qty = item.quantity || 1;
    const itemTotal = (item.price || 0) * qty;

    const variant = [color, size].filter(Boolean).join(', ');
    const variantStr = variant ? ` (${variant})` : '';

    itemsText += `• ${qty}x *${name}*${variantStr} - ${formatPrice(itemTotal)}\n`;
  });

  const subtotalAmount = order?.subtotal || orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const feeAmount = deliveryFee !== undefined ? deliveryFee : (order?.shippingFee || 0);
  const serviceAmount = serviceFee !== undefined ? serviceFee : (order?.serviceFee || 1000);
  const totalAmount = total !== undefined ? total : (order?.total || (subtotalAmount + feeAmount + serviceAmount));

  const message = 
`⚡ *D.MOST.HIGH ORDER* [${orderNumber}]

📦 *Items:*
${itemsText}
💰 *Total to Pay:* ${formatPrice(totalAmount)}

💳 *Transfer to:*
• *Acct No:* ${WHATSAPP_CONFIG.ACCOUNT_NUMBER}
• *Bank:* ${WHATSAPP_CONFIG.BANK_NAME}
• *Name:* ${WHATSAPP_CONFIG.ACCOUNT_NAME}

📸 *Please send payment screenshot here once done!*`;

  return message;
};

/**
 * Generate click-to-chat WhatsApp URL
 */
export const getWhatsAppOrderUrl = (orderPayload) => {
  const message = generateWhatsAppOrderMessage(orderPayload);
  return `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
};
