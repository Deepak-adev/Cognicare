import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Pure JS module to analyze session logs offline and detect sundowning risk windows.
 * Sundowning typically manifests as increased confusion or agitation during specific times of day.
 */

const STORAGE_KEY_PREFIX = 'session_logs_';
const DAYS_TO_ANALYZE = 14;
const MIN_DAYS_REQUIRED = 5;
const DEVIATION_MULTIPLIER = 1.5; // 1.5x variance threshold

/**
 * Helper to get the hour bucket for a timestamp (0-23)
 */
const getHourBucket = (timestampStr) => {
  const date = new Date(timestampStr);
  return date.getHours();
};

/**
 * Helper to get the start of the day N days ago
 */
const getPastDateThreshold = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const sundowningAnalyzer = {
  /**
   * Reads raw logs from AsyncStorage for the patient.
   * @param {string} patientId 
   * @returns {Promise<Array>} Array of log entries
   */
  getLogs: async (patientId) => {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${patientId}`);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('[SundowningAnalyzer] Failed to read logs:', e);
      return [];
    }
  },

  /**
   * Adds a new log entry to AsyncStorage for the patient.
   * This is used by the store to persist live data.
   */
  appendLog: async (patientId, entry) => {
    try {
      const currentLogs = await sundowningAnalyzer.getLogs(patientId);
      const newLogs = [...currentLogs, entry];
      
      // Clean up old logs (older than 14 days) to save space
      const cutoff = getPastDateThreshold(DAYS_TO_ANALYZE).getTime();
      const prunedLogs = newLogs.filter(log => new Date(log.timestamp).getTime() >= cutoff);
      
      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${patientId}`, JSON.stringify(prunedLogs));
    } catch (e) {
      console.error('[SundowningAnalyzer] Failed to append log:', e);
    }
  },

  /**
   * Analyzes historical logs and today's live metrics to detect if the patient is currently
   * entering or in a high-risk sundowning window based on their own baseline.
   * @param {string} patientId
   * @returns {Promise<{riskHourStart: number, riskHourEnd: number, confidence: number} | null>}
   */
  getSundowningRiskWindow: async (patientId) => {
    const logs = await sundowningAnalyzer.getLogs(patientId);
    if (!logs || logs.length === 0) return null;

    const now = new Date();
    const currentHour = now.getHours();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);

    // Separate historical logs (past 14 days, excluding today) and today's live logs
    const historicalLogs = [];
    const todaysLogs = [];
    
    // Count unique days to ensure we have enough baseline data
    const uniqueDays = new Set();

    logs.forEach(log => {
      const logTime = new Date(log.timestamp).getTime();
      const logDateStr = new Date(log.timestamp).toDateString();
      uniqueDays.add(logDateStr);

      if (logTime >= todayStart) {
        todaysLogs.push(log);
      } else {
        historicalLogs.push(log);
      }
    });

    if (uniqueDays.size < MIN_DAYS_REQUIRED) {
      console.log(`[SundowningAnalyzer] Insufficient data. Found ${uniqueDays.size} days, require ${MIN_DAYS_REQUIRED}.`);
      return null; // Don't guess without sufficient data
    }

    // Bucket historical data by hour
    const hourlyBaselines = {};
    for (let i = 0; i < 24; i++) {
      hourlyBaselines[i] = { responseTimes: [], accuracies: [], moods: [] };
    }

    historicalLogs.forEach(log => {
      const hour = getHourBucket(log.timestamp);
      if (log.response_time_ms) hourlyBaselines[hour].responseTimes.push(log.response_time_ms);
      if (log.accuracy !== undefined) hourlyBaselines[hour].accuracies.push(log.accuracy);
      if (log.mood) hourlyBaselines[hour].moods.push(log.mood);
    });

    // Compute means and variances for the current hour
    const currentHourBaseline = hourlyBaselines[currentHour];
    if (currentHourBaseline.responseTimes.length < 3) {
      // Need at least a few data points in this hour historically to form a baseline
      return null;
    }

    const calcMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const calcVariance = (arr, mean) => arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;

    const histMeanRT = calcMean(currentHourBaseline.responseTimes);
    const histVarRT = calcVariance(currentHourBaseline.responseTimes, histMeanRT);
    const stdDevRT = Math.sqrt(histVarRT);

    // Analyze today's metrics for the current hour
    const todaysCurrentHourLogs = todaysLogs.filter(log => getHourBucket(log.timestamp) === currentHour);
    if (todaysCurrentHourLogs.length === 0) {
      return null; // No interactions yet this hour to trigger an anomaly
    }

    let todayTotalRT = 0;
    let negativeMoodCount = 0;
    let totalMoods = 0;

    todaysCurrentHourLogs.forEach(log => {
      if (log.response_time_ms) todayTotalRT += log.response_time_ms;
      if (log.mood) {
        totalMoods++;
        if (['anxious', 'confused', 'agitated', 'distressed'].includes(log.mood)) {
          negativeMoodCount++;
        }
      }
    });

    const todayMeanRT = todayTotalRT / todaysCurrentHourLogs.length;
    const moodAnomalyRatio = totalMoods > 0 ? (negativeMoodCount / totalMoods) : 0;

    // Check for deviation: Is today's response time > baseline + (1.5 * stdDev)?
    const rtThreshold = histMeanRT + (DEVIATION_MULTIPLIER * stdDevRT);
    const isResponseAnomaly = todayMeanRT > rtThreshold;
    
    // We also consider mood. If > 50% of moods this hour are negative, that's a strong signal.
    const isMoodAnomaly = moodAnomalyRatio > 0.5;

    if (isResponseAnomaly || isMoodAnomaly) {
      // Flag a risk window extending to the next hour
      return {
        riskHourStart: currentHour,
        riskHourEnd: currentHour + 2 > 23 ? 23 : currentHour + 2,
        confidence: isMoodAnomaly ? 0.9 : 0.75, // Higher confidence if mood backs it up
        reason: isMoodAnomaly ? 'Elevated negative mood markers detected.' : 'Significant cognitive latency detected.'
      };
    }

    return null;
  }
};
