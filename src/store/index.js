import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      todos: [],
      addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
      notes: [],
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      // Add more state as needed
    }),
    {
      name: 'everyday-tools-storage',
    }
  )
);

export default useStore;