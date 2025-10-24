import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  TrackByFunction,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  ModalController, 
  AlertController, 
  SegmentChangeEventDetail,
  SegmentCustomEvent
} from '@ionic/angular';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, distinctUntilChanged, shareReplay, takeUntil } from 'rxjs/operators';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../services/todo.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { CategoryManagerComponent } from '../category-manager/category-manager.component';

/**
 * Interface for filter state
 */
export interface TodoFilter {
  categoryId: string | null;
  showCompleted: boolean;
  searchTerm?: string;
}

/**
 * Default filter values
 */
export const DEFAULT_FILTER: TodoFilter = {
  categoryId: null,
  showCompleted: true,
  searchTerm: ''
};

/**
 * Component configuration
 */
const COMPONENT_CONFIG = {
  debounceTime: 300,
  maxTitleLength: 100,
  defaultCategoryIcon: 'pricetag',
  defaultCategoryColor: '#9e9e9e',
  toastDuration: 3000
};

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  host: {
    'class': 'todo-list-container',
    'role': 'region',
    'aria-label': 'Todo List'
  }
})
export class TodoListComponent implements OnInit, OnDestroy {
  // Public properties
  public readonly todos$ = this.todoService.todos$;
  public readonly categories$ = this.categoryService.categories$;
  public newTodoTitle = '';
  public selectedCategoryId: string | null = null;
  public showCompleted = true;
  public isLoading = false;
  
  // Private properties
  private readonly filterSubject = new BehaviorSubject<TodoFilter>(DEFAULT_FILTER);
  private readonly destroy$ = new Subject<void>();
  
  // Computed properties
  public readonly filteredTodos$: Observable<Todo[]> = combineLatest([
    this.todos$,
    this.filterSubject.pipe(distinctUntilChanged((prev, curr) => 
      prev.categoryId === curr.categoryId && 
      prev.showCompleted === curr.showCompleted &&
      prev.searchTerm === curr.searchTerm
    ))
  ]).pipe(
    map(([todos, filter]) => this.filterTodos(todos, filter)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * TrackBy function for todo items
   */
  public trackByTodoId: TrackByFunction<Todo> = (index: number, todo: Todo) => todo.id;

  /**
   * TrackBy function for category items
   */
  public trackByCategoryId: TrackByFunction<Category> = (index: number, category: Category) => category.id;
  
  /**
   * Filters todos based on the current filter state
   */
  private filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
    if (!todos || !Array.isArray(todos)) return [];
    
    return todos.filter(todo => {
      const matchesCategory = !filter.categoryId || todo.categoryId === filter.categoryId;
      const matchesCompletion = filter.showCompleted || !todo.completed;
      const matchesSearch = !filter.searchTerm || 
        todo.title.toLowerCase().includes(filter.searchTerm.toLowerCase());
        
      return matchesCategory && matchesCompletion && matchesSearch;
    });
  }
  
  constructor(
    private readonly todoService: TodoService,
    private readonly categoryService: CategoryService,
    private readonly modalCtrl: ModalController,
    private readonly alertController: AlertController,
    private readonly cdr: ChangeDetectorRef
  ) {}
  
  /**
   * Clean up subscriptions
   */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Component initialization
   */
  public ngOnInit(): void {
    this.loadInitialData();
  }
  
  /**
   * Load initial data
   */
  private loadInitialData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    // Subscribe to the todos$ observable to handle loading state
    this.todos$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: Error) => {
        console.error('Error loading todos:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
        this.showErrorAlert('Failed to load todos. Please try again later.');
      }
    });
  }

  /**
   * Adds a new todo item
   */
  public async addTodo(): Promise<void> {
    try {
      const title = this.newTodoTitle.trim();
      
      if (!title) {
        await this.showErrorAlert('Please enter a task title');
        return;
      }
      
      if (title.length > COMPONENT_CONFIG.maxTitleLength) {
        await this.showErrorAlert(`Title is too long. Maximum ${COMPONENT_CONFIG.maxTitleLength} characters allowed.`);
        return;
      }
      
      this.isLoading = true;
      this.cdr.markForCheck();
      
      await this.todoService.addTodo(title, this.selectedCategoryId || undefined);
      
      // Reset form
      this.newTodoTitle = '';
      this.isLoading = false;
      this.cdr.markForCheck();
      
    } catch (error) {
      console.error('Error adding todo:', error);
      this.isLoading = false;
      this.cdr.markForCheck();
      await this.showErrorAlert('Failed to add todo. Please try again.');
    }
  }

  /**
   * Toggles the completion status of a todo
   * @param id The ID of the todo to toggle
   */
  public async toggleTodo(id: string): Promise<void> {
    if (!id) {
      console.warn('Cannot toggle todo: Invalid ID');
      return;
    }
    
    try {
      this.isLoading = true;
      this.cdr.markForCheck();
      
      await this.todoService.toggleTodo(id);
      
      this.isLoading = false;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error toggling todo:', error);
      this.isLoading = false;
      this.cdr.markForCheck();
      await this.showErrorAlert('Failed to update todo status. Please try again.');
    }
  }

  /**
   * Shows a confirmation dialog before deleting a todo
   * @param todo The todo to delete
   */
  public async deleteTodo(todo: Todo): Promise<void> {
    try {
      const alert = await this.alertController.create({
        header: 'Delete Todo',
        message: 'Are you sure you want to delete this todo?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            cssClass: 'danger',
            handler: async () => {
              try {
                await this.todoService.deleteTodo(todo.id);
              } catch (error) {
                console.error('Error deleting todo:', error);
                await this.showErrorAlert('Failed to delete todo. Please try again.');
              }
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error showing delete confirmation:', error);
    }
  }
  
  /**
   * Shows an error alert with the given message
   * @param message The error message to display
   * @param header Optional header text (defaults to 'Error')
   */
  private async showErrorAlert(message: string, header: string = 'Error'): Promise<void> {
    if (!message) {
      console.warn('Error message is empty');
      return;
    }
    
    try {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: ['OK'],
        cssClass: 'error-alert'
      });
      
      await alert.present();
    } catch (error) {
      console.error('Error showing error alert:', error);
    }
  }

  /**
   * Opens the category manager modal
   */
  public async openCategoryManager(): Promise<void> {
    if (this.isLoading) {
      console.warn('Category manager cannot be opened while loading');
      return;
    }
    
    try {
      this.isLoading = true;
      this.cdr.markForCheck();
      
      const modal = await this.modalCtrl.create({
        component: CategoryManagerComponent,
        cssClass: 'auto-height',
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.8,
        backdropDismiss: true,
        showBackdrop: true,
        componentProps: {
          onDismiss: () => this.onCategoryManagerDismissed()
        }
      });
      
      await modal.present();
      
      const { data } = await modal.onDidDismiss();
      this.handleCategoryManagerDismiss(data);
      
    } catch (error) {
      console.error('Error opening category manager:', error);
      await this.showErrorAlert('Failed to open category manager. Please try again.');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
  
  /**
   * Handles category manager dismissal
   * @param data Data returned from the modal
   */
  private handleCategoryManagerDismiss(data?: any): void {
    if (data?.refresh) {
      this.cdr.markForCheck();
    }
  }
  
  /**
   * Called when the category manager is dismissed
   */
  private onCategoryManagerDismissed(): void {
    this.cdr.markForCheck();
  }
  
  /**
   * Handles category filter changes
   * @param event The segment change event
   */
  public filterByCategory(event: Event): void {
    const customEvent = event as CustomEvent<SegmentChangeEventDetail>;
    if (!customEvent?.detail) {
      console.warn('Invalid segment change event');
      return;
    }
    
    try {
      const value = customEvent.detail.value;
      this.selectedCategoryId = value === 'all' ? null : (value?.toString() || null);
      this.updateFilter();
    } catch (error) {
      console.error('Error handling category filter change:', error);
    }
  }
  
  /**
   * Toggles the completed todos filter
   */
  public toggleCompleted(): void {
    try {
      this.showCompleted = !this.showCompleted;
      this.updateFilter();
    } catch (error) {
      console.error('Error toggling completed filter:', error);
    }
  }
  
  /**
   * Updates the filter with current values
   */
  private updateFilter(): void {
    this.filterSubject.next({
      categoryId: this.selectedCategoryId,
      showCompleted: this.showCompleted
    });
  }
  
  /**
   * Gets the color for a todo's category
   * @param todo The todo item
   * @returns The category color or default color if not found
   */
  public getCategoryColor(todo: Todo): string {
    if (!todo?.categoryId) {
      return COMPONENT_CONFIG.defaultCategoryColor;
    }
    
    try {
      const category = this.getCategoryById(todo.categoryId);
      return category?.color || COMPONENT_CONFIG.defaultCategoryColor;
    } catch (error) {
      console.error('Error getting category color:', error);
      return COMPONENT_CONFIG.defaultCategoryColor;
    }
  }
  
  /**
   * Gets the icon for a todo's category
   * @param todo The todo item
   * @returns The category icon or default icon if not found
   */
  public getCategoryIcon(todo: Todo): string {
    if (!todo?.categoryId) {
      return COMPONENT_CONFIG.defaultCategoryIcon;
    }
    
    try {
      const category = this.getCategoryById(todo.categoryId);
      return category?.icon || COMPONENT_CONFIG.defaultCategoryIcon;
    } catch (error) {
      console.error('Error getting category icon:', error);
      return COMPONENT_CONFIG.defaultCategoryIcon;
    }
  }
  
  /**
   * Gets a category by its ID
   * @param categoryId The ID of the category to find
   * @returns The category or undefined if not found
   */
  public getCategoryById(categoryId: string): Category | undefined {
    if (!categoryId) {
      return undefined;
    }
    
    try {
      return this.categoryService.getCategoryByIdSync(categoryId);
    } catch (error) {
      console.error(`Error getting category with ID ${categoryId}:`, error);
      return undefined;
    }
  }
  
  /**
   * Handles search input changes
   * @param event The input event
   */
  /**
   * Handles search input changes
   * @param event The input event
   */
  public onSearchChange(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    
    try {
      const searchTerm = event.target.value?.trim() || '';
      this.filterSubject.next({
        ...this.filterSubject.value,
        searchTerm
      });
    } catch (error) {
      console.error('Error handling search change:', error);
    }
  }
}
