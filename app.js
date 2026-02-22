// Supabase config
const SUPABASE_URL = 'https://afhwwxvtlqhljpzroogf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaHd3eHZ0bHFobGpwenJvb2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDQ3OTEsImV4cCI6MjA4NzI4MDc5MX0.WUuECOjaIWEI5mvd8gbj1Neh8vlvX7jUGm435GTuBR4';

// Paystack config
const PAYSTACK_KEY = 'pk_test_fb621fb09c655330ab0479ad1f0350b76668078b';

// EmailJS config — replace these with your actual values
const EMAILJS_SERVICE_ID = 'service_15x5mw8';
const EMAILJS_TEMPLATE_ID = 'template_ujlhyem';
const EMAILJS_PUBLIC_KEY = 'wxzU5CQKCW_jFkSEk';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Navbar shadow on scroll
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }
});

// Send confirmation email
async function sendConfirmationEmail(name, email, service, date, time) {
  const templateParams = {
    client_name: name,
    client_email: email,
    services: service,
    date: date,
    time: time
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.log('Confirmation email sent!');
  } catch (error) {
    console.log('Email error:', error);
  }
}

// Save booking to Supabase
async function saveBooking(name, email, phone, service, date, time, message) {
  const booking = {
    name,
    email,
    phone,
    service,
    date,
    time,
    message,
    payment_status: 'paid',
    created_at: new Date().toISOString()
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(booking)
  });

  if (res.ok) {
    await sendConfirmationEmail(name, email, service, date, time);
    alert(`Booking confirmed! 🎉 Thank you ${name}, your appointment has been secured. A confirmation email has been sent to ${email}.`);
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('date').value = '';
    document.getElementById('time').value = '';
    document.getElementById('message').value = '';
    document.querySelectorAll('input[name="service"]:checked').forEach(cb => cb.checked = false);
  } else {
    const error = await res.json();
    console.log('Supabase error:', error);
    alert('Payment successful but booking could not be saved. Please contact us directly.');
  }
}

// Booking form
const bookBtn = document.getElementById('bookBtn');

if (bookBtn) {
  bookBtn.addEventListener('click', function () {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value.trim();

    const checkedServices = [...document.querySelectorAll('input[name="service"]:checked')].map(cb => cb.value);
    const service = checkedServices.join(', ');

    if (!name || !email || !phone || checkedServices.length === 0 || !date || !time) {
      alert('Please fill in all required fields and select at least one service!');
      return;
    }

    const handler = PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: email,
      amount: 500000,
      currency: 'NGN',
      ref: 'MF_' + Math.floor(Math.random() * 1000000000),
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: name },
          { display_name: 'Services', variable_name: 'services', value: service },
          { display_name: 'Date', variable_name: 'date', value: date }
        ]
      },
      callback: function (response) {
        saveBooking(name, email, phone, service, date, time, message);
      },
      onClose: function () {
        alert('Payment was not completed. Your booking has not been confirmed.');
      }
    });

    handler.openIframe();
  });
}