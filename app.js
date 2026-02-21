// Supabase config
const SUPABASE_URL = 'https://afhwwxvtlqhljpzroogf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaHd3eHZ0bHFobGpwenJvb2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDQ3OTEsImV4cCI6MjA4NzI4MDc5MX0.WUuECOjaIWEI5mvd8gbj1Neh8vlvX7jUGm435GTuBR4';

// Paystack config
const PAYSTACK_KEY = 'pk_test_fb621fb09c655330ab0479ad1f0350b76668078b';

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
    alert(`Booking confirmed! 🎉 Thank you ${name}, your appointment has been secured. We'll be in touch shortly.`);
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('service').value = '';
    document.getElementById('date').value = '';
    document.getElementById('time').value = '';
    document.getElementById('message').value = '';
  } else {
    const error = await res.json();
    console.log('Supabase error:', error);
    alert('Error: ' + JSON.stringify(error));
  }
}

// Booking form
const bookBtn = document.getElementById('bookBtn');

if (bookBtn) {
  bookBtn.addEventListener('click', function () {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !phone || !service || !date || !time) {
      alert('Please fill in all required fields!');
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
          { display_name: 'Service', variable_name: 'service', value: service },
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