export const isPlatformAdmin = (role) => ['Admin', 'Super Admin'].includes(role);

export const canManageEvents = (role) => (
  ['Event Organizer', 'Faculty Lead', 'Club Admin'].includes(role) || isPlatformAdmin(role)
);

export const canReviewPayments = (role) => (
  ['Finance Officer', 'Admin', 'Super Admin'].includes(role)
);