const PDFDocument = require('pdfkit');

const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('WeShopkeepers', 50, 50);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('Your Neighbourhood. Your Store. Online.', 50, 78);
    doc.fillColor('#000');

    // Invoice title
    doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', 400, 50);
    doc.fontSize(10).font('Helvetica').text(`Order ID: ${order._id}`, 400, 75).text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 400, 90);

    // Divider
    doc.moveTo(50, 110).lineTo(550, 110).stroke('#3B82F6').lineWidth(2);

    // Bill to
    doc.fontSize(11).font('Helvetica-Bold').text('Bill To:', 50, 130);
    const addr = order.shippingAddress;
    doc.fontSize(10).font('Helvetica').text(addr.name, 50, 148).text(`${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}`, 50, 163).text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 50, 178).text(`Phone: ${addr.phone}`, 50, 193);

    // Table header
    const tableTop = 230;
    doc.fillColor('#1E293B').rect(50, tableTop, 500, 22).fill();
    doc.fillColor('#fff').fontSize(10).font('Helvetica-Bold');
    doc.text('Item', 58, tableTop + 6).text('Qty', 330, tableTop + 6).text('Price', 380, tableTop + 6).text('Total', 470, tableTop + 6);

    // Table rows
    let y = tableTop + 30;
    doc.fillColor('#000').font('Helvetica').fontSize(10);
    order.orderItems.forEach((item, i) => {
      if (i % 2 === 0) { doc.fillColor('#F8FAFC').rect(50, y - 4, 500, 20).fill(); doc.fillColor('#000'); }
      doc.text(item.name.substring(0, 40), 58, y).text(item.qty.toString(), 330, y).text(`Rs.${item.price.toLocaleString('en-IN')}`, 380, y).text(`Rs.${(item.price * item.qty).toLocaleString('en-IN')}`, 470, y);
      y += 22;
    });

    // Totals
    y += 10;
    doc.moveTo(50, y).lineTo(550, y).stroke('#ddd');
    y += 12;
    const totals = [['Subtotal', order.itemsPrice], ['Discount', -order.discountAmount], ['Delivery', order.deliveryPrice], ['Tax (5%)', order.taxPrice], ['Total', order.totalPrice]];
    totals.forEach(([label, val]) => {
      if (val !== 0 || label === 'Total') {
        const isTot = label === 'Total';
        if (isTot) doc.font('Helvetica-Bold').fontSize(12); else doc.font('Helvetica').fontSize(10);
        doc.text(label, 380, y).text(`Rs.${Math.abs(val).toLocaleString('en-IN')}${val < 0 ? ' OFF' : ''}`, 470, y);
        y += isTot ? 16 : 14;
      }
    });

    // Footer
    doc.moveTo(50, 720).lineTo(550, 720).stroke('#3B82F6');
    doc.fontSize(9).fillColor('#666').font('Helvetica').text('Thank you for shopping with WeShopkeepers!', 50, 730, { align: 'center', width: 500 }).text('support@weshopkeepers.com | www.weshopkeepers.com', 50, 745, { align: 'center', width: 500 });

    doc.end();
  });
};

module.exports = generateInvoice;
