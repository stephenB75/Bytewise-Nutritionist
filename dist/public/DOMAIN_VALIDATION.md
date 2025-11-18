# Domain Validation System

This app includes a configurable domain validation system that ensures the application only runs on approved domains.

## Configuration

Domain validation is configured via `/domain-config.json`. This file contains:

### Configuration Options

- **`allowedDomains`** (array): List of exact domain names that are allowed
  - Example: `["bytewisenutritionist.com", "www.bytewisenutritionist.com"]`

- **`allowedSubdomains`** (array): List of subdomain patterns that are allowed
  - Example: `["app.bytewisenutritionist.com", "staging.bytewisenutritionist.com"]`

- **`developmentDomains`** (array): Domains considered safe for development
  - Default includes: `localhost`, `127.0.0.1`, `0.0.0.0`
  - Automatically detects local IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

- **`validationMode`** (string): How to handle invalid domains
  - `"warning"` - Show warning banner but allow app to run (default)
  - `"error"` - Block app from running
  - `"silent"` - Only log to console

- **`strictMode`** (boolean): If `true`, always blocks invalid domains regardless of `validationMode`
  - Default: `false`

- **`logValidation`** (boolean): Whether to log validation results to console
  - Default: `true`

## How It Works

1. On page load, the validator checks the current domain
2. Compares against allowed domains, subdomains, and development domains
3. Takes action based on `validationMode` and `strictMode` settings
4. Stores validation result in `window.__DOMAIN_VALIDATION__` for app access

## Usage in Your App

Access validation status in your application code:

```javascript
// Check if domain is valid
if (window.__DOMAIN_VALIDATION__) {
  const validation = window.__DOMAIN_VALIDATION__;
  
  if (validation.isValid) {
    console.log('Domain validated:', validation.currentDomain);
    console.log('Match type:', validation.matchType);
    console.log('Is development:', validation.isDevelopment);
  } else {
    console.warn('Domain not validated:', validation.message);
  }
}

// Or use the DomainValidator API
if (window.DomainValidator) {
  const status = window.DomainValidator.getStatus();
  // Use status...
}
```

## Updating Allowed Domains

To add or remove allowed domains, edit `/domain-config.json`:

```json
{
  "allowedDomains": [
    "bytewisenutritionist.com",
    "www.bytewisenutritionist.com",
    "your-new-domain.com"
  ],
  "allowedSubdomains": [
    "app.bytewisenutritionist.com",
    "staging.bytewisenutritionist.com"
  ],
  "validationMode": "warning",
  "strictMode": false,
  "logValidation": true
}
```

## Validation Modes

### Warning Mode (Default)
- Shows a dismissible warning banner at the top of the page
- App continues to function normally
- Best for production environments where you want to alert but not block

### Error Mode
- Completely blocks the app from loading
- Shows a full-page error message
- Use when domain validation is critical

### Silent Mode
- Only logs to browser console
- No user-visible warnings
- Useful for development or when you want minimal disruption

## Development

When running locally (localhost, 127.0.0.1, or local IP), the validator automatically treats these as valid development domains, so the app will work normally during development.

## Security Notes

- Domain validation runs client-side and can be bypassed by determined users
- For true security, also implement server-side domain validation
- This system is primarily for preventing accidental misconfigurations and providing warnings
- Always use HTTPS in production to prevent domain spoofing

## Troubleshooting

**App blocked on valid domain:**
- Check `domain-config.json` includes your domain
- Verify domain spelling (case-insensitive)
- Check browser console for validation logs

**Warning banner appears on valid domain:**
- Ensure domain is in `allowedDomains` or `allowedSubdomains`
- Check for typos in configuration
- Verify subdomain matching logic if using subdomains

**Validation not running:**
- Check browser console for errors
- Verify `/domain-config.json` is accessible
- Ensure `/domain-validator.js` is loaded in `index.html`

