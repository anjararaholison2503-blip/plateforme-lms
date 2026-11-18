// Formater une date
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  });
};

// Formater une date et heure
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formater un montant
export const formatMoney = (amount, symbol = 'Ar') => {
  if (amount === null || amount === undefined) return `0 ${symbol}`;
  return `${new Intl.NumberFormat('fr-FR').format(amount)} ${symbol}`;
};

// Formater un nom d'utilisateur
export const formatUserName = (user) => {
  if (!user) return '—';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

// Afficher l'initiale
export const getInitials = (user) => {
  if (!user) return '?';
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  return (first + last).toUpperCase() || '?';
};

// Traduire un rôle
export const translateRole = (role) => {
  const map = {
    ADMIN: 'Administrateur',
    TEACHER: 'Enseignant',
    STUDENT: 'Étudiant',
    ACCOUNTANT: 'Comptable',
    PARENT: 'Parent',
  };
  return map[role] || role;
};

// Couleur de badge par rôle
export const roleBadgeColor = (role) => {
  const map = {
    ADMIN: 'purple',
    TEACHER: 'blue',
    STUDENT: 'green',
    ACCOUNTANT: 'yellow',
    PARENT: 'gray',
  };
  return map[role] || 'gray';
};

// Traduire un statut
export const translateStatus = (status) => {
  const map = {
    ACTIVE: 'Actif',
    INACTIVE: 'Inactif',
    SUSPENDED: 'Suspendu',
    PENDING: 'En attente',
  };
  return map[status] || status;
};

// Couleur de badge par statut
export const statusBadgeColor = (status) => {
  const map = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    SUSPENDED: 'red',
    PENDING: 'yellow',
  };
  return map[status] || 'gray';
};

// Traduire un type d'unité
export const translateUnitType = (type) => {
  const map = {
    ESTABLISHMENT: 'Établissement',
    FACULTY: 'Faculté',
    DEPARTMENT: 'Département',
    PROGRAM: 'Filière',
    LEVEL: 'Niveau',
    CLASS: 'Classe',
    GROUP: 'Groupe',
  };
  return map[type] || type;
};

// Couleur de badge par type d'unité
export const unitTypeBadgeColor = (type) => {
  const map = {
    ESTABLISHMENT: 'purple',
    FACULTY: 'blue',
    DEPARTMENT: 'green',
    PROGRAM: 'yellow',
    LEVEL: 'pink',
    CLASS: 'indigo',
    GROUP: 'gray',
  };
  return map[type] || 'gray';
};