import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://127.0.0.1:8000/api/token/';

  constructor(private http: HttpClient) {}

  login(credentials: any) {
    return this.http.post(this.loginUrl, credentials);
  }
}
