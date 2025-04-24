import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Router } from "@angular/router";

import { environment } from "../../environments/environment";
import { User } from "./user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = "recipe_book_token";
  private userKey = "recipe_book_user";

  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private _currentUser = new BehaviorSubject<User | null>(
    this.loadUserFromStorage()
  );

  constructor(private http: HttpClient, private router: Router) {}

  get isLoggedIn(): Observable<boolean> {
    return this._isLoggedIn.asObservable();
  }

  get currentUser(): Observable<User | null> {
    return this._currentUser.asObservable();
  }

  token(): string | null {
    const t = localStorage.getItem(this.tokenKey);
    return t;
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register/`, { username, email, password })
      .pipe(
        catchError((error) => {
          return throwError(
            () => new Error(error.error.detail || "Registration failed")
          );
        })
      );
  }

  login(username: string, password: string): Observable<any> {
    return this.http
      .post<{ access: string; refresh: string; user: User }>(
        `${this.apiUrl}/login/`,
        { username, password }
      )
      .pipe(
        tap((response) => {
          console.log("Login response:", response);
          this.setAuthData(response.access, response.user);
        }),
        catchError((error) => {
          return throwError(
            () => new Error(error.error.detail || "Login failed")
          );
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._isLoggedIn.next(false);
    this._currentUser.next(null);
    this.router.navigate(["/login"]);
  }

  checkAuthStatus(): void {
    if (this.hasToken()) {
      const user = this.loadUserFromStorage();
      if (user) {
        this._currentUser.next(user);
        this._isLoggedIn.next(true);
      } else {
        this.logout();
      }
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  private setAuthData(access: string, user: User): void {
    localStorage.setItem(this.tokenKey, access);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this._isLoggedIn.next(true);
    this._currentUser.next(user);
  }
}
