document.getElementById('login-btn').addEventListener('click', async function() {
  const idInput = document.getElementById('signin-id');
  const errorDiv = document.getElementById('error-text');
  const loadingDiv = document.getElementById('loading');
  errorDiv.textContent = '';
  loadingDiv.style.display = 'block';

  const id = idInput.value.trim();
  if (!id) {
    errorDiv.textContent = 'Please enter your sign-in code.';
    loadingDiv.style.display = 'none';
    return;
  }

  try {
    const response = await fetch('/api/login', { // <-- FIXED HERE
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id})
    });
    const data = await response.json();
    loadingDiv.style.display = 'none';

    if (data.success) {
      localStorage.setItem('userId', id); // For session
      window.location.href = 'dashboard.html';
    } else {
      errorDiv.textContent = data.message || 'Access denied. Only managers and property experts can sign in.';
    }
  } catch (err) {
    errorDiv.textContent = 'Network error. Please try again.';
    loadingDiv.style.display = 'none';
  }
});

document.getElementById('close-btn').addEventListener('click', function() {
  window.close(); // May not work on all browsers
});
