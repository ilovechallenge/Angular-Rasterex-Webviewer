import { AfterViewInit, Component } from '@angular/core';
import { FileGaleryService } from '../../components/file-galery/file-galery.service';
import { RxCoreService } from '../../services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { NotificationService } from '../../components/notification/notification.service';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { WebsocketService } from '../../services/websocket.service';
import { Router } from '@angular/router';
import { UserService } from '../auth/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  guiConfig$ = this.rxCoreService.guiConfig$;
  title: string = 'rasterex-viewer';
  numOpenFiles$ = this.rxCoreService.numOpenedFiles$;
  annotation: any;
  rectangle: any;
  isVisible: boolean = true;
  followLink: boolean = false;
  eventUploadFile: boolean = false;
  lists: any[] = [];
  state: any;
  bfoxitreadycalled : boolean = true;
  bguireadycalled : boolean = false;
  timeoutId: any;
  pasteStyle: { [key: string]: string } = { display: 'none' };

  constructor(
    private readonly rxCoreService: RxCoreService,
    private router: Router,
    private userService: UserService,
    private readonly fileGaleryService: FileGaleryService,
    private readonly websocketService: WebsocketService,
    private readonly notificationService: NotificationService) { }

  ngOnInit() {
    this.userService.isAuthenticated.subscribe(status => {
      if (!status) {
        this.router.navigate(['login']);
      }
    });
    this.fileGaleryService.getEventUploadFile().subscribe(event => this.eventUploadFile = event);
    this.fileGaleryService.modalOpened$.subscribe(opened => {
      if (!opened) {
        this.eventUploadFile = false;
      }
    });

    this.websocketService.connectSocket();
  }

  ngOnDestroy() {
    this.websocketService.disconnectSocket();
  }

  ngAfterViewInit(): void {
    RXCore.initialize({ offsetWidth: 0, offsetHeight: 0});
    RXCore.disablewelcome(true);
    RXCore.scaleOnResize(false);
    RXCore.restrictPan(false);

    RXCore.onGuiReady(() => {

      this.bguireadycalled = true;
      console.log('RxCore GUI_Ready.');
      console.log(`Read Only Mode - ${RXCore.getReadOnly()}.`);
      RXCore.setdisplayBackground(document.documentElement.style.getPropertyValue("--background") || '#D6DADC');
      RXCore.setrxprintdiv(document.getElementById('printdiv'));
    });

    RXCore.onGuiFoxitReady(() => {

      /*if(!this.bguireadycalled){
        return;
      }*/

      this.rxCoreService.guiFoxitReady.next();


      /*if(this.bfoxitreadycalled){

        this.bfoxitreadycalled = false;

        let drawing : string = "C:\\\\Rasterex\\\\Upload\\\\2TOUR - Original.pdf";
        let filename : string = "2TOUR - Original.pdf";

        let drawingobj : any = {filepath : drawing, mime : null, cacheid : filename, displayname : null};

        
        RXCore.openFile(drawingobj);
        
      }*/


    });

    RXCore.onGuiState((state: any) => {
      console.log('RxCore GUI_State:', state);
      console.log('RxCore GUI_State:', state.source);

      this.state = state;
      this.rxCoreService.setNumOpenFiles(state?.numOpenFiles);
      this.rxCoreService.setGuiState(state);

      if (this.eventUploadFile) this.fileGaleryService.sendStatusActiveDocument('awaitingSetActiveDocument');
      if ((state.source === 'forcepagesState' && state.isPDF) || (state.source === 'setActiveDocument' && !state.isPDF)) {
        this.fileGaleryService.sendStatusActiveDocument(state.source);
        this.eventUploadFile = false;
      }
    });

    RXCore.onGuiPage((state) => {
     this.rxCoreService.guiPage.next(state);
    });

    RXCore.onGuiFileLoadComplete(() => {
      this.rxCoreService.guiFileLoadComplete.next();
    });

    RXCore.onGuiMarkup((annotation: any, operation: any) => {
      console.log('RxCore GUI_Markup:', annotation, operation);
      if (annotation !== -1 || this.rxCoreService.lastGuiMarkup.markup !== -1) {
        if (annotation !== -1) {
          console.log('RxCore onGuiMarkup annotation: ', annotation);

          // let userName = localStorage.getItem('userName');
          // annotation['annotationUser'] = userName;

          annotation.getJSONUniqueID(operation).then((jsondata) => {
 
            const data = JSON.parse(jsondata);
 
            data.operation = operation;
 
            console.log(data.operation);
 
            this.websocketService.broadcastGuiMarkup({ annotation: JSON.stringify(data) });
          });
        }
        this.rxCoreService.setGuiMarkup(annotation, operation);
      }
    });

    RXCore.onGuiMarkupHover((markup, x, y) => {
      this.rxCoreService.setGuiMarkupHover(markup, x, y);
    });

    RXCore.onGuiMarkupUnselect((markup: any) => {
      console.log('RxCore GuiMarkupUnselect :', markup.getJSON());
      const data = JSON.parse(markup.getJSON());
      data.operation = { created: false, modified: true, deleted: false };

      // let userName = localStorage.getItem('userName');
      // data['annotationUser'] = userName;
      let annotation = JSON.stringify(data);

      

      this.websocketService.broadcastGuiMarkup({ annotation: annotation });
      
      this.rxCoreService.setGuiMarkupUnselect(markup);
    });

    RXCore.onGuiMarkupList(list => {
      this.rxCoreService.setGuiMarkupList(list);
      this.lists = list?.filter(markup => markup.type != MARKUP_TYPES.SIGNATURE.type && markup.subtype != MARKUP_TYPES.SIGNATURE.subType);
      this.lists?.forEach(list => {
        setTimeout(() => {
          list.rectangle = { x: list.x + list.w - 20, y: list.y - 20 };
        }, 100);
      });
    });

    RXCore.onGuiTextInput((rectangle: any, operation: any) => {
      this.rxCoreService.setGuiTextInput(rectangle, operation);
    });

    RXCore.onGuiVectorLayers((layers) => {
      this.rxCoreService.setGuiVectorLayers(layers);
    });

    RXCore.onGuiVectorBlocks((blocks) => {
      this.rxCoreService.setGuiVectorBlocks(blocks);
    });

    RXCore.onGui3DParts((parts) => {
      this.rxCoreService.setGui3DParts(parts);
    });

    RXCore.onGui3DPartInfo(info => {
      this.rxCoreService.setGui3DPartInfo(info);
    });

    RXCore.onGuiPagethumbs((thumbnails) => {
      this.rxCoreService.setGuiPageThumbs(thumbnails);
    });

    RXCore.onGuiPagethumb((thumbnail) => {
      this.rxCoreService.setGuiPageThumb(thumbnail);
    });

    RXCore.onGuiPDFBookmarks((bookmarks) => {
      this.rxCoreService.setGuiPdfBookmarks(bookmarks);
    });

    RXCore.onGuiMarkupSave(() => {
      this.notificationService.notification({message: 'Markups have been successfully saved.', type: 'success'});
    });

    RXCore.onGuiResize(() => {
      this.rxCoreService.guiOnResize.next();
    });

    RXCore.onGuiExportComplete((fileUrl) => {
      this.rxCoreService.guiOnExportComplete.next(fileUrl);
    });

    RXCore.onGuiCompareMeasure((distance, angle, offset, pagewidth, scaleinfo) => {
      this.rxCoreService.guiOnCompareMeasure.next({distance, angle, offset, pagewidth, scaleinfo});
    });

    RXCore.onGuiMarkupChanged((annotation, operation) => {
      this.rxCoreService.guiOnMarkupChanged.next({annotation, operation});
    });

    RXCore.onGuiPanUpdated((sx, sy, pagerect) => { 
      this.rxCoreService.guiOnPanUpdated.next({sx, sy, pagerect});
    });


  }

  handleChoiceFileClick() {
    this.fileGaleryService.openModal();
  }

  onMouseDown(event): void {
    const isPasteMarkUp = this.pasteStyle['display'] === 'flex';

    if (event.button === 2 || event.type === 'touchstart') {
      this.timeoutId = setTimeout(() => {
        this.pasteStyle = { left: event.clientX - 200 + 'px', top: event.clientY - 100 + 'px', display: 'flex' };
      }, 2000);
    } else if ((event.button === 0 && isPasteMarkUp) || (event.type === 'touchstart' && isPasteMarkUp)) {
      this.pasteStyle = { display: 'none' };
    }
  }

  onMouseUp(event): void {
    if (event.button === 2 || event.type === 'touchend') clearTimeout(this.timeoutId);
  }

  pasteMarkUp(): void {
    RXCore.pasteMarkUp();
    this.pasteStyle = { display: 'none' };
  }

}
