import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Router } from "@angular/router";
import { RecipeService } from "../recipe.service";
import { Recipe } from "../recipe.model";

@Component({
  selector: "app-recipe-list",
  templateUrl: "./recipe-list.component.html",
  styleUrls: ["./recipe-list.component.css"],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class RecipeListComponent implements OnInit {
  recipes: Recipe[] = [];
  isLoading = true;
  errorMessage = "";
  selectedCategory = "all";
  categories: string[] = ["all"];

  constructor(private recipeService: RecipeService, private router: Router) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.isLoading = true;
    this.recipeService.getRecipes().subscribe({
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

  toggleLike(recipe: Recipe): void {
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
}
