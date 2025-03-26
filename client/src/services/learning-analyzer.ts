
export function analyzeLearningStyle(userActivity: {
  videoWatchTime: number;
  readingTime: number;
  practiceTime: number;
}) {
  const { videoWatchTime, readingTime, practiceTime } = userActivity;
  const total = videoWatchTime + readingTime + practiceTime;
  
  const styles = {
    visual: (videoWatchTime / total) * 100,
    theoretical: (readingTime / total) * 100,
    practical: (practiceTime / total) * 100
  };
  
  return Object.entries(styles)
    .sort(([,a], [,b]) => b - a)[0][0];
}

export function suggestNextContent(learningStyle: string) {
  const suggestions = {
    visual: ['Watch framework application videos', 'Study case diagrams'],
    theoretical: ['Read detailed documentation', 'Review theory sections'],
    practical: ['Try hands-on exercises', 'Complete practice problems']
  };
  
  return suggestions[learningStyle as keyof typeof suggestions] || suggestions.theoretical;
}
