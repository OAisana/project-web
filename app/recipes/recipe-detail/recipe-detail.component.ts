import { Component, OnInit } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ActivatedRoute, Router } from "@angular/router";
import { RecipeService } from "../recipe.service";
import { Recipe } from "../recipe.model";
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: "app-recipe-detail",
  templateUrl: "./recipe-detail.component.html",
  styleUrls: ["./recipe-detail.component.css"],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  isLoading = true;
  errorMessage = "";
  isOwner = false;
  currentUserId: number | null = null;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      this.currentUserId = user?.id || null;
      this.loadRecipe();
    });
  }

  loadRecipe(): void {
    this.isLoading = true;
    const recipeId = Number(this.route.snapshot.paramMap.get("id"));

    if (isNaN(recipeId)) {
      this.errorMessage = "Invalid recipe ID";
      this.isLoading = false;
      return;
    }

    this.recipeService.getRecipe(recipeId).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.isOwner = this.currentUserId === recipe.created_by;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          "Could not load recipe. It may have been deleted or you may not have permission to view it.";
        this.isLoading = false;
      },
    });
  }

  onEdit(): void {
    if (this.recipe) {
      this.router.navigate(["/recipes", this.recipe.id, "edit"]);
    }
  }

  onDelete(): void {
    if (
      !this.recipe ||
      !confirm(
        "Are you sure you want to delete this recipe? This action cannot be undone."
      )
    ) {
      return;
    }

    this.recipeService.deleteRecipe(this.recipe.id).subscribe({
      next: () => {
        this.router.navigate(["/recipes"]);
      },
      error: (error) => {
        this.errorMessage = "Failed to delete recipe. Please try again.";
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
