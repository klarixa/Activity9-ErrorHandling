// W3.5 Activity 9: Robust Error Handling and Retry Logic Implementation

class ErrorHandler {
    constructor() {
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalRetries: 0,
            responseTimes: [],
            errorTypes: {}
        };


        this.circuitBreakerState = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: null,
            threshold: 3,
            timeout: 30000
        };

        this.currentRequest = {
            status: 'ready',
            attempt: 0,
            maxAttempts: 0,
            nextRetryTime: null
        };

        this.logEntries = [];
        this.initializeSettings();
        this.initTheme();
    }

    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.log(`Theme switched to ${newTheme} mode`, 'info');
        });
    }

    initializeSettings() {
        this.maxRetries = 3;
        this.baseDelay = 1000;
        this.backoffType = 'exponential';
        this.requestTimeout = 5000;

        this.updateStats();
        this.updateCurrentRequest();
    }

    // Error Scenario Simulators (Pre-built for testing)

    async testNetworkTimeout() {
        this.log('Testing network timeout scenario...', 'info');
        await this.makeRequestWithRetry('timeout', 'Network Timeout Test');
    }

    async testServerError() {
        this.log('Testing server error (500) scenario...', 'info');
        await this.makeRequestWithRetry('server-error', 'Server Error Test');
    }

    async testRateLimiting() {
        this.log('Testing rate limiting (429) scenario...', 'info');
        await this.makeRequestWithRetry('rate-limit', 'Rate Limiting Test');
    }

    async testUnauthorized() {
        this.log('Testing unauthorized (401) scenario...', 'info');
        await this.makeRequestWithRetry('unauthorized', 'Unauthorized Test');
    }

    async testNotFound() {
        this.log('Testing not found (404) scenario...', 'info');
        await this.makeRequestWithRetry('not-found', 'Not Found Test');
    }

    async testBadRequest() {
        this.log('Testing bad request (400) scenario...', 'info');
        await this.makeRequestWithRetry('bad-request', 'Bad Request Test');
    }



    async makeRequestWithRetry(errorType, requestName) {
        this.updateSettings();
        this.stats.totalRequests++;

        const startTime = Date.now();
        let attempt = 0;
        let lastError = null;

        this.currentRequest = {
            status: 'loading',
            attempt: 0,
            maxAttempts: this.maxRetries + 1,
            nextRetryTime: null
        };

        while (attempt <= this.maxRetries) {
            try {
                this.currentRequest.attempt = attempt + 1;
                this.updateCurrentRequest();

                this.log(`Attempt ${attempt + 1}/${this.maxRetries + 1} for ${requestName}...`, 'processing');

                if (this.isCircuitBreakerOpen()) {
                    throw new Error('Circuit breaker is open - blocking request');
                }

                const result = await this.simulateAPIRequest(errorType, attempt);

                const endTime = Date.now();
                this.stats.successfulRequests++;
                this.stats.responseTimes.push(endTime - startTime);

                this.resetCircuitBreaker();
                this.currentRequest.status = 'success';
                this.currentRequest.nextRetryTime = null;
                this.updateStats();
                this.updateCurrentRequest();

                this.log(`Successfully completed ${requestName}`, 'success');
                return result;

            } catch (error) {
                lastError = error;
                attempt++;

                // Track error types for health monitor
                const errorName = error.message.split(' (')[0] || error.message;
                this.stats.errorTypes[errorName] = (this.stats.errorTypes[errorName] || 0) + 1;

                this.incrementCircuitBreakerFailures();
                this.log(`Error: ${error.message}`, 'error');

                if (attempt <= this.maxRetries && this.isRetryableError(error)) {
                    this.stats.totalRetries++;
                    const delayMs = this.calculateBackoffDelay(attempt - 1);
                    this.currentRequest.nextRetryTime = Date.now() + delayMs;
                    this.currentRequest.status = 'retrying';

                    this.updateStats();
                    this.updateCurrentRequest();

                    this.log(`Retrying in ${delayMs}ms...`, 'warning');
                    await this.delay(delayMs);
                } else {
                    this.stats.failedRequests++;
                    this.currentRequest.status = 'failed';
                    this.currentRequest.nextRetryTime = null;
                    this.updateStats();
                    this.updateCurrentRequest();

                    this.log(`Request failed after ${attempt} attempts: ${error.message}`, 'error');
                    throw error;
                }
            }
        }
    }

    // API Request Simulator

    async simulateAPIRequest(errorType, attempt) {
        const requestTime = Math.random() * 2000 + 500; // 500-2500ms

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate different error scenarios
                switch (errorType) {
                    case 'timeout':
                        if (Math.random() < 0.7) { // 70% chance of timeout
                            reject(new Error('Request timeout'));
                        } else {
                            resolve({ data: 'Success after timeout risk', timestamp: Date.now() });
                        }
                        break;

                    case 'server-error':
                        if (Math.random() < 0.6) { // 60% chance of server error
                            reject(new Error('Internal Server Error (500)'));
                        } else {
                            resolve({ data: 'Server recovered', timestamp: Date.now() });
                        }
                        break;

                    case 'rate-limit':
                        if (attempt < 2) { // Fail first 2 attempts
                            reject(new Error('Too Many Requests (429)'));
                        } else {
                            resolve({ data: 'Rate limit cleared', timestamp: Date.now() });
                        }
                        break;

                    case 'unauthorized':
                        // Non-retryable error
                        reject(new Error('Unauthorized (401) - Invalid credentials'));
                        break;

                    case 'not-found':
                        // Non-retryable error
                        reject(new Error('Not Found (404) - Resource does not exist'));
                        break;

                    case 'bad-request':
                        // Non-retryable error
                        reject(new Error('Bad Request (400) - Invalid request format'));
                        break;

                    default:
                        resolve({ data: 'Default success response', timestamp: Date.now() });
                }
            }, requestTime);
        });
    }

    // Backoff Strategies (Pre-built)

    calculateBackoffDelay(attemptNumber) {
        switch (this.backoffType) {
            case 'exponential':
                return this.baseDelay * Math.pow(2, attemptNumber);

            case 'linear':
                return this.baseDelay * (attemptNumber + 1);

            case 'fixed':
                return this.baseDelay;

            default:
                return this.baseDelay;
        }
    }



    isRetryableError(error) {
        const retryablePatterns = [
            /timeout/i,
            /500/,
            /502/,
            /503/,
            /504/,
            /429/,
            /network/i,
            /connection/i
        ];

        const nonRetryablePatterns = [
            /400/,
            /401/,
            /403/,
            /404/,
            /422/
        ];

        // Check non-retryable patterns first
        if (nonRetryablePatterns.some(pattern => pattern.test(error.message))) {
            return false;
        }

        // Check retryable patterns
        if (retryablePatterns.some(pattern => pattern.test(error.message))) {
            return true;
        }

        return false;
    }



    isCircuitBreakerOpen() {
        if (this.circuitBreakerState.isOpen) {
            const timeSinceLastFailure = Date.now() - this.circuitBreakerState.lastFailureTime;

            if (timeSinceLastFailure >= this.circuitBreakerState.timeout) {
                this.log('Circuit breaker entering recovery mode (half-open)', 'info');
                this.resetCircuitBreaker();
                return false;
            }
            return true;
        }
        return false;
    }

    incrementCircuitBreakerFailures() {
        this.circuitBreakerState.failureCount++;
        this.circuitBreakerState.lastFailureTime = Date.now();

        if (this.circuitBreakerState.failureCount >= this.circuitBreakerState.threshold) {
            this.circuitBreakerState.isOpen = true;
            this.log(`🚨 Circuit breaker opened after ${this.circuitBreakerState.failureCount} failures`, 'error');
        }
    }

    resetCircuitBreaker() {
        this.circuitBreakerState.failureCount = 0;
        this.circuitBreakerState.isOpen = false;
        this.circuitBreakerState.lastFailureTime = null;
    }

    // Pattern Demonstrations (Pre-built)

    async demonstrateRetryPattern() {
        this.log('🔄 Demonstrating Retry with Exponential Backoff pattern...', 'info');
        this.backoffType = 'exponential';
        this.maxRetries = 3;
        this.baseDelay = 1000;
        this.updateSettingsDisplay();
        await this.testServerError();
    }

    async demonstrateCircuitBreaker() {
        this.log('🔀 Demonstrating Circuit Breaker pattern...', 'info');

        // Trigger multiple failures to open circuit breaker
        for (let i = 0; i < 3; i++) {
            try {
                await this.testServerError();
            } catch (error) {
                // Expected failures
            }
        }

        // Try request when circuit breaker is open
        try {
            await this.testServerError();
        } catch (error) {
            this.log('Circuit breaker prevented request execution', 'warning');
        }
    }



    async demonstrateFallback() {
        this.log('🎯 Demonstrating Fallback Strategy pattern...', 'info');

        try {
            // Try primary API request (using a likely to fail scenario)
            await this.makeRequestWithRetry('server-error', 'Primary API Request');
        } catch (error) {
            this.log(`Primary request failed: ${error.message}. Activating fallback...`, 'warning');

            const fallbackData = {
                data: 'Default cached or static data',
                source: 'fallback',
                timestamp: Date.now(),
                fallback: true
            };

            this.log('Fallback data successfully retrieved', 'success');
            return fallbackData;
        }
    }

    async demonstrateTimeout() {
        this.log('⏰ Demonstrating Timeout Handling pattern...', 'info');
        this.requestTimeout = 2000; // Short timeout
        await this.testNetworkTimeout();
    }

    // Utility Methods

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateSettings() {
        this.maxRetries = parseInt(document.getElementById('maxRetries').value);
        this.baseDelay = parseInt(document.getElementById('baseDelay').value);
        this.backoffType = document.getElementById('backoffType').value;
        this.requestTimeout = parseInt(document.getElementById('requestTimeout').value);
    }

    updateSettingsDisplay() {
        document.getElementById('maxRetries').value = this.maxRetries;
        document.getElementById('baseDelay').value = this.baseDelay;
        document.getElementById('backoffType').value = this.backoffType;
        document.getElementById('requestTimeout').value = this.requestTimeout;
    }

    // UI Updates

    updateStats() {
        document.getElementById('totalRequests').textContent = this.stats.totalRequests;
        document.getElementById('successfulRequests').textContent = this.stats.successfulRequests;
        document.getElementById('failedRequests').textContent = this.stats.failedRequests;
        document.getElementById('totalRetries').textContent = this.stats.totalRetries;

        const successRate = this.stats.totalRequests > 0
            ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(1)
            : 0;
        document.getElementById('successRate').textContent = `${successRate}%`;

        const avgResponseTime = this.stats.responseTimes.length > 0
            ? Math.round(this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length)
            : 0;
        document.getElementById('avgResponseTime').textContent = `${avgResponseTime}ms`;

        // Update Circuit Status
        const circuitEl = document.getElementById('circuitStatus');
        if (this.circuitBreakerState.isOpen) {
            circuitEl.textContent = 'OPEN';
            circuitEl.style.color = 'var(--error)';
        } else {
            circuitEl.textContent = 'CLOSED';
            circuitEl.style.color = 'var(--success)';
        }

        // Update Error Distribution
        const distEl = document.getElementById('errorDistribution');
        const distText = Object.entries(this.stats.errorTypes)
            .map(([type, count]) => `${type}: ${count}`)
            .join(' | ') || 'None';
        distEl.textContent = distText;
    }

    updateCurrentRequest() {
        document.getElementById('currentStatus').textContent = this.currentRequest.status;
        document.getElementById('currentStatus').className = `request-status ${this.currentRequest.status}`;

        document.getElementById('currentAttempt').textContent =
            `${this.currentRequest.attempt}/${this.currentRequest.maxAttempts}`;

        if (this.currentRequest.nextRetryTime) {
            const delay = Math.max(0, this.currentRequest.nextRetryTime - Date.now());
            document.getElementById('nextRetry').textContent = `${Math.round(delay)}ms`;
        } else {
            document.getElementById('nextRetry').textContent = '-';
        }

        // Update progress bar
        const progress = this.currentRequest.maxAttempts > 0
            ? (this.currentRequest.attempt / this.currentRequest.maxAttempts) * 100
            : 0;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    // Logging

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, message, type };

        this.logEntries.push(logEntry);

        // Keep only last 50 entries
        if (this.logEntries.length > 50) {
            this.logEntries.shift();
        }

        this.renderLog();
    }

    renderLog() {
        const logContainer = document.getElementById('errorLog');
        const entries = this.logEntries.slice(-20); // Show only last 20 entries

        logContainer.innerHTML = entries.map(entry => `
            <div class="log-entry ${entry.type}">
                <span class="timestamp">${entry.timestamp}</span>
                <span class="message">${entry.message}</span>
            </div>
        `).join('');

        // Auto-scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    clearLog() {
        this.logEntries = [];
        document.getElementById('errorLog').innerHTML = `
            <div class="log-entry welcome">
                <span class="timestamp">Ready</span>
                <span class="message">Log cleared. Ready for new error handling tests.</span>
            </div>
        `;
    }

    exportLog() {
        const logData = this.logEntries.map(entry =>
            `${entry.timestamp} [${entry.type.toUpperCase()}] ${entry.message}`
        ).join('\n');

        const blob = new Blob([logData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.log('Error log exported successfully', 'success');
    }
}

// Initialize error handler when DOM is loaded
let errorHandler;

document.addEventListener('DOMContentLoaded', () => {
    errorHandler = new ErrorHandler();
});

// Error handling utility functions for educational purposes
const ErrorUtils = {
    // Retry function with different strategies
    async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000, backoffType = 'exponential') {
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt === maxRetries) break;

                const delay = this.calculateDelay(attempt, baseDelay, backoffType);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    },

    // Calculate delay based on backoff strategy
    calculateDelay(attempt, baseDelay, backoffType) {
        switch (backoffType) {
            case 'exponential':
                return baseDelay * Math.pow(2, attempt);
            case 'linear':
                return baseDelay * (attempt + 1);
            case 'fixed':
                return baseDelay;
            default:
                return baseDelay;
        }
    },

    // Timeout wrapper
    async withTimeout(promise, timeoutMs) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });

        return Promise.race([promise, timeoutPromise]);
    },

    // Circuit breaker implementation
    createCircuitBreaker(fn, threshold = 3, timeout = 30000) {
        let failureCount = 0;
        let lastFailureTime = null;
        let isOpen = false;

        return async (...args) => {
            if (isOpen) {
                const timeSinceLastFailure = Date.now() - lastFailureTime;
                if (timeSinceLastFailure < timeout) {
                    throw new Error('Circuit breaker is open');
                }
                isOpen = false; // Try half-open state
            }

            try {
                const result = await fn(...args);
                failureCount = 0; // Reset on success
                return result;
            } catch (error) {
                failureCount++;
                lastFailureTime = Date.now();

                if (failureCount >= threshold) {
                    isOpen = true;
                }

                throw error;
            }
        };
    }
};