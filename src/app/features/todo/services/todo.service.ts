import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private storageKey = 'todos';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  
  constructor(private storage: Storage) {
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

  async addTodo(title: string): Promise<Todo> {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now()
    };

    const todos = [...this.todosSubject.value, newTodo];
    await this.storage.set(this.storageKey, todos);
    this.todosSubject.next(todos);
    
    return newTodo;
  }

  async toggleTodo(id: string): Promise<void> {
    const todos = this.todosSubject.value.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
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
