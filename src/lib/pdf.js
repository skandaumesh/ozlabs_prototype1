import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateInvoicePDF(invoice, project, client) {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  
  // Embed the standard font
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  // Add a blank page to the document
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  const fontSize = 12;
  const margin = 50;
  
  // Draw Header
  page.drawText('INVOICE', {
    x: width - margin - 100,
    y: height - margin,
    size: 24,
    font: timesRomanBoldFont,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Ozlabs', {
    x: margin,
    y: height - margin,
    size: 20,
    font: timesRomanBoldFont,
  });
  
  // Draw Invoice Details
  page.drawText(`Invoice Number: INV-${invoice.invoiceNumber}`, {
    x: width - margin - 150,
    y: height - margin - 40,
    size: fontSize,
    font: timesRomanFont,
  });
  
  page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, {
    x: width - margin - 150,
    y: height - margin - 60,
    size: fontSize,
    font: timesRomanFont,
  });
  
  page.drawText(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, {
    x: width - margin - 150,
    y: height - margin - 80,
    size: fontSize,
    font: timesRomanFont,
  });
  
  // Draw Client Details
  page.drawText('Bill To:', {
    x: margin,
    y: height - margin - 40,
    size: 14,
    font: timesRomanBoldFont,
  });
  
  page.drawText(client.name, {
    x: margin,
    y: height - margin - 60,
    size: fontSize,
    font: timesRomanFont,
  });
  
  page.drawText(client.email, {
    x: margin,
    y: height - margin - 80,
    size: fontSize,
    font: timesRomanFont,
  });
  
  if (client.companyName) {
    page.drawText(client.companyName, {
      x: margin,
      y: height - margin - 100,
      size: fontSize,
      font: timesRomanFont,
    });
  }
  
  // Draw Items Table Header
  const tableTopY = height - margin - 160;
  page.drawText('Description', { x: margin, y: tableTopY, size: 14, font: timesRomanBoldFont });
  page.drawText('Amount', { x: width - margin - 80, y: tableTopY, size: 14, font: timesRomanBoldFont });
  
  // Draw line
  page.drawLine({
    start: { x: margin, y: tableTopY - 10 },
    end: { x: width - margin, y: tableTopY - 10 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  // Draw items
  let currentY = tableTopY - 30;
  
  // Project item
  page.drawText(`Project: ${project.name} (${project.type})`, {
    x: margin,
    y: currentY,
    size: fontSize,
    font: timesRomanFont,
  });
  
  page.drawText(`$${invoice.amount.toFixed(2)}`, {
    x: width - margin - 80,
    y: currentY,
    size: fontSize,
    font: timesRomanFont,
  });
  
  currentY -= 30;
  
  // Draw line
  page.drawLine({
    start: { x: margin, y: currentY },
    end: { x: width - margin, y: currentY },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  currentY -= 30;
  
  // Total
  page.drawText('Total:', {
    x: width - margin - 150,
    y: currentY,
    size: 14,
    font: timesRomanBoldFont,
  });
  
  page.drawText(`$${invoice.amount.toFixed(2)}`, {
    x: width - margin - 80,
    y: currentY,
    size: 14,
    font: timesRomanBoldFont,
  });
  
  // Payment instructions
  page.drawText('Please note: Online payments via Razorpay are currently unavailable.', {
    x: margin,
    y: 100,
    size: 10,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
