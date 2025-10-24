import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, IonModal, PopoverController } from '@ionic/angular';
import { tap } from 'rxjs/operators';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { IconPickerComponent } from '../icon-picker/icon-picker.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';

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
  categories$ = this.categoryService.categories$.pipe(
    tap((categories: Category[]) => console.log('Categories loaded:', categories))
  );
  isLoading = true;
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

  showColorPickerFlag = false;
  
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

  @ViewChild('colorPicker') colorPicker!: IonModal;
  @ViewChild('iconPicker') iconPicker!: IonModal;

  constructor(
    private categoryService: CategoryService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {
    // Ensure categories are loaded
    this.categoryService.categories$.subscribe({
      next: () => this.isLoading = false,
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading = false;
      }
    });
  }

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

  // Show the icon picker popover
  async showIconPicker(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: IconPickerComponent,
      componentProps: {
        icons: this.availableIcons,
        selectedIcon: this.newCategoryIcon
      },
      event: ev,
      cssClass: 'icon-picker-popover',
      showBackdrop: true,
      translucent: true
    });

    popover.onDidDismiss().then(({ data }) => {
      if (data) {
        this.newCategoryIcon = data;
      }
    });

    await popover.present();
  }

  // Show the color picker
  showColorPicker(ev: Event) {
    ev.stopPropagation();
    this.showColorPickerFlag = true;
  }

  // Show the color picker popover
  async showColorPickerPopover(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: ColorPickerComponent,
      componentProps: {
        colors: this.colorPalette,
        selectedColor: this.newCategoryColor
      },
      event: ev,
      cssClass: 'color-picker-popover',
      showBackdrop: true,
      translucent: true
    });

    popover.onDidDismiss().then(({ data }) => {
      if (data) {
        this.newCategoryColor = data;
      }
    });

    await popover.present();
  }

  // Select a color from the picker
  selectColor(color: string) {
    this.newCategoryColor = color;
    this.showColorPickerFlag = false;
  }

  // Select an icon from the picker
  selectIcon(icon: string) {
    this.newCategoryIcon = icon;
    this.iconPicker.dismiss();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
