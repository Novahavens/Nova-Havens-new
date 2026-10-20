export const BLOG_CATEGORIES = ['For Insurance Professionals', 'For Displaced Families', 'Market Guides'] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type AutomationCategory =
  'disaster_alerts' | 'furnished_housing_trends' | 'furnished_housing_guides' | 'furnished_finder_weekly';

/** Maps the n8n automation's internal category keys onto the three site categories (PLAN.md §1). */
export const AUTOMATION_CATEGORY_MAP: Record<AutomationCategory, BlogCategory> = {
  disaster_alerts: 'For Displaced Families',
  furnished_housing_trends: 'Market Guides',
  furnished_housing_guides: 'For Displaced Families',
  furnished_finder_weekly: 'Market Guides',
};

export const BLOG_MOTIFS = ['ai', 'checklist', 'house', 'paw', 'key', 'magnifier', 'map', 'gears'] as const;

export const BLOG_CTAS = ['housing', 'property', 'none'] as const;
