
import moment from 'moment';
import Booking from '../models/Artist.Booking.model.js';
import { createNotificationAndEmit } from './Notification.controller.js';
import { generateContractAndUpload } from '../utils/Contractpdf.js'  

import { generateSignedUrl } from '../utils/CloudinaryConfig.js'; 

export const getSignedUrl = (req, res) => {
  const publicId = req.params.publicId;
  console.log('Backend received publicId:', publicId);
  
  const fullPublicId = publicId.startsWith('contracts/') 
    ? publicId 
    : `contracts/${publicId}`;
  
  console.log('Full publicId:', fullPublicId);

  try {
    const signedUrl = generateSignedUrl(fullPublicId);
    console.log('Generated signed URL:', signedUrl);
    res.json({ signedUrl });
  } catch (err) {
    console.error("Failed to generate signed URL", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
};

export const generateClientContract = async (req, res) => {
  const { bookingId, signatureImage, paymentMethods, technicalReqs } = req.body;
  const userId = req.user?._id;

  try {
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const booking = await Booking.findById(bookingId)
      .populate('artist')
      .populate('client');

    if (!booking)  return res.status(404).json({ message: 'Booking not found' });
    if (booking.client._id.toString() !== userId.toString())
      return res.status(403).json({ message: 'Only the client can generate the contract' });
    if (['draft', 'signed'].includes(booking.contractStatus))
      return res.status(400).json({ message: 'Contract already generated.' });

   
    const hourlyRate = booking.artist.wage || 0;
    const totalHours = moment(booking.endTime).diff(moment(booking.startTime), 'hours', true);
    const totalWage  = Math.round(totalHours * hourlyRate);

    Object.assign(booking, {
      totalHours,
      wage:          totalWage,
      advance:       Math.floor(totalWage / 2),
      clientSignature: signatureImage,
      clientSignatureDate: new Date(),
      paymentMethods,
      technicalReqs,
      contractStatus: 'draft',
      lastActionTime: new Date(),
    });
    await booking.save();

    const secureUrl = await generateContractAndUpload(
      booking,
      signatureImage,
      null,                                 // no artist sig yet
      `contract-${bookingId}-draft`
    );

    booking.contractUrl = secureUrl;
    await booking.save();
    await createNotificationAndEmit({
      userId: booking.artist._id,
      userType: 'Artist',
      type: 'contract',
      message: `A new contract has been created for booking with ${booking.client.name}.`,
    });

    return res.json({ success: true, contractUrl: booking.contractUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error generating client contract' });
  }
};

export const signContractByArtist = async (req, res) => {
  const { bookingId, artistSignature } = req.body;
  const userId = req.user?._id;

  try {
    const booking = await Booking.findById(bookingId)
      .populate('artist')
      .populate('client');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.artist._id.toString() !== userId.toString())
      return res.status(403).json({ message: 'Only the artist can sign the contract' });
   
        Object.assign(booking, {
      status: 'accepted',
      contractSignedAt: new Date(),
      artistSignature,
      artistSignatureDate: new Date(),   
      contractStatus: 'signed',
      lastActionTime: new Date(),
    });

    await booking.save();
    const secureUrl = await generateContractAndUpload(
      booking,
      booking.clientSignature,
      artistSignature,
      `contract-${bookingId}-final`
    );

    booking.contractUrl = secureUrl;
    await booking.save();
    await createNotificationAndEmit({
      userId: booking.client._id,
      userType: 'Client',
      type: 'contract',
      message: `The artist ${booking.artist.name} has signed the contract.`,
    });

    return res.json({ success: true, contractUrl: booking.contractUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error signing contract' });
  }
};

export const getContractDetails = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId)
      .populate('artist')
      .populate('client');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    return res.json({
      bookingId: booking._id,
      client: booking.client,
      artist: booking.artist,
      wage: booking.wage,
      contractStatus: booking.contractStatus,
      clientSignature: booking.clientSignature,
      artistSignature: booking.artistSignature,
      contractUrl: booking.contractUrl,
      paymentMethods: booking.paymentMethods,
      technicalReqs: booking.technicalReqs,
      eventDate: booking.eventDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.location,
      eventDetails: booking.eventDetails,
      eventType: booking.eventType,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching contract' });
  }
};
