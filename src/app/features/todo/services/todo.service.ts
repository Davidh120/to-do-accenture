import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  categoryId?: string;
  createdAt: number;
  updatedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private storageKey = 'todos';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  
  private readonly storage = inject(Storage);

  constructor() {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    this.loadTodos();
  }

  private async loadTodos() {
    const todos = await this.storage.get(this.storageKey) || [];
    this.todosSubject.next(todos);
  }

  get todos$(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  async addTodo(title: string, categoryId?: string): Promise<Todo> {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      categoryId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const todos = [...this.todosSubject.value, newTodo];
    await this.storage.set(this.storageKey, todos);
    this.todosSubject.next(todos);
    
    return newTodo;
  }

  async toggleTodo(id: string): Promise<void> {
    const todos = this.todosSubject.value.map(todo => 
      todo.id === id ? { 
        ...todo, 
        completed: !todo.completed,
        updatedAt: Date.now() 
      } : todo
    );
    
    await this.storage.set(this.storageKey, todos);
    this.todosSubject.next(todos);
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
    const todos = this.todosSubject.value.map(todo => 
      todo.id === id ? { 
        ...todo, 
        ...updates,
        updatedAt: Date.now() 
      } : todo
    );
    
    await this.storage.set(this.storageKey, todos);
    this.todosSubject.next(todos);
  }

  async deleteTodo(id: string): Promise<void> {
    const todos = this.todosSubject.value.filter(todo => todo.id !== id);
    await this.storage.set(this.storageKey, todos);
    this.todosSubject.next(todos);
  }
}
