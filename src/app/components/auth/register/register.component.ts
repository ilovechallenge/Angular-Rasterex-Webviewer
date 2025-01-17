import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { UserService } from '../user.service';
import Keyboard from "simple-keyboard";
import { HttpService } from 'src/app/services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userData;
  keyboard: Keyboard;
  value = "";
  constructor(
    private userService: UserService,
    private httpService: HttpService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.userService.currentUserData.subscribe(userData => this.userData = userData)
  }
  signUp(data){
    this.userService.changeData(data);
    this.httpService.postData('auth/create-user', data).subscribe({
      next: (response) => {
        console.log("Register response:", response)
        this.router.navigate(['/login']);
      },
      error :(error) => {
        console.error("Register error: ", error)
        alert(error);
      }
    })
  }

  ngAfterViewInit() {
    // this.keyboard = new Keyboard({
    //   onChange: input => this.onChange(input),
    //   onKeyPress: button => this.onKeyPress(button),
    //   mergeDisplay: true,
    //   layoutName: "default",
    //   layout: {
    //     default: [
    //       "q w e r t y u i o p",
    //       "a s d f g h j k l",
    //       "{shift} z x c v b n m {backspace}",
    //       "{numbers} {space} {ent}"
    //     ],
    //     shift: [
    //       "Q W E R T Y U I O P",
    //       "A S D F G H J K L",
    //       "{shift} Z X C V B N M {backspace}",
    //       "{numbers} {space} {ent}"
    //     ],
    //     numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"]
    //   },
    //   display: {
    //     "{numbers}": "123",
    //     "{ent}": "return",
    //     "{escape}": "esc ⎋",
    //     "{tab}": "tab ⇥",
    //     "{backspace}": "⌫",
    //     "{capslock}": "caps lock ⇪",
    //     "{shift}": "⇧",
    //     "{controlleft}": "ctrl ⌃",
    //     "{controlright}": "ctrl ⌃",
    //     "{altleft}": "alt ⌥",
    //     "{altright}": "alt ⌥",
    //     "{metaleft}": "cmd ⌘",
    //     "{metaright}": "cmd ⌘",
    //     "{abc}": "ABC"
    //   }
      
    // });
  }

  onChange = (input: string) => {
    this.value = input;
    console.log("Input changed", input);
  };

  onKeyPress = (button: string) => {
    console.log("Button pressed", button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") this.handleShift();
  };

  onInputChange = (event: any) => {
    this.keyboard.setInput(event.target.value);
  };

  handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";

    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  };

  handleNumbers() {
    let currentLayout = this.keyboard.options.layoutName;
    let numbersToggle = currentLayout !== "numbers" ? "numbers" : "default";

    this.keyboard.setOptions({
      layoutName: numbersToggle
    });
  }


}