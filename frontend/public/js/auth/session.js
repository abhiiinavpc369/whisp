// js/auth/session.js

window.saveSession = function(token, user) {
  localStorage.setItem('whispToken', token);
  localStorage.setItem('whispUser', JSON.stringify(user));
};

window.getToken = function() {
  return localStorage.getItem('whispToken');
};

window.getUser = function() {
  const user = localStorage.getItem('whispUser');
  return user ? JSON.parse(user) : null;
};

window.isLoggedIn = function() {
  return !!window.getToken();
};

window.clearSession = function() {
  localStorage.removeItem('whispToken');
  localStorage.removeItem('whispUser');
};
