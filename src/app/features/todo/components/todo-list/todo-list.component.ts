import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TodoService, Todo } from '../../services/todo.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class TodoListComponent implements OnInit {
  todos$ = this.todoService.todos$;
  newTodoTitle = '';

  constructor(
    private todoService: TodoService,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  async addTodo() {
    if (this.newTodoTitle.trim()) {
      await this.todoService.addTodo(this.newTodoTitle.trim());
      this.newTodoTitle = '';
    }
  }

  async toggleTodo(id: string) {
    await this.todoService.toggleTodo(id);
  }

  async deleteTodo(id: string) {
    const alert = await this.alertController.create({
      header: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            await this.todoService.deleteTodo(id);
          }
        }
      ]
    });

    await alert.present();
  }
}
