// js/auth/guard.js

window.onload = function() {
  const path = window.location.pathname;

  if (window.isLoggedIn()) {
    // If user is logged in, redirect away from login page
    if (path === '/' || path.endsWith('index.html')) {
      window.location.href = 'chat.html';
    }
  } else {
    // If user is NOT logged in, prevent access to chat
    if (path.endsWith('chat.html') || path.endsWith('profile.html')) {
      window.location.href = 'index.html';
    }
  }
};
