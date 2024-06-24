import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'rx-line-style-select',
  templateUrl: './line-style-select.component.html',
  styleUrls: ['./line-style-select.component.scss'],
  host: {
    '(document:click)': 'handleClickOutside($event)',
    '(document:keydown)': 'handleKeyboardEvents($event)'
  }
})
export class LineStyleSelectComponent {
  @Input() value: number = 0;
  @Input() dropPosition: 'bottom' | 'top' = 'bottom';
  @Output('valueChange') onValueChange = new EventEmitter<any>();

  options: Array<string> = ["", "–––––––––", "⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅", "–⋅⋅–⋅⋅–⋅⋅–⋅⋅", "–⋅–⋅–⋅–⋅–⋅–"];
  public opened: boolean = false;
  private currentIndex = -1;

  constructor(private elem: ElementRef) { }

  ngOnInit(): void {
  }

  handleSelect(item: any) {
    this.value = item;
    this.onValueChange.emit(this.value);
    this.opened = false;
  }

  handleDropdown(): void {
    this.opened = !this.opened;
  }

  /* Listeners */
  handleClickOutside(event: any) {
    if (!this.opened) return;
    const clickedInside = this.elem.nativeElement.contains(event.target);
    if (!clickedInside) {
        this.opened = false;
    }
  }

  handleKeyboardEvents($event: KeyboardEvent) {
    if (this.opened) {
        $event.preventDefault();
    } else {
        return;
    }

    if ($event.code === 'ArrowUp') {
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        } else if (this.currentIndex > 0) {
            this.currentIndex--;
        }
        this.elem.nativeElement.querySelectorAll('li').item(this.currentIndex).focus();
    } else if ($event.code === 'ArrowDown') {
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        } else if (this.currentIndex < this.options.length-1) {
            this.currentIndex++;
        }
        this.elem.nativeElement.querySelectorAll('li').item(this.currentIndex).focus();
    } else if (($event.code === 'Enter' || $event.code === 'NumpadEnter') && this.currentIndex >= 0) {
        this.selectByIndex(this.currentIndex);
    } else if ($event.code === 'Escape') {
        this.opened = false;
    }
  }

  private selectByIndex(i: number) {
    let value = this.options[i];
    this.handleSelect(value);
  }

}
