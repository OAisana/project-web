import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Recipe, RecipeCreate } from "./recipe.model";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class RecipeService {
  private apiUrl = `${environment.apiUrl}/recipes/`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  getRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getAllRecipes(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}all/`, {
      headers: this.getHeaders(),
    });
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}${id}/`, {
      headers: this.getHeaders(),
    });
  }

  createRecipe(recipe: RecipeCreate): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe, {
      headers: this.getHeaders(),
    });
  }

  updateRecipe(id: number, recipe: RecipeCreate): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}${id}/`, recipe, {
      headers: this.getHeaders(),
    });
  }

  deleteRecipe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, {
      headers: this.getHeaders(),
    });
  }

  toggleLike(id: number): Observable<{ liked: boolean; likes_count: number }> {
    return this.http.post<{ liked: boolean; likes_count: number }>(
      `${this.apiUrl}${id}/like/`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
