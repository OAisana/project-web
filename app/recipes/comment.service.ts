import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Comment } from "./comment.model";
import { AuthService } from "../auth/auth.service";
@Injectable({
  providedIn: "root",
})
export class CommentService {
  private apiUrl = "http://localhost:8000/api/";

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.token();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  }

  getComments(recipeId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.apiUrl}recipes/${recipeId}/comments/`,
      { headers: this.getHeaders() }
    );
  }

  addComment(recipeId: number, content: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}recipes/${recipeId}/comments/`,
      { recipe: recipeId, content },
      { headers: this.getHeaders() }
    );
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}/`);
  }

  updateComment(commentId: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}/`, { content });
  }
}
