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
  const orderNumber = order?.orderNumber || 'DMH-PENDING';
  const customerName = customer?.name || order?.customerName || 'Customer';
  const customerPhone = customer?.phone || order?.customerPhone || '';
  const customerAddress = customer?.address || order?.shippingAddress?.address || '';
  const customerCity = customer?.city || order?.shippingAddress?.city || 'Ibadan';
  const customerState = customer?.state || order?.shippingAddress?.state || '';
  const customerCountry = customer?.country || order?.shippingAddress?.country || 'Nigeria';

  const orderItems = items && items.length > 0 ? items : order?.items || [];

  let itemsText = '';
  orderItems.forEach((item, index) => {
    const name = item.name || item.productName || 'Streetwear Piece';
    const color = item.color || 'Standard';
    const size = item.size || 'Standard';
    const qty = item.quantity || 1;
    const price = item.price || 0;
    const itemTotal = price * qty;

    itemsText += `${index + 1}. *${name}*\n   • Color: ${color} | Size: ${size}\n   • Qty: ${qty} | Unit: ${formatPrice(price)}\n   • Subtotal: ${formatPrice(itemTotal)}\n\n`;
  });

  const subtotalAmount = order?.subtotal || orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const feeAmount = deliveryFee !== undefined ? deliveryFee : (order?.shippingFee || 0);
  const serviceAmount = serviceFee !== undefined ? serviceFee : (order?.serviceFee || 1000);
  const totalAmount = total !== undefined ? total : (order?.total || (subtotalAmount + feeAmount + serviceAmount));

  const message = 
`⚡ *D.MOST.HIGH™ — ORDER & PAYMENT DETAILS* ⚡

*ORDER REFERENCE:* ${orderNumber}

👤 *CUSTOMER INFORMATION:*
• *Name:* ${customerName}
• *Phone:* ${customerPhone}
• *Delivery Address:* ${customerAddress}, ${customerCity}, ${customerState}, ${customerCountry}

📦 *ORDERED PIECES:*
${itemsText}💰 *PAYMENT BREAKDOWN:*
• Items Subtotal: ${formatPrice(subtotalAmount)}
• Delivery Fee (${customerCity}): ${formatPrice(feeAmount)}
• Processing Fee: ${formatPrice(serviceAmount)}
━━━━━━━━━━━━━━━━━━━━
👉 *TOTAL AMOUNT TO PAY: ${formatPrice(totalAmount)}*
━━━━━━━━━━━━━━━━━━━━

💳 *OFFICIAL PAYMENT ACCOUNT:*
Please transfer *${formatPrice(totalAmount)}* to:
• *Bank:* ${WHATSAPP_CONFIG.BANK_NAME}
• *Account Number:* ${WHATSAPP_CONFIG.ACCOUNT_NUMBER}
• *Account Name:* ${WHATSAPP_CONFIG.ACCOUNT_NAME}

📸 *MANDATORY — SEND PAYMENT SCREENSHOT:*
Once you complete the transfer, please reply directly in this chat with your *TRANSFER SCREENSHOT / RECEIPT* so our admin can verify your payment on the dashboard and dispatch your order immediately! ⚡

Thank you for shopping with D.MOST.HIGH.`;

  return message;
};

/**
 * Generate click-to-chat WhatsApp URL
 */
export const getWhatsAppOrderUrl = (orderPayload) => {
  const message = generateWhatsAppOrderMessage(orderPayload);
  return `https://wa.me/${WHATSAPP_CONFIG.PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
};
