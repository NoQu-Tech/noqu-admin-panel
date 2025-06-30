const { db } = require('../models/db');
const { sendEmail } = require('../services/emailservices');
// const delay = require('../utils/delay');
const nodemailer = require('nodemailer');



const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


exports.subscribe = (req, res) => {
  const { email, htmlBody } = req.body;

  db.query('SELECT * FROM subscribers WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    db.query('INSERT INTO subscribers (email) VALUES (?)', [email], (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      const mailOptions = {
        to: email,
        subject: 'Welcome to the NoQu Newsletter!',
        html: htmlBody,
      };
      sendEmail(mailOptions);
      res.status(200).json({ message: 'Subscription successful' });
    });
  });
};


exports.unsubscribe = (req, res) => {
const email = req.body.email;
const FB = req.body.feedback;
const FBoption = req.body.FBoption;
const htmlBody = req.body.htmlBody;

// Check if the email exists in the subscribers table
db.query('SELECT * FROM subscribers WHERE email = ?', [email], (err, results) => {
    if (err) {
    return res.status(500).json({ message: 'Something went wrong' });
    }

    if (results.length > 0) {
    // Email found in the subscribers table, retrieve the ID
    const subscriberId = results[0].id; // Assuming the ID is in the first result

    // Delete from subscribers table
    db.query('DELETE FROM subscribers WHERE ID = ?', [subscriberId], (err) => {
        if (err) {
        return res.status(500).json({ message: 'Something went wrong while deleting subscriber' });
        }

        // Determine the value for feedback
        const feedback = FB === "Others" ? FBoption : FB;

        // Insert into unsubscribers table
        db.query('INSERT INTO unsubscribers (id, email, feedback) VALUES (?, ?, ?)', [subscriberId, email, feedback], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Database error while unsubscribing' });
        }

        // Send confirmation email
        const mailOptions = {
            // from: "digitalleadnoqu1@gmail.com",
            to: email,
            subject: 'We’re Sorry to See You Go!',
            html: htmlBody,
        };

        sendEmail(mailOptions);
        res.status(200).json({ message: 'Subscription successful' });
        });
    });
    } else {
    // Email not found in subscribers table
    return res.status(404).json({ message: 'This email is not subscribed' });
    }
});
};
  
exports.getSubscribers = (req, res) => {
db.query('SELECT id, email, created_at FROM subscribers', (err, results) => {
    if (err) {
    return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({
    message: results,
    message2: "irunga bhai...."
    });
});
};
  
exports.getUnsubscribers = (req, res) => {
db.query('SELECT id, email, deleted_at, feedback FROM unsubscribers', (err, results) => {
    if (err) {
    return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({
    message: results
    });
});
};
  
  
exports.deleteSubscriber = (req, res) => {
const id = req.body.id;
const email = req.body.email
// const htmlBody = req.body.htmlBody

db.query('DELETE FROM subscribers Where ID = ?', [id], (err) => {
    if (err) {
    return res.status(500).json({ message: 'Database error' });
    }
    db.query('INSERT INTO unsubscribers (id, email) VALUES (?, ?)', [id, email], (err) => {
    if (err) {
        console.log(err)
        return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: `${id} Deleted Successfully`});

    // const mailOptions = {
    //   from: "digitalleadnoqu1@gmail.com",
    //   to: email,
    //   subject: 'We’re Sorry to See You Go!',
    //   html: htmlBody
    // };
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log('Error sending email:', error);
    //     res.status(500).send({ message: 'Error sending email' });
    //   } else {
    //     res.send({ message: 'Email deleted successfully' });
    //   }
    // });
    })
});
};
  
exports.sendNewsletter = async (req, res) => {
const { subject, htmlBody } = req.body; // Get subject and body from request

if (!subject || !htmlBody) {
    return res.status(400).json({ message: 'Subject and body are required.' });
}

try {
    // Get subscribers from the database
    db.query('SELECT email FROM subscribers', async (err, results) => {
    if (err) {
        return res.status(500).json({ message: 'Error fetching subscribers.', error: err });
    }

    const subscribers = results;
    const sendEmailPromises = subscribers.map(subscriber => sendEmailToSubscriber(subscriber, subject, htmlBody));

    // Send emails with delay (sequentially)
    await sendEmailPromises.reduce((promise, nextEmail) => {
        return promise.then(() => nextEmail);
    }, Promise.resolve());

    return res.status(200).json({ message: 'Newsletter sent successfully to all subscribers.' });
    });
} catch (error) {
    console.error('Error sending newsletter:', error);
    return res.status(500).json({ message: 'Failed to send newsletter.', error: error });
}
};
  
exports.sendNewsletterByEmail = async (req, res) =>{
const {email, subject, htmlBody} = req.body

const mailOptions = {
    // from: "digitalleadnoqu1@gmail.com",
    to: email,
    subject: subject,
    html: htmlBody
};
    sendEmail(mailOptions);
    res.status(200).json({ message: 'Subscription successful' });
};
  
// Delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  
// Function to send an email to a single subscriber
const sendEmailToSubscriber = async (subscriber, subject, htmlBody) => {
const mailOptions = {
    // from: 'digitalleadnoqu1@gmail.com',
    to: subscriber.email,
    subject: subject,
    html: htmlBody
};

try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${subscriber.email}`);
    await delay(500); // Delay between sends to avoid overloading the server
} catch (error) {
    console.error(`Failed to send email to ${subscriber.email}:`, error);
}
};
  

