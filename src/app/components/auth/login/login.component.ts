import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";
import { HttpService } from "src/app/services/http.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  userData;
  isLoading = false;
  isError = false;

  constructor(
    private userService: UserService,
    private httpService: HttpService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.userService.currentUserData.subscribe(userData => (this.userData = userData));
  }

  changeData(event) {
    var msg = event.target.value;
    this.userService.changeData(msg);
  }

  login(data) {
    this.isLoading = true;
    this.isError = false;
    this.userService.changeData(data);
    this.httpService.postData('auth/login', data).subscribe({
      next: (response) => {
        console.log("Login success:", response);
        if (response.accessToken) {
          localStorage.setItem('userId', response.data.id);
          localStorage.setItem('userName', response.data.name);
          localStorage.setItem('accessToken', response.accessToken);
          this.userService.changeLoginStatus(true);
          // window.location.assign('http://viewserver.rasterex.com/collaboration/');
          this.router.navigate(['/home']);
        }
        this.isLoading = false; 
      },
      error: (error) => {
        console.error("Login failed:", error);
        this.isError = true;
        this.isLoading = false;
      } 
    })
  }
}
