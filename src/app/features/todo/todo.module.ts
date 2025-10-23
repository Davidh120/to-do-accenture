import { NgModule } from '@angular/core';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@NgModule({
  imports: [
    TodoListComponent
  ],
  exports: [
    TodoListComponent
  ]
})
export class TodoModule { }
