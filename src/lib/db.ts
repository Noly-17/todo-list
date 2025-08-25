import { Task } from "@/types/task"

class TaskDB {
  private dbName = "todo-app"
  private version = 1
  private storeName = "tasks"

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "id" })
          store.createIndex("priority", "priority", { unique: false })
          store.createIndex("completed", "completed", { unique: false })
          store.createIndex("createdAt", "createdAt", { unique: false })
        }
      }
    })
  }

  async getAllTasks(): Promise<Task[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly")
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const tasks = request.result.map((task: unknown) => {
          const t = task as Task & { createdAt: string | Date; updatedAt: string | Date }
          return {
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          }
        })
        resolve(tasks)
      }
    })
  }

  async addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    const db = await this.getDB()
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.add(newTask)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(newTask)
    })
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const existingTask = getRequest.result
        if (!existingTask) {
          reject(new Error("Task not found"))
          return
        }

        const updatedTask: Task = {
          ...existingTask,
          ...updates,
          updatedAt: new Date(),
          createdAt: new Date(existingTask.createdAt),
        }

        const updateRequest = store.put(updatedTask)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve(updatedTask)
      }
    })
  }

  async deleteTask(id: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clearAllTasks(): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export const taskDB = new TaskDB()