import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-category-manager',
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class CategoryManagerComponent implements OnInit {
  categories$ = this.categoryService.categories$;
  newCategoryName = '';
  newCategoryColor = '#4CAF50';
  newCategoryIcon = 'folder';

  // Available icons for categories
  availableIcons = [
    'home', 'briefcase', 'cart', 'fitness', 'restaurant',
    'airplane', 'book', 'build', 'car', 'color-palette',
    'game-controller', 'headset', 'heart', 'musical-notes',
    'paw', 'phone-portrait', 'shirt', 'star', 'trophy', 'wine'
  ];

  // Predefined color palette
  colorPalette = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF5722', // Deep Orange
    '#FFC107', // Amber
    '#607D8B', // Blue Grey
    '#E91E63', // Pink
    '#3F51B5', // Indigo
    '#00BCD4', // Cyan
    '#8BC34A'  // Light Green
  ];

  constructor(
    private categoryService: CategoryService,
    private modalCtrl: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  async addCategory() {
    if (this.newCategoryName.trim()) {
      await this.categoryService.addCategory(
        this.newCategoryName.trim(),
        this.newCategoryColor,
        this.newCategoryIcon
      );
      this.newCategoryName = '';
      this.newCategoryColor = '#4CAF50';
      this.newCategoryIcon = 'folder';
    }
  }

  async editCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Edit Category',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: category.name,
          placeholder: 'Category name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: async (data) => {
            if (data.name.trim()) {
              await this.categoryService.updateCategory(category.id, {
                name: data.name.trim(),
                color: category.color,
                icon: category.icon
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteCategory(category: Category) {
    const alert = await this.alertController.create({
      header: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"? This will not delete tasks in this category.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: async () => {
            await this.categoryService.deleteCategory(category.id);
          }
        }
      ]
    });

    await alert.present();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
