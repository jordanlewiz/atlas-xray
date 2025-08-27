import { daysBetweenFlexibleDates } from '../utils/timelineUtils';

export const useDateDifference = (oldDate: string | null | undefined, newDate: string | null | undefined) => {
  const diff = daysBetweenFlexibleDates(oldDate || '', newDate || '', new Date().getFullYear());
  
  return {
    value: diff,
    displayText: diff !== null ? (diff > 0 ? `+${diff}` : `${diff}`) : '',
    cssClass: diff === null ? '' : diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral',
    hasChange: diff !== null && diff !== 0
  };
};
