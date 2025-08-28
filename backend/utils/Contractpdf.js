

import moment from 'moment';
import cloudinary from '../utils/CloudinaryConfig.js'; // Import the cloudinary config
import pkg from 'pdfkit';
const PDFDocument = pkg;      


export function generateContractAndUpload(booking, clientSig, artistSig, publicId) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    // const uploadStream = cloudinary.uploader.upload_stream(
    //   {
    //     resource_type: 'auto',
    //     folder: 'contracts',
    //     public_id: publicId ,
    //     overwrite: true,
    //   },
    //   (error, result) => {
    //     if (error) return reject(error);
    //     resolve(result.secure_url);
    //       console.log(result.secure_url);
    //   }
    // );
   const uploadStream =   cloudinary.uploader.upload_stream(
  {
    resource_type: "raw",
    folder: "contracts",
    public_id: publicId,
    overwrite: true,
    use_filename: true,
    unique_filename: false,
    flags: "attachment:false", // ✅ important for inline iframe viewing
    context: "alt=PDF Contract Document",
    access_mode: "public",
  },
  (error, result) => {
    if (error) {
      console.error('Cloudinary upload error:', error);
      return reject(error);
    }
    console.log('Cloudinary upload success:', result.secure_url);
    resolve(result.secure_url);
  }
);    


    buildContractPDFContent(doc, booking, clientSig, artistSig);
    doc.pipe(uploadStream);
    doc.end();
  });
}

// You can paste the full buildContractPDFContent function here (as provided above)
function buildContractPDFContent(doc, booking, clientSig, artistSig) {
  /* ==== PRE‑CALCULATED VALUES ==== */
  const eventDate   = moment(booking.eventDate).format('MMMM D, YYYY');
  const startTime   = moment(booking.startTime).format('hh:mm A');
  const endTime     = moment(booking.endTime).format('hh:mm A');
  const totalHours  = moment(booking.endTime).diff(moment(booking.startTime), 'hours', true);
  const wage        = booking.wage || 0;
  const advance     = Math.floor(wage / 2);

  /* ==== HEADER ==== */
  doc.fontSize(20).text('Artist Booking Contract', { align: 'center' }).moveDown();
  doc.fontSize(12)
     .text(`This Agreement is made on this ${moment().format('MMMM D, YYYY')}.`)
     .moveDown();

  /* ==== CONTACT PERSON ==== */
  doc.fontSize(14).text('Event Contact Person:', { underline: true });
  doc.fontSize(12)
     .text(`Name:  ${booking.contactName  || booking.client.username || 'N/A'}`)
     .text(`Phone: ${booking.contactPhone || booking.client.phone   || 'N/A'}`)
     .text(`Email: ${booking.contactEmail || booking.client.email   || 'N/A'}`)
     .moveDown();

  /* ==== ARTIST INFO ==== */
  doc.fontSize(14).text('Artist/Performer:', { underline: true });
  doc.fontSize(12)
     .text(`Name:  ${booking.artist.username || booking.artist.name || ''}`)
     .text(`Phone: ${booking.artist.phone || ''}`)
     .text(`Email: ${booking.artist.email || ''}`)
     .moveDown();

  /* ==== EVENT DETAILS ==== */
  doc.fontSize(14).text('1. Event Details', { underline: true });
  doc.fontSize(12)
     .text('The Artist agrees to perform the services at the event.')
     .text(`- Event Date(s): ${eventDate}`)
     .text(`- Event Location: ${booking.location || 'N/A'}`)
     .text(`- Performance Time: From ${startTime} to ${endTime}`)
     .moveDown();

  /* ==== PAYMENT ==== */
  doc.fontSize(14).text('3. Payment', { underline: true });
  doc.fontSize(12)
     .text(`- Total Fee: Rs. ${wage} for approximately ${totalHours.toFixed(2)} hour(s)`)
     .moveDown();

  /* ==== PAYMENT TERMS ==== */
  doc.fontSize(14).text('4. Payment Terms', { underline: true });
  doc.fontSize(12).text('Payment will be made by (check one or more):');
  const pm = booking.paymentMethods || {};
  doc.text(pm.PayPal       ? '[x] PayPal'       : '[ ] PayPal');
  doc.text(pm.cash         ? '[x] Cash'         : '[ ] Cash');
  doc.text(pm.bankTransfer ? '[x] Bank Transfer': '[ ] Bank Transfer');
  if (pm.other) {
    doc.text(`[x] Other: ${pm.otherText || ''}`);
  } else {
    doc.text('[ ] Other: _______________________');
  }
  doc.moveDown()
     .text(`The Client agrees to pay a non‑refundable advance payment of 50% `
          + `of the total wage (Rs. ${advance || '_____'}) immediately upon the `
          + `Artist's signature to confirm the booking.`)
     .moveDown();

  /* ==== ADVANCE & BALANCE ==== */
  doc.fontSize(14).text('5. Advance & Remaining Balance', { underline: true });
  doc.fontSize(12)
     .text(`Advance to be paid: Rs. ${advance}`)
     .text(`Remaining to be paid after performance: Rs. ${wage - advance}`)
     .moveDown();

  /* ==== CANCELLATION POLICY ==== */
  doc.fontSize(14).text('6. Cancellation Policy', { underline: true });
  doc.fontSize(12)
     .text('- If Client cancels more than 7 days before the event, the advance payment is forfeited;')
     .text('- If Client cancels within 7 days of the event, the full wage is due.')
     .text('- If Artist cancels, the full advance will be refunded within 5 business days.')
     .moveDown();

  /* ==== ADDITIONAL REQUIREMENTS ==== */
  doc.fontSize(14).text('7. Additional Requirements', { underline: true });
  doc.fontSize(12).text(booking.technicalReqs || 'None specified').moveDown();

  /* ==== LIABILITY ==== */
  doc.fontSize(14).text('8. Liability', { underline: true });
  doc.fontSize(12)
     .text('Client agrees to provide a safe environment for the Artist. '
        +  'The Client assumes all responsibility for any injury or damage occurring at the event, '
        +  'except where caused by the Artist’s negligence.')
     .moveDown();

  /* ==== MISCELLANEOUS ==== */
  doc.fontSize(14).text('9. Miscellaneous', { underline: true });
  doc.fontSize(12)
     .text('This Agreement is the entire understanding between the parties.')
     .text('Any amendments must be in writing and signed by both parties.')
     .moveDown();

  /* ==== SIGNATURES ==== */
  doc.fontSize(12).text('Client Signature:', 50, doc.y);
  doc.fontSize(12).text('Artist Signature:', 320, doc.y);
  doc.moveDown(1);

  // Store the current Y position for both signatures
  const signatureY = doc.y;

  /* -- Client signature image -- */
  if (clientSig) {
    try {
      const clientBuf = Buffer.from(
        clientSig.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      doc.image(clientBuf, 50, signatureY, { 
        fit: [200, 60],
        align: 'left'
      });
      doc.fontSize(10)
         .text(
           `Date: ${moment(booking.clientSignatureDate).format('MMMM D, YYYY')}`,
           50,
           signatureY + 70
         );
    } catch (err) {
      console.log('Error rendering client signature:', err);
      doc.fontSize(12).text('_____________________________', 50, signatureY);
      doc.fontSize(10).text('(Signature)', 50, signatureY + 20);
    }
  } else {
    doc.fontSize(12).text('_____________________________', 50, signatureY);
  }

  /* -- Artist signature image -- */
  if (artistSig) {
    try {
      const artistBuf = Buffer.from(
        artistSig.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );
      doc.image(artistBuf, 320, signatureY, { 
        fit: [200, 60],
        align: 'left'
      });
      doc.fontSize(10)
         .text(
           `Date: ${moment(booking.artistSignatureDate).format('MMMM D, YYYY')}`,
           320,
           signatureY + 70
         );
    } catch (err) {
      console.log('Error rendering artist signature:', err);
      doc.fontSize(12).text('_____________________________', 320, signatureY);
      doc.fontSize(10).text('(Signature)', 320, signatureY + 20);
    }
  } else {
    doc.fontSize(12).text('_____________________________', 320, signatureY);
  }

  // Move the cursor down after both signatures
  doc.y = signatureY + 90;
  doc.moveDown(1);
}