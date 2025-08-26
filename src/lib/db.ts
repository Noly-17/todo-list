import { Task } from '@/types/task';

const dbConfig = {
  name: String(process.env.NEXT_PUBLIC_DB_NAME),
  version: parseInt(String(process.env.NEXT_PUBLIC_DB_VERSION)),
  storeName: String(process.env.NEXT_PUBLIC_DB_STORE_NAME),
};

async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbConfig.name, dbConfig.version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(dbConfig.storeName)) {
        const store = db.createObjectStore(dbConfig.storeName, {
          keyPath: 'id',
        });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('completed', 'completed', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([dbConfig.storeName], 'readonly');
    const store = transaction.objectStore(dbConfig.storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const tasks = request.result.map((task: unknown) => {
        const t = task as Task & {
          createdAt: string | Date;
          updatedAt: string | Date;
        };
        return {
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        };
      });
      resolve(tasks);
    };
  });
}

async function addTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  const db = await getDB();
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([dbConfig.storeName], 'readwrite');
    const store = transaction.objectStore(dbConfig.storeName);
    const request = store.add(newTask);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(newTask);
  });
}

async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([dbConfig.storeName], 'readwrite');
    const store = transaction.objectStore(dbConfig.storeName);
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const existingTask = getRequest.result;
      if (!existingTask) {
        reject(new Error('Task not found'));
        return;
      }

      const updatedTask: Task = {
        ...existingTask,
        ...updates,
        updatedAt: new Date(),
        createdAt: new Date(existingTask.createdAt),
      };

      const updateRequest = store.put(updatedTask);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve(updatedTask);
    };
  });
}

async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([dbConfig.storeName], 'readwrite');
    const store = transaction.objectStore(dbConfig.storeName);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function clearAllTasks(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([dbConfig.storeName], 'readwrite');
    const store = transaction.objectStore(dbConfig.storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export const taskDB = {
  getAllTasks,
  addTask,
  updateTask,
  deleteTask,
  clearAllTasks,
};
