import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  lkBaseUrl = 'http://134.0.115.32:8080/unnamed/lk/';
  lkLoginUrl = this.lkBaseUrl + 'login';
  lkRegisterUrl = this.lkBaseUrl + 'register';

  errorResponse = 'failed';
  lastError = '';

  constructor(private router: Router, private http: HttpClient) {
    if (localStorage.getItem('key') !== null) {
      window.location.href = '/admin';
    }
  }

  ngOnInit(): void {
  }

  login(): void {
    this.http.post(this.lkLoginUrl, {
      username: this.username,
      password: this.password
    }).subscribe(data => {
      const response: any = data;

      if (response.status !== this.errorResponse) {
        localStorage.setItem('key', response.key);
        this.router.navigate(['admin']);
      } else {
        this.lastError = 'Failed to login';
      }
    });
  }

  register(): void {
    this.http.post(this.lkRegisterUrl, {
      username: this.username,
      password: this.password
    }).subscribe((data) => {
      const response: any = data;

      if (response.status !== this.errorResponse) {
        localStorage.setItem('key', response.key);
        this.router.navigate(['admin']);
      } else {
        this.lastError = 'Failed to register';
      }
    });
  }
}
