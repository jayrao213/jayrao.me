document.getElementById('contact-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const statusDiv = document.getElementById('form-status');
  const submitButton = form.querySelector("button[type='submit']");

  const honeypot = document.getElementById('website').value;
  if (honeypot) {
    statusDiv.textContent = 'Spam detected. Submission blocked.';
    statusDiv.className = 'error';
    return;
  }

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      showMessage("Thank you for your message!", "success");

      submitButton.classList.add("slide-out");

      setTimeout(() => {
        submitButton.classList.remove("slide-out");
        submitButton.classList.add("slide-in");

        setTimeout(() => {
          submitButton.classList.remove("slide-in");
        }, 600);
      }, 2500);

      form.reset();
    } else {
      showMessage("Oops! Something went wrong.", "error");
    }
  } catch (error) {
    showMessage("Oops! Network error.", "error");
  }
});

function showMessage(message, type) {
  const statusDiv = document.getElementById('form-status');
  statusDiv.className = type;
  statusDiv.innerText = message;
  statusDiv.style.opacity = "0"; 

  setTimeout(() => {
    statusDiv.style.opacity = "1";
  }, 10); 

  setTimeout(() => {
    statusDiv.style.opacity = "0";
  }, 4000);
}