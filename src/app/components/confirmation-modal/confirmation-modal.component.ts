import { Component, Input, Output, EventEmitter } from '@angular/core';
import { WebsocketService } from 'src/app/services/websocket.service';
import { RXCore } from 'src/rxcore';

@Component({
  selector: 'confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
  @Input() opened: boolean;
  @Input() annotation: any; 
  @Input() text: string;
  @Input() action: string;
  @Output() closed = new EventEmitter<void>();

  constructor(private websocketService: WebsocketService) {}

  cancel() {
    this.opened = false;
    this.closed.emit();
  }

  confirm(action): void {
    if (action === 'FOLLOW') { window.open(this.annotation.linkURL, '_blank'); } 
    else { 
      this.annotation.bhaveLink = false;
      console.log('RxCore deleteMarkUp confirm: this.annotation', this.annotation);

      RXCore.deleteMarkupbyGUID(this.annotation.uniqueID)
      // RXCore.deleteMarkUp(); 
      let operation = { created: false, modified: false, deleted: true };

      this.annotation.getJSONUniqueID(operation).then((jsondata) => {
        console.log('RxCore deleteMarkUp confirm:', jsondata);
        const data = JSON.parse(jsondata);

        data.operation = operation;

        console.log('RxCore deleteMarkUp confirm: data.operation', data.operation);

        this.websocketService.broadcastGuiMarkup({ annotation: JSON.stringify(data) });
      });
    }
    this.cancel();
  }

  markupLink() {
    return this.annotation.linkURL.length > 70 ? this.annotation.linkURL.slice(0, 70) + '...' : this.annotation.linkURL;
  }

}
