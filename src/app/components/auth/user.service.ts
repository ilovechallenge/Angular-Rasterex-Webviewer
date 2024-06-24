import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class UserService {
  private userDataSource = new BehaviorSubject({});
  currentUserData = this.userDataSource.asObservable();

  private token = localStorage.getItem('accessToken');

  private loginFlag = new BehaviorSubject(this.token != null ? true : false );
  isAuthenticated = this.loginFlag.asObservable();


  constructor(
    private router: Router,
  ) { }
  changeData(newUserData: string) {
    this.userDataSource.next(newUserData)
  }
  changeLoginStatus(newStatus: boolean) {
    this.loginFlag.next(newStatus);
  }
  logout () {
    this.changeLoginStatus(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}