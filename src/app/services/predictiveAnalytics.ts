export interface UserEngagementMetrics {
  sessionDuration: number;
  tracksPlayed: number;
  trackSkipRate: number;
  likeRate: number;
  averagePlayDuration: number;
  lastUpdated: Date;
}

export interface EngagementTrend {
  period: string; // '7days', '30days', etc.
  metrics: UserEngagementMetrics;
  change: {
    skipRateChange: number;
    sessionDurationChange: number;
    likeRateChange: number;
  };
  alert?: string;
}

export interface PersonalizedRecommendation {
  title: string;
  description: string;
  trackIds: string[];
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export class PredictiveAnalytics {
  private metricsHistory: Map<string, UserEngagementMetrics[]> = new Map();
  private currentMetrics: UserEngagementMetrics = {
    sessionDuration: 0,
    tracksPlayed: 0,
    trackSkipRate: 0,
    likeRate: 0,
    averagePlayDuration: 0,
    lastUpdated: new Date()
  };

  /**
   * Log track skip event
   */
  logSkip() {
    this.currentMetrics.trackSkipRate += 1;
  }

  /**
   * Log track like event
   */
  logLike() {
    this.currentMetrics.likeRate += 1;
  }

  /**
   * Update track play count and duration
   */
  logPlayback(durationSeconds: number) {
    this.currentMetrics.tracksPlayed += 1;
    this.currentMetrics.sessionDuration += durationSeconds;
    this.currentMetrics.averagePlayDuration =
      this.currentMetrics.sessionDuration / this.currentMetrics.tracksPlayed;
  }

  /**
   * End session and store metrics
   */
  endSession() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.metricsHistory.has(today)) {
      this.metricsHistory.set(today, []);
    }
    this.metricsHistory.get(today)!.push({
      ...this.currentMetrics,
      lastUpdated: new Date()
    });

    // Reset for new session
    this.currentMetrics = {
      sessionDuration: 0,
      tracksPlayed: 0,
      trackSkipRate: 0,
      likeRate: 0,
      averagePlayDuration: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Analyze engagement trends over time
   */
  analyzeTrends(days: number = 7): EngagementTrend {
    const now = new Date();
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    let totalSkips = 0,
      totalLikes = 0,
      totalDuration = 0,
      dayCount = 0;

    this.metricsHistory.forEach((metrics, date) => {
      const dateObj = new Date(date);
      if (dateObj >= pastDate) {
        metrics.forEach(m => {
          totalSkips += m.trackSkipRate;
          totalLikes += m.likeRate;
          totalDuration += m.sessionDuration;
          dayCount++;
        });
      }
    });

    const avgSkipRate = dayCount > 0 ? totalSkips / dayCount : 0;
    const avgLikeRate = dayCount > 0 ? totalLikes / dayCount : 0;
    const avgSessionDuration = dayCount > 0 ? totalDuration / dayCount : 0;

    // Detect concerning trends
    const change = {
      skipRateChange: 0,
      sessionDurationChange: 0,
      likeRateChange: 0
    };

    let alert: string | undefined;

    // Check if skip rate is increasing (bad)
    if (avgSkipRate > 2) {
      alert = 'High skip rate detected';
    }

    // Check if session duration is decreasing (bad)
    if (avgSessionDuration < 300) {
      // Less than 5 minutes
      alert = 'Low engagement - session time decreasing';
    }

    // Check if like rate is low (bad)
    if (avgLikeRate < 0.5) {
      alert = 'Low like rate - consider recommendations';
    }

    return {
      period: `${days}days`,
      metrics: {
        sessionDuration: avgSessionDuration,
        tracksPlayed: dayCount * 10, // Estimate
        trackSkipRate: avgSkipRate,
        likeRate: avgLikeRate,
        averagePlayDuration: avgSessionDuration,
        lastUpdated: new Date()
      },
      change,
      alert
    };
  }

  /**
   * Generate personalized recommendations based on engagement
   */
  generatePersonalizedRecommendations(
    unplayedTracks: any[],
    likedGenres: string[]
  ): PersonalizedRecommendation[] {
    const trends = this.analyzeTrends(7);
    const recommendations: PersonalizedRecommendation[] = [];

    // If skip rate is high, recommend something different
    if (trends.metrics.trackSkipRate > 1) {
      recommendations.push({
        title: 'Refresh Your Sound',
        description: 'Try these unexplored gems from your collection',
        trackIds: unplayedTracks.slice(0, 5).map((t: any) => t.id),
        reason: 'You seem ready for something new',
        priority: 'high'
      });
    }

    // If engagement is low, recommend curated playlists
    if (trends.metrics.sessionDuration < 300) {
      recommendations.push({
        title: 'Get Back into the Groove',
        description: 'Here are trending tracks in your favorite genres',
        trackIds: unplayedTracks.slice(0, 10).map((t: any) => t.id),
        reason: 'Boost your listening sessions',
        priority: 'high'
      });
    }

    // General discovery recommendation
    recommendations.push({
      title: 'Explore Similar Vibes',
      description: 'Based on your listening habits',
      trackIds: unplayedTracks.slice(5, 15).map((t: any) => t.id),
      reason: 'Curated for your taste',
      priority: 'medium'
    });

    return recommendations;
  }

  /**
   * Predict churn based on engagement metrics
   */
  predictChurnRisk(): number {
    const trends = this.analyzeTrends(7);
    let riskScore = 0;

    // Factor 1: Skip rate (0-40 points)
    riskScore += Math.min(40, trends.metrics.trackSkipRate * 20);

    // Factor 2: Session duration (0-30 points)
    if (trends.metrics.sessionDuration < 300) {
      riskScore += 30;
    } else if (trends.metrics.sessionDuration < 600) {
      riskScore += 15;
    }

    // Factor 3: Like rate (0-30 points)
    if (trends.metrics.likeRate < 0.3) {
      riskScore += 30;
    } else if (trends.metrics.likeRate < 0.7) {
      riskScore += 15;
    }

    return Math.min(100, riskScore);
  }
}

export default PredictiveAnalytics;
