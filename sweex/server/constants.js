// constants.js — roles, categories, and lookups shared across routes.
// Direct port of the Python db.py constants.

export const CATEGORIES = ['plastic', 'metal', 'wood', 'electronics', 'textile', 'furniture', 'paper', 'organic', 'other'];
export const CONDITIONS = ['new', 'good', 'fair', 'poor'];
export const UNITS = ['kg', 'unit', 'litre', 'm3'];

// Roles offered at signup ("admin" is created manually, not via /register)
export const SIGNUP_ROLES = ['household', 'business', 'waste_collector', 'recycler', 'organisation'];
export const ROLES = [...SIGNUP_ROLES, 'admin'];

export const ROLE_LABELS = {
  household: 'Household',
  business: 'Business',
  waste_collector: 'Waste Collector',
  recycler: 'Recycler',
  organisation: 'Organisation / NGO',
  admin: 'Administrator',
};

// Access-level grouping used for role-based dashboards/permissions.
export const ROLE_GROUP = {
  household: 'producer',
  business: 'producer',
  waste_collector: 'processor',
  recycler: 'processor',
  organisation: 'processor',
  admin: 'admin',
};

export function roleGroup(role) {
  return ROLE_GROUP[role] || 'producer';
}
