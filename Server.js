app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage (replace with database in production)
const customTours = [];
const groupTourRequests = [];
const contactMessages = [];

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to send emails
async function sendEmail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html
        });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
}

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Admin dashboard route
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
});

// Custom Tour Form Submission
app.post('/api/custom-tour', async (req, res) => {
    try {
        const tourData = {
            id: Date.now(),
            ...req.body,
            submittedAt: new Date().toISOString()
        };

        customTours.push(tourData);

        // Send email to admin
        const adminEmailHTML = `
            <h2>New Custom Tour Request</h2>
            <h3>Personal Details</h3>
            <p><strong>Name:</strong> ${tourData.fullName}</p>
            <p><strong>Phone:</strong> ${tourData.phone}</p>
            <p><strong>Email:</strong> ${tourData.email}</p>
            <p><strong>Location:</strong> ${tourData.location}</p>
            
            <h3>Trip Details</h3>
            <p><strong>Destination:</strong> ${tourData.destination}</p>
            <p><strong>Days:</strong> ${tourData.days}</p>
            <p><strong>Adults:</strong> ${tourData.adults}</p>
            <p><strong>Children:</strong> ${tourData.children}</p>
            
            <h3>Preferences</h3>
            <p><strong>Package Type:</strong> ${tourData.packageType}</p>
            <p><strong>Hotel:</strong> ${tourData.hotelPreference}</p>
            <p><strong>Flights:</strong> ${tourData.flights}</p>
            <p><strong>Transport:</strong> ${tourData.transport}</p>
            <p><strong>Start Date:</strong> ${tourData.startDate}</p>
            <p><strong>Flexible Dates:</strong> ${tourData.flexibleDates}</p>
            
            <h3>Special Requirements</h3>
            <p>${tourData.specialRequirements || 'None'}</p>
        `;

        await sendEmail(
            process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            'New Custom Tour Request',
            adminEmailHTML
        );

        // Send confirmation email to customer
        const customerEmailHTML = `
            <h2>Thank You for Your Custom Tour Request!</h2>
            <p>Dear ${tourData.fullName},</p>
            <p>We have received your custom tour request for <strong>${tourData.destination}</strong>.</p>
            <p>Our travel expert will review your requirements and contact you within 24 hours at ${tourData.phone} or ${tourData.email}.</p>
            <h3>Your Request Summary:</h3>
            <ul>
                <li>Destination: ${tourData.destination}</li>
                <li>Duration: ${tourData.days} days</li>
                <li>Travelers: ${tourData.adults} adults, ${tourData.children} children</li>
                <li>Package Type: ${tourData.packageType}</li>
                <li>Start Date: ${tourData.startDate}</li>
            </ul>
            <p>Thank you for choosing CustomTours!</p>
            <p>Best regards,<br>The CustomTours Team</p>
        `;

        await sendEmail(
            tourData.email,
            'Custom Tour Request Received - CustomTours',
            customerEmailHTML
        );

        res.json({ 
            success: true, 
            message: 'Custom tour request submitted successfully',
            id: tourData.id
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit request' 
        });
    }
});

// Group Tour Join Request
app.post('/api/group-tour-join', async (req, res) => {
    try {
        const joinData = {
            id: Date.now(),
            ...req.body,
            submittedAt: new Date().toISOString()
        };

        groupTourRequests.push(joinData);

        // Send email to admin
        const adminEmailHTML = `
            <h2>New Group Tour Join Request</h2>
            <p><strong>Tour:</strong> ${joinData.tourName}</p>
            <p><strong>Name:</strong> ${joinData.name}</p>
            <p><strong>Phone:</strong> ${joinData.phone}</p>
            <p><strong>Email:</strong> ${joinData.email}</p>
            <p><strong>Number of People:</strong> ${joinData.numberOfPeople}</p>
            <p><strong>Message:</strong> ${joinData.message || 'None'}</p>
        `;

        await sendEmail(
            process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            'New Group Tour Join Request',
            adminEmailHTML
        );

        // Send confirmation to customer
        const customerEmailHTML = `
            <h2>Group Tour Join Request Received!</h2>
            <p>Dear ${joinData.name},</p>
            <p>Thank you for your interest in joining our <strong>${joinData.tourName}</strong> group tour.</p>
            <p>Our team will review your request and contact you shortly at ${joinData.phone} or ${joinData.email}.</p>
            <p>Best regards,<br>The CustomTours Team</p>
        `;

        await sendEmail(
            joinData.email,
            'Group Tour Request Received - CustomTours',
            customerEmailHTML
        );

        res.json({ 
            success: true, 
            message: 'Group tour request submitted successfully',
            id: joinData.id
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit request' 
        });
    }
});

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
    try {
        const contactData = {
            id: Date.now(),
            ...req.body,
            submittedAt: new Date().toISOString()
        };

        contactMessages.push(contactData);

        // Send email to admin
        const adminEmailHTML = `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Phone:</strong> ${contactData.phone}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Message:</strong></p>
            <p>${contactData.message}</p>
        `;

        await sendEmail(
            process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            'New Contact Message',
            adminEmailHTML
        );

        // Send confirmation to customer
        const customerEmailHTML = `
            <h2>Thank You for Contacting Us!</h2>
            <p>Dear ${contactData.name},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>Best regards,<br>The CustomTours Team</p>
        `;

        await sendEmail(
            contactData.email,
            'Message Received - CustomTours',
            customerEmailHTML
        );

        res.json({ 
            success: true, 
            message: 'Contact message sent successfully',
            id: contactData.id
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send message' 
        });
    }
});

// Admin Routes (Basic - Add authentication in production)
app.get('/api/admin/custom-tours', (req, res) => {
    res.json({ success: true, data: customTours });
});

app.get('/api/admin/group-tour-requests', (req, res) => {
    res.json({ success: true, data: groupTourRequests });
});

app.get('/api/admin/contact-messages', (req, res) => {
    res.json({ success: true, data: contactMessages });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
