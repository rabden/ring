export const MAX_RETRIES = 5;

// Add a Map to track retries per request
const retryCountMap = new Map();

export const initRetryCount = (requestId) => {
  retryCountMap.set(requestId, 0);
};

export const incrementRetryCount = (requestId) => {
  const currentCount = retryCountMap.get(requestId) || 0;
  retryCountMap.set(requestId, currentCount + 1);
  return currentCount + 1;
};

export const getRetryCount = (requestId) => {
  return retryCountMap.get(requestId) || 0;
};

export const clearRetryCount = (requestId) => {
  retryCountMap.delete(requestId);
};

export const getRetryInterval = (statusCode) => {
  switch (statusCode) {
    case 504: return 30000;  // 30 seconds for timeouts (increased from 10s)
    case 503: return 120000; // 2 minutes for service unavailable
    case 500: return 10000;  // 10 seconds for server errors
    case 429: return 2000;   // 2 seconds for rate limits
    default: return 5000;    // 5 seconds for other cases
  }
};

export const shouldRetry = (statusCode, requestId) => {
  const retryCount = getRetryCount(requestId);
  const retryableStatuses = [500, 503, 504, 429];
  return retryableStatuses.includes(statusCode) && retryCount < MAX_RETRIES;
};

export const handleApiResponse = async (response, requestId, retryFn) => {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || response.statusText;
      console.error('API response error:', errorData);
    } catch (e) {
      errorMessage = response.statusText;
    }

    if (shouldRetry(response.status, requestId)) {
      const retryCount = incrementRetryCount(requestId);
      const retryInterval = getRetryInterval(response.status);
      console.log(`Retrying image generation in ${retryInterval / 1000} seconds. Attempt ${retryCount} of ${MAX_RETRIES}`);
      
      // For rate limit errors (429), get a new API key before retrying
      if (response.status === 429) {
        console.log('Rate limit reached, retrying with a different API key');
        return new Promise(resolve => setTimeout(resolve, retryInterval))
          .then(() => retryFn(true)); // Pass true to indicate we need a new API key
      }
      
      // For other retryable errors, just wait and retry
      return new Promise(resolve => setTimeout(resolve, retryInterval))
        .then(() => retryFn());
    }

    // Clean up retry count when we're done retrying
    clearRetryCount(requestId);
    throw new Error(`API error: ${errorMessage}`);
  }

  // Clean up retry count on success
  clearRetryCount(requestId);
  return await response.blob();
};