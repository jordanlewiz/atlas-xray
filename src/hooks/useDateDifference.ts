import { getDueDateDiff } from '../utils/timelineUtils';
import type { ProjectUpdate } from '../types';

export const useDateDifference = (update: ProjectUpdate) => {
  const diff = getDueDateDiff(update);
  
  return {
    value: diff,
    displayText: diff !== null ? (diff > 0 ? `+${diff}` : `${diff}`) : '',
    cssClass: diff === null ? '' : diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral',
    hasChange: diff !== null && diff !== 0
  };
};
