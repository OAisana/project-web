import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../recipe.model';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class RecipeFormComponent implements OnInit {
  recipeForm: FormGroup;
  isEdit = false;
  recipeId: number | null = null;
  isSubmitting = false;
  errorMessage = '';
  categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Vegetarian', 'Vegan', 'Gluten-free', 'Other'];

  constructor(
    private formBuilder: FormBuilder,
    private recipeService: RecipeService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.recipeForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.recipeId = Number(id);
      this.loadRecipe(this.recipeId);
    }
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      ingredients: this.formBuilder.array([this.createIngredient()], Validators.required),
      instructions: ['', [Validators.required, Validators.minLength(20)]],
      cooking_time: [30, [Validators.required, Validators.min(1)]],
      servings: [4, [Validators.required, Validators.min(1)]],
      image: [''],
      category: ['Other', Validators.required]
    });
  }

  createIngredient(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  get ingredientsControls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  addIngredient(): void {
    const ingredients = this.recipeForm.get('ingredients') as FormArray;
    ingredients.push(this.createIngredient());
  }

  removeIngredient(index: number): void {
    const ingredients = this.recipeForm.get('ingredients') as FormArray;
    if (ingredients.length > 1) {
      ingredients.removeAt(index);
    }
  }

  loadRecipe(id: number): void {
    this.recipeService.getRecipe(id).subscribe({
      next: (recipe) => {
        const ingredientsArray = this.recipeForm.get('ingredients') as FormArray;
        while (ingredientsArray.length !== 0) {
          ingredientsArray.removeAt(0);
        }

        recipe.ingredients.forEach(ingredient => {
          ingredientsArray.push(
            this.formBuilder.group({
              name: [ingredient, Validators.required]
            })
          );
        });

        this.recipeForm.patchValue({
          title: recipe.title,
          description: recipe.description,
          instructions: recipe.instructions,
          cooking_time: recipe.cooking_time,
          servings: recipe.servings,
          image: recipe.image || '',
          category: recipe.category || 'Other'
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load recipe. It may have been deleted or you may not have permission to edit it.';
      }
    });
  }

  onSubmit(): void {
    if (this.recipeForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.recipeForm.value;
    const recipeData = {
      ...formValue,
      ingredients: formValue.ingredients.map((item: { name: string }) => item.name)
    };

    if (this.isEdit && this.recipeId) {
      this.recipeService.updateRecipe(this.recipeId, recipeData).subscribe({
        next: (recipe) => {
          this.router.navigate(['/recipes', recipe.id]);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update recipe. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.recipeService.createRecipe(recipeData).subscribe({
        next: (recipe) => {
          this.router.navigate(['/recipes', recipe.id]);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create recipe. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEdit && this.recipeId) {
      this.router.navigate(['/recipes', this.recipeId]);
    } else {
      this.router.navigate(['/recipes']);
    }
  }
}