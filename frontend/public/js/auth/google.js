// js/auth/google.js
const GOOGLE_CLIENT_ID = "754770143659-o1s7g437emffuo7goi7pime6chqf6cp5.apps.googleusercontent.com";

window.onload = function() {
  const googleBtn = document.getElementById('googleBtn');
  const errorEl = document.getElementById('error');

  if (!window.google) {
    console.error('Google SDK not loaded yet');
    errorEl.textContent = 'Google login unavailable.';
    errorEl.classList.remove('hidden');
    return;
  }

  // Initialize Google OAuth
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleLogin
  });

  // Render the button
  google.accounts.id.renderButton(googleBtn, {
    theme: 'outline',
    size: 'large',
    width: '200'
  });

  // Optional: trigger One Tap prompt manually
  googleBtn.addEventListener('click', () => google.accounts.id.prompt());

  async function handleGoogleLogin(response) {
    try {
      console.log('Google ID token:', response.credential);

      // send to backend
      const res = await fetch(`https://whisp-backend-jle2.onrender.com/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential })
      }).then(r => r.json());

      if (!res.token) throw new Error('Login failed');

      window.saveSession(res.token, res.user);
      window.location.href = 'chat.html';
    } catch (err) {
      console.error(err);
      errorEl.textContent = 'Google login failed. Try again.';
      errorEl.classList.remove('hidden');
    }
  }
};
