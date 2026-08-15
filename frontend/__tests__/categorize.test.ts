import { describe, it, expect } from 'vitest';
import { categorizeTransaction } from '../lib/categorize';

describe('categorizeTransaction', () => {
  it('should categorize known merchants correctly', () => {
    expect(categorizeTransaction('McDonalds', 'Lunch')).toBe('Food');
    expect(categorizeTransaction('Uber', 'Ride')).toBe('Travel');
  });

  it('should categorize based on description if merchant is not matched', () => {
    expect(categorizeTransaction(undefined, 'Rent payment')).toBe('Rent');
    expect(categorizeTransaction('', 'Spotify Premium')).toBe('Subscriptions');
  });

  it('should return Other for unknown transactions', () => {
    expect(categorizeTransaction('UnknownStore', 'Random item')).toBe('Other');
  });
});
