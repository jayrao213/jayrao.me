class ErrorBoundary {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
  }

  handleError(event) {
    console.error('Error caught by boundary:', event.error);
    this.showErrorUI('An error occurred. Please refresh the page.');
  }

  handlePromiseError(event) {
    console.error('Promise error caught by boundary:', event.reason);
    this.showErrorUI('An error occurred. Please refresh the page.');
  }

  showErrorUI(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999;
      text-align: center;
      max-width: 80%;
    `;
    
    errorDiv.innerHTML = `
      <h3>Oops! Something went wrong</h3>
      <p>${message}</p>
      <button onclick="window.location.reload()" style="
        background: #4CAF50;
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      ">Refresh Page</button>
    `;
    
    document.body.appendChild(errorDiv);
  }
}

// Initialize error boundary
new ErrorBoundary(); 