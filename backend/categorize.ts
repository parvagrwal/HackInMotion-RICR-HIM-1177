/**
 * Transaction Categorization Engine
 * 
 * This module handles automatic categorization of transactions using a two-stage approach:
 * 1. Exact keyword matching: Lowercased merchant/description strings matched against
 *    category-specific keyword dictionaries
 * 2. Fuzzy matching: If no exact match, use string similarity (Fuse.js) to find the
 *    closest category keyword match
 * 
 * Design rationale:
 * - No external AI/NLP APIs in MVP (rule-based + fuzzy only)
 * - Keyword dictionaries are easily maintainable and fully transparent
 * - Fuzzy matching handles typos and variations in merchant names
 * - Unmatched transactions default to "Uncategorized" and can be manually recategorized
 * - Pure functions with no side effects for testability
 */

import Fuse from 'fuse.js';
import { CATEGORIES, CATEGORY_KEYWORDS, Category } from '@/lib/constants';

/**
 * Categorizes a transaction based on merchant name and description
 * @param merchant - The merchant/store name
 * @param description - Transaction description
 * @returns The matched category, or 'Uncategorized' if no match found
 */
export function categorizeTransaction(
  merchant?: string,
  description?: string
): Category {
  if (!merchant && !description) {
    return 'Uncategorized';
  }

  const searchText = `${merchant || ''} ${description || ''}`.toLowerCase();

  // Stage 1: Exact keyword matching
  for (const category of CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[category];
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  // Stage 2: Fuzzy matching if no exact match
  try {
    const allKeywords = CATEGORIES.flatMap((cat) =>
      CATEGORY_KEYWORDS[cat].map((kw) => ({
        keyword: kw,
        category: cat,
      }))
    ).filter(item => item.keyword.length > 0);

    if (allKeywords.length === 0) {
      return 'Uncategorized';
    }

    const fuse = new Fuse(allKeywords, {
      keys: ['keyword'],
      threshold: 0.4, // Allows 40% difference
      minMatchCharLength: 2,
    });

    const results = fuse.search(searchText);
    if (results.length > 0 && results[0].score! < 0.4) {
      return results[0].item.category;
    }
  } catch (error) {
    // If fuzzy matching fails for any reason, silently fall back
    console.error('Fuzzy matching error:', error);
  }

  return 'Uncategorized';
}

/**
 * Batch categorize multiple transactions
 */
export function categorizeBatch(
  transactions: Array<{ merchant?: string; description?: string }>
): Category[] {
  return transactions.map((tx) =>
    categorizeTransaction(tx.merchant, tx.description)
  );
}
