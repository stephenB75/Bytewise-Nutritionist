/**
 * Domain Validation System for Bytewise Nutritionist
 * Validates that the app is running on an allowed domain
 * Configuration is loaded from domain-config.json
 */

(function() {
  'use strict';

  const DomainValidator = {
    config: null,
    currentDomain: null,
    isValid: false,
    validationResult: null,

    /**
     * Initialize domain validation
     */
    async init() {
      try {
        // Get current domain
        this.currentDomain = window.location.hostname;

        // Load configuration
        await this.loadConfig();

        // Perform validation
        this.validate();

        // Log results if enabled
        if (this.config.logValidation) {
          this.logValidationResult();
        }

        // Handle validation result
        this.handleValidationResult();

        return this.validationResult;
      } catch (error) {
        console.error('[DomainValidator] Initialization error:', error);
        return {
          isValid: false,
          error: error.message,
          currentDomain: this.currentDomain
        };
      }
    },

    /**
     * Load configuration from domain-config.json
     */
    async loadConfig() {
      try {
        const response = await fetch('/domain-config.json');
        if (!response.ok) {
          throw new Error(`Failed to load domain config: ${response.status}`);
        }
        this.config = await response.json();
      } catch (error) {
        console.warn('[DomainValidator] Could not load domain-config.json, using defaults');
        // Fallback to default configuration
        this.config = {
          allowedDomains: [],
          allowedSubdomains: [],
          developmentDomains: ['localhost', '127.0.0.1', '0.0.0.0'],
          validationMode: 'warning',
          strictMode: false,
          logValidation: true
        };
      }
    },

    /**
     * Validate current domain against configuration
     */
    validate() {
      const domain = this.currentDomain.toLowerCase();
      const allAllowedDomains = [
        ...(this.config.allowedDomains || []),
        ...(this.config.allowedSubdomains || []),
        ...(this.config.developmentDomains || [])
      ].map(d => d.toLowerCase());

      // Check exact match
      if (allAllowedDomains.includes(domain)) {
        this.isValid = true;
        this.validationResult = {
          isValid: true,
          currentDomain: this.currentDomain,
          matchedDomain: domain,
          matchType: 'exact',
          isDevelopment: this.isDevelopmentDomain(domain)
        };
        return;
      }

      // Check subdomain match
      for (const allowedDomain of this.config.allowedDomains || []) {
        if (domain.endsWith('.' + allowedDomain.toLowerCase())) {
          this.isValid = true;
          this.validationResult = {
            isValid: true,
            currentDomain: this.currentDomain,
            matchedDomain: allowedDomain,
            matchType: 'subdomain',
            isDevelopment: false
          };
          return;
        }
      }

      // Check if it's a development domain pattern
      if (this.isDevelopmentDomain(domain)) {
        this.isValid = true;
        this.validationResult = {
          isValid: true,
          currentDomain: this.currentDomain,
          matchedDomain: domain,
          matchType: 'development',
          isDevelopment: true
        };
        return;
      }

      // Domain not allowed
      this.isValid = false;
      this.validationResult = {
        isValid: false,
        currentDomain: this.currentDomain,
        allowedDomains: this.config.allowedDomains || [],
        message: `Domain "${this.currentDomain}" is not in the allowed domains list`
      };
    },

    /**
     * Check if domain is a development domain
     */
    isDevelopmentDomain(domain) {
      const devDomains = (this.config.developmentDomains || []).map(d => d.toLowerCase());
      return devDomains.includes(domain) || 
             domain.includes('localhost') || 
             domain.includes('127.0.0.1') ||
             domain.includes('0.0.0.0') ||
             /^192\.168\./.test(domain) ||
             /^10\./.test(domain) ||
             /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(domain);
    },

    /**
     * Log validation result
     */
    logValidationResult() {
      const result = this.validationResult;
      
      if (result.isValid) {
        const emoji = result.isDevelopment ? '🔧' : '✅';
        console.log(
          `%c${emoji} Domain Validated`,
          'color: #10b981; font-weight: bold; font-size: 12px;',
          `\nDomain: ${result.currentDomain}\nMatch Type: ${result.matchType}\nDevelopment: ${result.isDevelopment}`
        );
      } else {
        console.warn(
          '%c⚠️ Domain Validation Warning',
          'color: #f59e0b; font-weight: bold; font-size: 12px;',
          `\nCurrent Domain: ${result.currentDomain}\nAllowed Domains: ${result.allowedDomains.join(', ')}\n${result.message}`
        );
      }
    },

    /**
     * Handle validation result based on mode
     */
    handleValidationResult() {
      if (this.isValid) {
        // Store validation result for app to use
        window.__DOMAIN_VALIDATION__ = this.validationResult;
        return;
      }

      // Invalid domain handling
      const mode = this.config.validationMode || 'warning';
      const strict = this.config.strictMode || false;

      if (strict || mode === 'error') {
        // Block the app from running
        this.showErrorPage();
      } else if (mode === 'warning') {
        // Show warning but allow app to continue
        this.showWarning();
        window.__DOMAIN_VALIDATION__ = this.validationResult;
      } else {
        // Silent mode - just log
        window.__DOMAIN_VALIDATION__ = this.validationResult;
      }
    },

    /**
     * Show error page for invalid domain
     */
    showErrorPage() {
      const body = document.body;
      body.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="
            background: white;
            border-radius: 1rem;
            padding: 3rem;
            max-width: 500px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            text-align: center;
          ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🚫</div>
            <h1 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.5rem;">
              Invalid Domain
            </h1>
            <p style="color: #6b7280; margin-bottom: 1.5rem; line-height: 1.6;">
              This application is configured to run only on specific domains.
            </p>
            <div style="
              background: #fef3c7;
              border: 1px solid #fbbf24;
              border-radius: 0.5rem;
              padding: 1rem;
              margin-bottom: 1.5rem;
              text-align: left;
            ">
              <p style="color: #92400e; margin: 0; font-size: 0.875rem;">
                <strong>Current Domain:</strong><br>
                <code style="background: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">
                  ${this.currentDomain}
                </code>
              </p>
              <p style="color: #92400e; margin: 1rem 0 0 0; font-size: 0.875rem;">
                <strong>Allowed Domains:</strong><br>
                ${(this.config.allowedDomains || []).map(d => 
                  `<code style="background: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; display: inline-block; margin: 0.25rem;">${d}</code>`
                ).join(' ')}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 0.875rem;">
              Please contact support if you believe this is an error.
            </p>
          </div>
        </div>
      `;
    },

    /**
     * Show warning banner for invalid domain
     */
    showWarning() {
      const warningBanner = document.createElement('div');
      warningBanner.id = 'domain-validation-warning';
      warningBanner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 0.75rem 1rem;
        text-align: center;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 999999;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      warningBanner.innerHTML = `
        <span>⚠️ Running on unverified domain: <strong>${this.currentDomain}</strong></span>
        <button onclick="this.parentElement.remove()" style="
          margin-left: 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.75rem;
        ">Dismiss</button>
      `;
      document.body.insertBefore(warningBanner, document.body.firstChild);
    },

    /**
     * Get current validation status
     */
    getStatus() {
      return this.validationResult;
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      DomainValidator.init();
    });
  } else {
    DomainValidator.init();
  }

  // Expose to window for app access
  window.DomainValidator = DomainValidator;
})();

