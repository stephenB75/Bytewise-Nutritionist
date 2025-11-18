# Troubleshooting: App Not Loading on Domain

## Issue: App not loading on bytewisenutritionist.com

### Quick Fixes Applied

1. **Domain Validator Made Non-Blocking**
   - Updated validator to use `defer` attribute
   - Added error handling to prevent blocking app load
   - Validator now defaults to allowing app if validation fails

2. **Improved Error Handling**
   - Validator won't crash if config file can't be loaded
   - Falls back to permissive defaults if needed
   - App will always load even if validator has issues

### Verification Steps

1. **Check Domain Configuration**
   ```bash
   # Verify domain is in allowed list
   cat dist/public/domain-config.json | grep bytewisenutritionist
   ```

2. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Look for domain validation messages

3. **Check Network Tab**
   - Verify `domain-config.json` loads successfully
   - Verify `domain-validator.js` loads successfully
   - Check for 404 errors

4. **Check Service Worker**
   - DevTools → Application → Service Workers
   - Verify service worker is registered
   - Check for service worker errors

### Common Issues

#### Issue 1: Domain Validator Blocking App
**Symptom:** Blank page or error page
**Solution:** Validator now uses `defer` and won't block app load

#### Issue 2: Config File Not Loading
**Symptom:** Console shows "Could not load domain-config.json"
**Solution:** Validator falls back to permissive defaults

#### Issue 3: Service Worker Issues
**Symptom:** App doesn't load or shows offline page
**Solution:** 
- Clear service worker cache
- Unregister service worker
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

#### Issue 4: HTTPS/SSL Issues
**Symptom:** Mixed content errors
**Solution:** Ensure all resources load over HTTPS

### Debug Commands

```javascript
// In browser console, check domain validation status
console.log(window.__DOMAIN_VALIDATION__);

// Check if validator loaded
console.log(window.DomainValidator);

// Check current domain
console.log(window.location.hostname);

// Force reload config
if (window.DomainValidator) {
  window.DomainValidator.loadConfig().then(() => {
    window.DomainValidator.validate();
    console.log(window.DomainValidator.getStatus());
  });
}
```

### Testing Checklist

- [ ] Domain is in `domain-config.json` allowedDomains
- [ ] `validationMode` is set to "warning" (not "error")
- [ ] `strictMode` is set to `false`
- [ ] Domain validator script loads (check Network tab)
- [ ] Config file loads (check Network tab)
- [ ] No JavaScript errors in console
- [ ] Service worker is registered
- [ ] HTTPS is enabled (for production)

### If App Still Doesn't Load

1. **Temporarily Disable Domain Validator**
   - Comment out the script tag in `index.html`:
   ```html
   <!-- <script src="/domain-validator.js" defer></script> -->
   ```

2. **Check for Other Errors**
   - Look for errors in main app bundle
   - Check for CORS issues
   - Verify API endpoints are accessible

3. **Verify Deployment**
   - Ensure all files are deployed
   - Check file permissions
   - Verify web server configuration

### Current Configuration

- **Allowed Domains:** bytewisenutritionist.com, www.bytewisenutritionist.com
- **Validation Mode:** warning (shows banner, doesn't block)
- **Strict Mode:** false (allows flexibility)
- **Script Loading:** defer (non-blocking)

The app should now load on bytewisenutritionist.com even if domain validation has issues.

