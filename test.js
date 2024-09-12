paymentHandler.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
require("dotenv").config();



// Initialize Firebase
const admin = require("firebase-admin");
const path = require("path");

// const serviceAccount = require(path.join(__dirname, process.env.FIRBASE_APPLICATION_CREDENTIALS));

// const serviceAccount = require(path.join(__dirname, "first-project.json"));

require("dotenv").config();

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),  // Handle line breaks in private key
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:  process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();






let handlePayment = async (req, res) => {
  const { token, amount, formData } = req.body;

  try {
    const customer = await stripe.customers.create({
      name: `${formData.fullname} ${formData.lastname}`,
      email: formData.email,
      source: token, // Add the token here if you want to link it to the customer
    });

    const charge = await stripe.charges.create({
      amount: Math.round(amount * 100),
      currency: "sgd",
      customer: customer.id, // Link the charge to the customer
      description: `Paid By ${formData.fullname} ${formData.lastname}`,
      receipt_email: formData.email,

      metadata: {
        Address: `
          ${formData.address},
          ${formData.city} -
          ${formData.zipcode} - 
          ${formData.country}
        `,

        Booking_reference_number: formData.bookrefno,
        Name: `${formData.fullname} ${formData.lastname}`,
        Email: formData.email,
        // Phone: formData.phone,
        Phone: `${formData.country_code} ${formData.phone}`,
      },
    });

    // const receiptUrl = charge.receipt_url;

    // Generate a custom receipt (HTML)
    const receiptHtml = `
       <!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
       <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet">
      
      <style>
          body, table, td, a {
              font-family: 'Roboto', sans-serif;
              font-size: 14px;
              font-weight: 300;
              margin: 0;
              padding: 0;
              line-height: 1.6;
              color: #000000;
          }
  
          img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
          }
  
          table {
              border-collapse: collapse !important;
          }
  
          .box-invoice-block {
              width: 100%;
              background-color: #F0FBF7;
              padding-top: 70px;
              padding-bottom: 70px;
          }
  
          .box-invoice {
              background-color: #ffffff;
              border-radius: 6px;
              width: 70%;
              margin: auto;
              box-shadow: 0px 0px 35px rgba(181, 181, 195, 0.15);
          }
  
          .inner-invoice {
              padding: 60px 30px 20px 30px;
          }
  
          .privaceLogo {
              width: 100%;
              max-width: 150px;
              border-radius: 10px;
              display: block;
              margin: auto;
              margin-bottom: 30px;
          }
  
          .infoDate, .informationDiv, .paymentDiv {
              margin-bottom: 30px;
          }
  
          .infoHeadingh3 {
              font-size: 16px;
              margin: 0;
          }
  
          .infoPara {
              font-size: 14px;
              font-weight: 500;
              margin: 0;
          }
  
          .infoHeadingh5 {
              font-size: 22px;
              margin: 0;
  
          }
  
          .paymentDiv {
              background-color: #F0FBF7;
              padding: 20px;
          }
  
          .bottomInvoice {
              margin-top: 50px;
              text-align: center;
          }
  
          a {
              color: black;
              text-decoration: none;
              font-weight: 500;
              margin: 0 10px;
          }
  
          .ii a[href] {
      color: black!important;
       font-size: 18px;
  }
  
          @media only screen and (max-width: 600px) {
              .box-invoice {
                  width: 90%;
              }
  
              .inner-invoice {
                  padding: 30px 15px 10px 15px;
              }
  
              .infoDate, .informationDiv, .paymentDiv {
                  margin-bottom: 20px;
              }
  
              .infoHeadingh3 {
                  font-size: 14px;
              }
  
              .infoPara {
                  font-size: 12px;
              }
  
              .bottomInvoice {
                  font-size: 12px;
              }
          }
      </style>
  </head>
  
  <body>
      <div class="box-invoice-block">
          <div class="box-invoice">
              <div class="inner-invoice">
                  <img class="privaceLogo" style:"max-width: 250px;" src="https://privace-limousine.vercel.app/assets/imgs/privace-logo.jpeg" alt="Privace">
                   <div class="infoDate">
                              <h3 class="infoHeadingh3" style="font-size: 20px; margin-bottom: 0px;">Invoice date:</h3>
       <p class="infoPara" style="font-size: 18px;"> ${new Date().toLocaleDateString()}</p>
                          </div>
                          <div class="informationDiv">
                              <h3 class="" style="font-size: 20px; margin-bottom: 0px;">Booking Reference Number #</h3>
                              <p class="infoPara" style="font-size: 18px; margin-bottom: 0px;">${
                                formData.bookrefno
                              }</p>
                          </div>
                          <div class="informationDiv">
                              <h3 class="infoHeadingh3" style="font-size: 20px; margin-bottom: 0px;">Name:</h3>
                              <p class="infoPara mb-5"style="font-size: 18px; margin-bottom: 0px;">${
                                formData.fullname
                              } ${formData.lastname}</p>
                          </div>
                          <div class="informationDiv">
                              <h3 class="infoHeadingh3" style="font-size: 20px; margin-bottom: 0px;">Email:</h3>
                              <p class="infoPara mb-5" style="font-size: 18px; margin-bottom: 0px;">${
                                formData.email
                              }</p>
                          </div>
                           <div class="informationDiv">
                              <h3 class="infoHeadingh3" style="font-size: 20px; margin-bottom: 0px;">Phone No:</h3>
                              <p class="infoPara mb-5" style="font-size: 18px; margin-bottom: 0px;">${
                                formData.country_code
                              } ${formData.phone}</p>
                          </div>
                          <div class="informationDiv" >
                              <h3 class="infoHeadingh3" style="font-size: 20px; margin-bottom: 0px;">Billing Address:</h3>
                              <p style="font-size: 18px; margin-bottom: 0px;"> ${
                                formData.address
                              }, ${formData.city} - ${formData.zipcode} - ${
      formData.country
    }</p>
                          </div>
                          <div class="paymentDiv" style="">
                              <h2 class="text-18-medium color-text mb-" style="font-size: 26px; margin-bottom: 10px;">Total Payment:</h2>
                              
                                  <h5 class="infoHeadingh5"> (S$): ${amount}</h5>
                          </div>
                 
                  <div class="bottomInvoice">
                      <a href="https://www.abc.com">www.abc.com</a> | 
                      <a href="mailto:ask@privacelimo.com">ask@privacelimo.com</a> | 
                      <a href="tel:+6588573797">+65 8857 3797</a>
                  </div>
              </div>
          </div>
      </div>
  </body>
  
  </html>
  
      `;

    // Send the receipt via email
    // let transporter = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: "shahzaibsheikh366@gmail.com", // Replace with your email
    //     pass: "zjhr yeuh akum pthu", // Replace with your email password or app-specific password
    //   },
    //   logger: true, // Enable logging
    //   debug: true, // Enable debug output
    // });

    // Send the receipt via email

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
      debug: true,
    });

    // The following line must be inside an async function
    const info = await transporter.sendMail({
      from: "ask@privacelimo.com",
      to: formData.email,
      subject: "Your Payment Receipt (Privace Limousine Transportation)",
      html: receiptHtml,
    });

    const info2 = await transporter.sendMail({
      from: "ask@privacelimo.com",
      to: "ask@privacelimo.com",
      subject: `${formData.bookrefno} Payment Received (Privace Limousine Transportation)`, // Different subject for internal notification
      html: receiptHtml,
    });

    console.log("Receipt sent: " + info.response);

    res.json({ success: true, charge });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};





// Function to generate booking number
function generateBookingNumber() {
  const prefix = "Privace";
  const min = 1000;
  const max = 90000;
  const randomNumber = Math.floor(min + Math.random() * (max - min));
  return `${prefix}-${randomNumber}`;
}

let handleBooking = async (req, res) => {
  const {
    fname,
    lname,
    email,
    countrycode,
    phoneno,
    bookingdate,
    bookingtime,
    limousineservice,
    pickupaddress,
    dropoffaddress,
    noOfpassengers,
    fleetType,
    flightno,
    noOfLuggage,
    noOfHours,
    notesToDriver,
  } = req.body;

  let bookingNumber;
  let unique = false;

  // Loop to generate a unique booking number
  while (!unique) {
    bookingNumber = generateBookingNumber();

    // Check if booking number already exists in Firestore
    const snapshot = await db
      .collection("bookingnumbers")
      .where("bookingNumber", "==", bookingNumber)
      .get();

    if (snapshot.empty) {
      // Booking number does not exist, proceed
      unique = true;
    }
  }

  // Store only the booking number in Firestore
  try {
    await db.collection("bookingnumbers").add({
      bookingNumber,
    });

    // Email content
    let mailOptions = {
      from: "ask@privacelimo.com",
      to: "ask@privacelimo.com",
      subject: "New Booking Request",
      text: `
          Booking Number: ${bookingNumber}
          Name: ${fname} ${lname}
          Email: ${email}
          Phone Number: ${countrycode} ${phoneno}
          Booking Date: ${bookingdate}
          Booking Time: ${bookingtime}
          Limousine Service: ${limousineservice}
          Pick Up Address: ${pickupaddress}
          Drop Off Address: ${dropoffaddress}
          Number Of Passengers: ${noOfpassengers}
          Fleet Type: ${fleetType}
          Flight No.: ${flightno}
          No. of Luggage: ${noOfLuggage}
          No. of Hours: ${noOfHours}
          Notes to Driver: ${notesToDriver}
        `,
    };

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true,
      debug: true,
    });

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Booking request sent successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to store booking or send the email." });
  }
};



let handleContact = async (req, res) => {
  const { fullname, email, subject, message } = req.body;

  // Email content
  let mailOptions = {
    from: "ask@privacelimo.com",
    to: "ask@privacelimo.com",
    subject: "Contact Form Query from (Privace Limousine Transportation",
    text: `
          Name: ${fullname}
          Email: ${email}
          Subject: ${subject}
          Message: ${message}
        `,
  };

  // Nodemailer setup
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
  });

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Booking request sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send the booking request." });
  }
};



module.exports = { handlePayment, handleBooking, handleContact };