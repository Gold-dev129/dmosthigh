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
    const color = item.color || item.selectedColor || '';
    const size = item.size || item.selectedSize || '';
    const qty = item.quantity || 1;
    const itemTotal = (item.price || 0) * qty;

    const variant = [color, size].filter(Boolean).join(', ');
    const variantStr = variant ? ` (${variant})` : '';

    itemsText += `• ${qty}x *${name}*${variantStr} - ${formatPrice(itemTotal)}\n`;
  });

  const subtotalAmount =
    order?.subtotal !== undefined
      ? order.subtotal
      : orderItems.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.quantity || 1)), 0);

  const feeAmount =
    deliveryFee !== undefined
      ? deliveryFee
      : (order?.shippingFee !== undefined ? order.shippingFee : 0);

  const serviceAmount =
    serviceFee !== undefined
      ? serviceFee
      : (order?.serviceFee !== undefined ? order.serviceFee : 1000);

  const totalAmount =
    total !== undefined
      ? total
      : (order?.total !== undefined ? order.total : (subtotalAmount + feeAmount + serviceAmount));

  const destinationCity =
    customer?.city || order?.shippingAddress?.city || '';
  const deliveryLabel = destinationCity ? `Delivery Fee (${destinationCity})` : 'Delivery Fee';

  const message = 
`⚡ *D.MOST.HIGH ORDER* [${orderNumber}]

📦 *Items Ordered:*
${itemsText || '• Streetwear Collection Pieces\n'}
💵 *Payment Summary:*
• *Product Fee:* ${formatPrice(subtotalAmount)}
• *${deliveryLabel}:* ${formatPrice(feeAmount)}
• *Service Fee:* ${formatPrice(serviceAmount)}
• *Total Money Paid:* *${formatPrice(totalAmount)}*

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

/**
 * Normalize Nigerian phone number to international WhatsApp format (234...)
 */
export const cleanNigerianPhone = (rawPhone) => {
  if (!rawPhone) return '';
  let digits = String(rawPhone).replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
  } else if (!digits.startsWith('234') && digits.length === 10) {
    digits = '234' + digits;
  }
  return digits;
};

/**
 * Generate WhatsApp confirmation message from Admin to Customer
 */
export const getAdminPaymentConfirmedMessage = (order) => {
  const customerName = order.customerName || 'Valued Customer';
  const orderNumber = order.orderNumber || 'DMH-ORDER';
  const total = Number(order.total || 0).toLocaleString('en-NG');
  const subtotal = Number(order.subtotal || 0).toLocaleString('en-NG');
  const shippingFee = Number(order.shippingFee || 0).toLocaleString('en-NG');
  const serviceFee = Number(order.serviceFee || 1000).toLocaleString('en-NG');
  const city = order.shippingAddress?.city || 'Your Location';

  const items = order.items || [];
  let itemsText = '';
  items.forEach((item) => {
    const name = item.name || item.productName || 'Piece';
    const variant = [item.selectedColor || item.color, item.selectedSize || item.size].filter(Boolean).join(', ');
    const variantStr = variant ? ` (${variant})` : '';
    itemsText += `• ${item.quantity || 1}x *${name}*${variantStr}\n`;
  });

  const msg = 
`⚡ *D.MOST.HIGH™ — PAYMENT CONFIRMED* ⚡

Hi *${customerName}*, your payment for Order *${orderNumber}* has been verified and confirmed! ✅

📦 *Ordered Pieces:*
${itemsText || '• Streetwear Collection Pieces\n'}
💵 *Payment Summary:*
• *Product Fee:* ₦${subtotal}
• *Delivery Fee (${city}):* ₦${shippingFee}
• *Service Fee:* ₦${serviceFee}
• *Total Money Paid:* *₦${total}*

🚚 *Destination:* ${city}
⚡ *Delivery Timeline:* Within 1-2 weeks nationwide

Your package is now being packaged by our team for dispatch. Thank you for choosing D.MOST.HIGH!`;

  return msg;
};

/**
 * Generate click-to-chat WhatsApp URL to message customer with payment confirmation
 */
export const getAdminCustomerWhatsAppUrl = (order) => {
  const phone = cleanNigerianPhone(order.customerPhone);
  if (!phone) return null;
  const msg = getAdminPaymentConfirmedMessage(order);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};

