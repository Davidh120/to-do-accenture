import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private storageKey = 'categories';
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  
  // Default categories with Material Icons and colors
  private defaultCategories: Category[] = [
    { id: 'work', name: 'Work', color: '#4CAF50', icon: 'briefcase', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'personal', name: 'Personal', color: '#2196F3', icon: 'person', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'shopping', name: 'Shopping', color: '#9C27B0', icon: 'cart', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'health', name: 'Health', color: '#FF5722', icon: 'fitness', createdAt: Date.now(), updatedAt: Date.now() },
  ];

  constructor(private storage: Storage) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    this.loadCategories();
  }

  private async loadCategories() {
    const storedCategories = await this.storage.get(this.storageKey);
    
    if (!storedCategories || storedCategories.length === 0) {
      // Initialize with default categories if none exist
      await this.storage.set(this.storageKey, this.defaultCategories);
      this.categoriesSubject.next(this.defaultCategories);
    } else {
      this.categoriesSubject.next(storedCategories);
    }
  }

  get categories$(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const categories = this.categoriesSubject.value;
    return categories.find(cat => cat.id === id);
  }

  getCategoryByIdSync(id: string): Category | undefined {
    return this.categoriesSubject.value.find(cat => cat.id === id);
  }

  async addCategory(name: string, color: string, icon: string): Promise<Category> {
    const newCategory: Category = {
      id: this.generateId(name),
      name,
      color,
      icon,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const categories = [...this.categoriesSubject.value, newCategory];
    await this.storage.set(this.storageKey, categories);
    this.categoriesSubject.next(categories);
    
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const categories = this.categoriesSubject.value.map(cat => 
      cat.id === id ? { ...cat, ...updates, updatedAt: Date.now() } : cat
    );
    
    await this.storage.set(this.storageKey, categories);
    this.categoriesSubject.next(categories);
  }

  async deleteCategory(id: string): Promise<void> {
    const categories = this.categoriesSubject.value.filter(cat => cat.id !== id);
    await this.storage.set(this.storageKey, categories);
    this.categoriesSubject.next(categories);
  }

  private generateId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }
}
