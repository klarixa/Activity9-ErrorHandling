# 🛡️ Activity 9: Error Handling and Retry Logic Patterns - Discovery Challenge

Welcome to the most important skill in production API development: building resilient applications that gracefully handle failures!

## 🎯 Learning Objectives

By completing this activity, you will:
- Implement intelligent retry logic with exponential backoff algorithms
- Understand different error types and appropriate handling strategies
- Build circuit breaker patterns to prevent cascading failures
- Create graceful degradation and fallback mechanisms
- Monitor error patterns and recovery effectiveness

## 🚀 Getting Started (See Results in 30 Seconds!)

**IMPORTANT: This template includes WORKING error handling patterns! Test them immediately:**

1. **Navigate to this folder** in your terminal/command prompt
2. **Start a local server**:
   ```bash
   # Mac/Linux:
   python3 -m http.server 8002

   # Windows:
   python -m http.server 8002

   # Alternative using Node.js:
   npx http-server -p 8002
   ```
3. **Open your browser** to: http://localhost:8002
4. **Click scenario buttons** to see error handling in action!
   - "Test Timeout" - See retry logic with exponential backoff
   - "Test Server Error" - Watch automatic recovery attempts
   - "Test Rate Limiting" - See intelligent backoff handling
   - "Test Unauthorized" - See non-retryable error handling

### 🎯 What's Already Working

**70% of the code is implemented for you:**
- ✅ Basic error simulation (network timeout, 500, 429, 401, 404, 400)
- ✅ Exponential backoff calculation
- ✅ Error classification (retryable vs non-retryable)
- ✅ Statistics tracking and UI updates
- ✅ Error logging system
- ⚠️ Retry mechanism implementation (TODO for you)
- ⚠️ Circuit breaker pattern (TODO for you)
- ⚠️ Health monitoring dashboard (TODO for you)

### 📝 Your Learning Tasks

1. **First, test the error scenarios** to see how different failures behave
2. **Study the error classification logic** (retryable vs non-retryable)
3. **Then implement the TODO sections** following the patterns provided
4. **Finally, test your implementations** with real-world scenarios

## 📋 Tasks to Complete

### TODO 1: Implement Retry Mechanism (Medium)
Complete the retry logic in `makeRequestWithRetry()` function.

**Requirements:**
- Retry only retryable errors (500, 502, 503, 504, 429, timeout)
- Do NOT retry client errors (400, 401, 403, 404)
- Use exponential backoff between retries
- Stop after max retries reached

**Success Criteria:**
- Timeout errors retry 3 times with increasing delays
- Server errors (500) retry automatically
- Auth errors (401) fail immediately without retry
- Statistics update correctly (totalRetries counter)

**Hint:** Check the `isRetryableError()` function for error classification

### TODO 2: Build Circuit Breaker Pattern (Hard)
Implement the circuit breaker to prevent cascading failures.

**Circuit Breaker States:**
- **Closed** (normal): Allow all requests
- **Open**: Block requests after threshold failures
- **Half-Open**: Test recovery after timeout period

**Requirements:**
- Track consecutive failures
- Open circuit after 3 failures
- Wait 30 seconds before testing recovery
- Reset failure count on success

**Success Criteria:**
- After 3 failures, circuit breaker opens
- Requests fail immediately when circuit is open
- Circuit automatically tests recovery after timeout
- Log shows "Circuit breaker opened" message

**Hint:** Study `circuitBreakerState` object and `isCircuitBreakerOpen()` function

### TODO 3: Implement Health Check Monitoring (Medium)
Add a dashboard to track API health and recovery patterns.

**Features to Build:**
- Success rate percentage display
- Average response time tracking
- Circuit breaker status indicator
- Recent error type distribution

**Success Criteria:**
- Success rate updates in real-time
- Circuit breaker status shows "Open" or "Closed"
- Error type breakdown shows which errors occur most
- Dashboard refreshes after each request

**Hint:** Use `stats` object and `circuitBreakerState` for data source

### TODO 4: Add Pattern Demonstrations (Challenge)
Complete the four pattern demonstration functions.

**Patterns to Demonstrate:**
1. **Retry Pattern** - Show exponential backoff in action
2. **Circuit Breaker** - Trigger circuit opening and recovery
3. **Fallback Strategy** - Return cached/alternative data on failure
4. **Timeout Handling** - Handle slow responses gracefully

**Success Criteria:**
- Each button demonstrates its pattern clearly
- Logs explain what's happening at each step
- Students can see the difference between patterns
- Fallback provides useful alternative data

## 🛠 Error Handling Concepts

### Error Types and Handling Strategies

**Network Errors (Retry):**
- `timeout` - Connection/request timeout
- Strategy: Retry with exponential backoff
- User Feedback: "Connection issues detected. Retrying automatically..."

**Server Errors (Retry):**
- `500` Internal Server Error
- `502` Bad Gateway
- `503` Service Unavailable
- `504` Gateway Timeout
- Strategy: Retry with backoff, implement circuit breaker
- User Feedback: "Server temporarily unavailable. Retrying shortly..."

**Rate Limiting (Retry):**
- `429` Too Many Requests
- Strategy: Respect Retry-After header, exponential backoff
- User Feedback: "Request limit reached. Please wait a moment..."

**Authentication Errors (DO NOT Retry):**
- `401` Unauthorized
- `403` Forbidden
- Strategy: Redirect to login, refresh tokens
- User Feedback: "Authentication required. Please log in again."

**Client Errors (DO NOT Retry):**
- `400` Bad Request
- `404` Not Found
- `422` Unprocessable Entity
- Strategy: Validate input, provide specific feedback
- User Feedback: "Invalid request. Please check your input."

### Backoff Strategies

**Exponential Backoff:**
```
Attempt 1: Wait 1 second
Attempt 2: Wait 2 seconds
Attempt 3: Wait 4 seconds
Attempt 4: Wait 8 seconds
```
Best for: Most scenarios, prevents server overload

**Linear Backoff:**
```
Attempt 1: Wait 1 second
Attempt 2: Wait 2 seconds
Attempt 3: Wait 3 seconds
Attempt 4: Wait 4 seconds
```
Best for: Predictable retry timing

**Fixed Backoff:**
```
Attempt 1: Wait 1 second
Attempt 2: Wait 1 second
Attempt 3: Wait 1 second
Attempt 4: Wait 1 second
```
Best for: Testing, not recommended for production

## 🚀 Extension Challenges

Once you've completed all TODOs, try these advanced challenges:

### Challenge 1: Add Jitter to Backoff
Prevent "thundering herd" problem by adding randomness to retry delays.

```javascript
calculateBackoffWithJitter(attempt, baseDelay) {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // 0-1000ms random jitter
    return exponentialDelay + jitter;
}
```

**Why it matters:** When many clients retry at the same time, they can overwhelm the server. Jitter spreads out retry attempts.

### Challenge 2: Adaptive Retry Strategy
Adjust retry delays based on recent success rates.

**Concept:** If success rate is low (many failures), increase backoff delays. If success rate is high, use normal delays.

**Implementation Hints:**
- Track recent success rate (e.g., last 10 requests)
- Multiply base delay by `(2.0 - successRate)`
- Success rate of 0.5 = 1.5x base delay
- Success rate of 0.9 = 1.1x base delay

### Challenge 3: Bulkhead Pattern
Limit concurrent requests to prevent resource exhaustion.

**Requirements:**
- Set max concurrent requests (e.g., 5)
- Queue additional requests
- Process queued requests when slots free up
- Track queue length in dashboard

**Real-World Use:** Prevents browser/server from being overwhelmed by too many simultaneous API calls.

### Challenge 4: Health Status Endpoint
Create a simple health check API endpoint simulator.

**Features:**
- Return `{ status: "healthy" }` when server is good
- Return `{ status: "degraded" }` when errors are high
- Use this to decide whether to open circuit breaker
- Test health before making actual requests

## 📚 Code Reference

### Key Functions to Study

**Error Classification (already implemented):**
```javascript
isRetryableError(error) {
    const retryablePatterns = [
        /timeout/i, /500/i, /502/i, /503/i, /504/i, /429/i
    ];

    const nonRetryablePatterns = [
        /400/i, /401/i, /403/i, /404/i, /422/i
    ];

    // Check non-retryable first
    if (nonRetryablePatterns.some(pattern => pattern.test(error.message))) {
        return false;
    }

    return retryablePatterns.some(pattern => pattern.test(error.message));
}
```

**Backoff Calculation (already implemented):**
```javascript
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
```

**Your TODO: Complete the Retry Loop**
```javascript
async makeRequestWithRetry(errorType, requestName) {
    let attempt = 0;
    let lastError = null;

    while (attempt <= this.maxRetries) {
        try {
            // TODO: Check circuit breaker
            // TODO: Make the API request
            // TODO: On success, reset circuit breaker and return
        } catch (error) {
            lastError = error;
            attempt++;

            // TODO: Classify error (retryable?)
            // TODO: Calculate backoff delay
            // TODO: Wait before retry OR throw if max retries reached
        }
    }
}
```

## 🔍 Testing Your Implementation

### Test Scenarios to Verify

**1. Retryable Errors:**
- Click "Test Timeout" - Should retry 3 times with exponential delays
- Click "Test Server Error" - Should retry and eventually succeed or fail after max attempts
- Click "Test Rate Limiting" - Should handle 429 errors with appropriate backoff

**2. Non-Retryable Errors:**
- Click "Test Unauthorized" - Should fail immediately without retries
- Click "Test Not Found" - Should fail immediately with clear error message
- Click "Test Bad Request" - Should fail immediately and log the error

**3. Circuit Breaker:**
- Trigger 3+ consecutive failures - Circuit should open
- Wait 30 seconds - Circuit should move to half-open state
- Make successful request - Circuit should close and reset

**4. Statistics Tracking:**
- Total requests counter increases with each test
- Success/Failed counters update correctly
- Retry counter increases only for retried requests
- Success rate percentage recalculates after each request

### Debugging Tips

**Check Console Logs:**
```javascript
// Look for these patterns in your code
console.log('Cache hit!');  // From successful cache retrieval
console.log('Cache miss - fetching from API');  // Network request needed
```

**Verify Error Classification:**
- 401, 403, 404 errors should show "Non-retryable error"
- 500, 502, 503 errors should show "Retrying in Xms"
- Timeout errors should trigger retry logic

**Monitor Circuit Breaker:**
- State should change from "Closed" → "Open" → "Half-Open" → "Closed"
- Failure count should reset to 0 on success
- Timer should wait full 30 seconds before half-open attempt

## 📁 File Structure
```
activity-09-error-handling/
├── index.html          # Error handling dashboard and controls
├── styles.css          # Error visualization styling
├── script.js           # ErrorHandler class with TODOs
├── package.json        # Project metadata
└── README.md           # This file
```

## 💡 Best Practices for Production

### Retry Strategy Guidelines
1. **Use exponential backoff** - Prevents server overload
2. **Add jitter** - Spreads out retry attempts (see Extension Challenge 1)
3. **Set maximum retry limits** - Prevents infinite loops
4. **Classify errors properly** - Don't retry non-retryable errors
5. **Respect server headers** - Honor Retry-After headers

### Circuit Breaker Tips
1. **Tune thresholds carefully** - 3 failures works for demos, production may differ
2. **Use different breakers for different APIs** - Don't let one failing API affect others
3. **Monitor and alert** - Track when circuits open
4. **Test recovery paths** - Ensure half-open state works correctly

### User Experience Guidelines
1. **Show loading states** - Let users know you're retrying
2. **Provide friendly messages** - "Retrying..." not "Error 503"
3. **Offer manual retry** - Give users control
4. **Use fallback content** - Show cached data or placeholders

## 🌐 Real-World Applications

**Where You'll Use These Patterns:**
- **E-commerce checkout** - Retry payment API calls
- **Social media feeds** - Handle network timeouts gracefully
- **Real-time dashboards** - Circuit breaker prevents cascading failures
- **Mobile apps** - Retry on poor network conditions
- **Microservices** - Every service-to-service call needs retry logic

**Production Tools:**
- **Axios** - Built-in retry support with `axios-retry` package
- **AWS SDK** - Automatic exponential backoff
- **Polly (C#)** - Complete resilience framework
- **Hystrix (Java)** - Netflix's circuit breaker library
- **Resilience4j** - Modern alternative to Hystrix

## 🔗 Additional Resources

**Essential Reading:**
- [MDN: Promise Error Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#error_handling)
- [Google Cloud: Retry Strategy](https://cloud.google.com/storage/docs/retry-strategy)
- [Martin Fowler: Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [AWS: Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)

**Video Tutorials:**
- Search: "JavaScript retry mechanism tutorial"
- Search: "Circuit breaker pattern explained"
- Search: "Building resilient microservices"

**Next Steps:**
- Complete Activity 10: Polling and WebSockets
- Combine error handling with caching (Activity 8)
- Build a production-ready API client with all patterns

---

**Congratulations!** You've learned the most critical skill for production API development. Error handling isn't optional - it's what separates toy projects from professional applications. Keep practicing these patterns!