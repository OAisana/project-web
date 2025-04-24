import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Router } from "@angular/router";
import { RecipeService } from "../recipe.service";
import { FormsModule } from "@angular/forms";
import { Recipe } from "../recipe.model";
import { CommentFormComponent } from "../comment-form/comment-form.component";
import { CommentListComponent } from "../comment-list/comment-list.component";

@Component({
  selector: "app-recipe-forum",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CommentListComponent,
    CommentFormComponent,
    FormsModule,
  ],
  templateUrl: "./recipe-forum.component.html",
  styleUrl: "./recipe-forum.component.css",
})
export class RecipeForumComponent implements OnInit {
  recipes: Recipe[] = [];
  isLoading = true;
  errorMessage = "";
  selectedCategory = "all";
  categories: string[] = ["all"];
  expandedRecipeId: number | null = null;
  commentingOnRecipe: number | null = null;

  constructor(private recipeService: RecipeService, private router: Router) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.isLoading = true;
    this.recipeService.getAllRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.extractCategories();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = "Failed to load recipes. Please try again later.";
        this.isLoading = false;
      },
    });
  }

  extractCategories(): void {
    const uniqueCategories = new Set<string>();
    this.recipes.forEach((recipe) => {
      if (recipe.category) {
        uniqueCategories.add(recipe.category);
      }
    });
    this.categories = ["all", ...Array.from(uniqueCategories)];
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
  }

  get filteredRecipes(): Recipe[] {
    if (this.selectedCategory === "all") {
      return this.recipes;
    }
    return this.recipes.filter(
      (recipe) => recipe.category === this.selectedCategory
    );
  }

  onAddRecipe(): void {
    this.router.navigate(["/recipes/new"]);
  }

  navigateToRecipe(id: number): void {
    this.router.navigate(["/recipes", id]);
  }

  toggleLike(recipe: Recipe, event: Event): void {
    event.stopPropagation();

    this.recipeService.toggleLike(recipe.id).subscribe({
      next: (response) => {
        recipe.is_liked = response.liked;
        recipe.likes_count = response.likes_count;
      },
      error: (error) => {
        console.error("Failed to toggle like:", error);
      },
    });
  }

  toggleComments(recipeId: number, event: Event): void {
    event.stopPropagation();

    if (this.expandedRecipeId === recipeId) {
      this.expandedRecipeId = null;
    } else {
      this.expandedRecipeId = recipeId;
    }
  }

  startCommenting(recipeId: number, event: Event): void {
    event.stopPropagation();

    if (this.commentingOnRecipe === recipeId) {
      this.commentingOnRecipe = null;
    } else {
      this.commentingOnRecipe = recipeId;
      if (this.expandedRecipeId !== recipeId) {
        this.expandedRecipeId = recipeId;
      }
    }
  }

  onCommentAdded(recipeId: number): void {
    this.recipeService.getRecipe(recipeId).subscribe({
      next: (updatedRecipe) => {
        const index = this.recipes.findIndex((r) => r.id === recipeId);
        if (index !== -1) {
          this.recipes[index].comments_count = updatedRecipe.comments_count;
        }
      },
    });

    this.commentingOnRecipe = null;
  }
}
