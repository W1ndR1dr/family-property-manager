// Local Storage Data Layer
// This replaces the Base44 SDK with browser localStorage for standalone operation

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getStorageKey = (entityName) => `fpm_${entityName.toLowerCase()}`;

const loadFromStorage = (entityName) => {
  try {
    const data = localStorage.getItem(getStorageKey(entityName));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${entityName} from storage:`, error);
    return [];
  }
};

const saveToStorage = (entityName, data) => {
  try {
    localStorage.setItem(getStorageKey(entityName), JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${entityName} to storage:`, error);
  }
};

// Sort helper - handles "-field" for descending order
const sortData = (data, sortField) => {
  if (!sortField) return data;

  const descending = sortField.startsWith('-');
  const field = descending ? sortField.slice(1) : sortField;

  return [...data].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle date strings
    if (typeof aVal === 'string' && aVal.match(/^\d{4}-\d{2}-\d{2}/)) {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return descending ? bVal - aVal : aVal - bVal;
    }

    // Handle strings
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return descending ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }

    return 0;
  });
};

// Create an entity class factory
const createEntity = (entityName) => ({
  async list(sortField = null) {
    const data = loadFromStorage(entityName);
    return sortData(data, sortField);
  },

  async create(item) {
    const data = loadFromStorage(entityName);
    const newItem = {
      ...item,
      id: generateId(),
      created_date: new Date().toISOString()
    };
    data.push(newItem);
    saveToStorage(entityName, data);
    return newItem;
  },

  async update(id, updates) {
    const data = loadFromStorage(entityName);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`${entityName} with id ${id} not found`);
    }
    data[index] = { ...data[index], ...updates, updated_date: new Date().toISOString() };
    saveToStorage(entityName, data);
    return data[index];
  },

  async delete(id) {
    const data = loadFromStorage(entityName);
    const filtered = data.filter(item => item.id !== id);
    saveToStorage(entityName, filtered);
    return { success: true };
  },

  async filter(criteria) {
    const data = loadFromStorage(entityName);
    return data.filter(item => {
      return Object.entries(criteria).every(([key, value]) => item[key] === value);
    });
  },

  async bulkCreate(items) {
    const data = loadFromStorage(entityName);
    const newItems = items.map(item => ({
      ...item,
      id: generateId(),
      created_date: new Date().toISOString()
    }));
    data.push(...newItems);
    saveToStorage(entityName, data);
    return newItems;
  },

  async get(id) {
    const data = loadFromStorage(entityName);
    return data.find(item => item.id === id) || null;
  }
});

// Export all entities
export const Member = createEntity('Member');
export const Contribution = createEntity('Contribution');
export const Transaction = createEntity('Transaction');
export const Mortgage = createEntity('Mortgage');
export const AmortizationScheduleItem = createEntity('AmortizationScheduleItem');
export const Document = createEntity('Document');

// User/Auth stub - for standalone mode, we don't need authentication
export const User = {
  me: async () => ({
    id: 'local-user',
    name: 'Local User',
    email: 'local@standalone.app'
  }),
  isLoggedIn: () => true,
  login: async () => ({ success: true }),
  logout: async () => ({ success: true })
};
