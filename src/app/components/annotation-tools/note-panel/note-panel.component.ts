import { Component, OnInit } from '@angular/core';
import { AnnotationToolsService } from '../annotation-tools.service';
import { RXCore } from 'src/rxcore';
import { IMarkup } from 'src/rxcore/models/IMarkup';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { RxCoreService } from 'src/app/services/rxcore.service';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { Subscription } from 'rxjs';

declare var LeaderLine: any;

@Component({
  selector: 'rx-note-panel',
  templateUrl: './note-panel.component.html',
  styleUrls: ['./note-panel.component.scss'],
  host: {
    '(window:resize)': 'onWindowResize($event)'
  }
})
export class NotePanelComponent implements OnInit {
  visible: boolean = false;
  list: { [key: string]: Array<IMarkup> };
  search: string;
  panelwidth : number = 300;
  user_name = localStorage.getItem('userName') ?? "demo";


  /*added for comment list panel */
  note: any[] = [];
  connectorLine: any;
  lineConnectorNativElement: any = document.getElementById('lineConnector');
  activeMarkupNumber: number = -1;
  markupNoteList: number[] = [];
  noteIndex: number;
 /*added for comment list panel */

  sortByField: 'created' | 'author' = 'created';
  sortOptions = [
    { value: "created", label: "Created day" },
    { value: "author", label: "Author" }
  ];
  sortOrder = (a, b): number => 0;
  filterVisible: boolean = false;
  createdByFilterOptions: Array<any> = [];
  createdByFilter: Set<string> = new Set<string>();
  dateFilter: {
    startDate: dayjs.Dayjs | undefined,
    endDate: dayjs.Dayjs | undefined
  } = { startDate: undefined, endDate: undefined};

  /*added for comment list panel */
  private guiOnPanUpdatedSubscription: Subscription;
  /*added for comment list panel */

  leaderLine: any = undefined;
  rectangle: any;

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService) {
      dayjs.extend(relativeTime);
      dayjs.extend(updateLocale);
      dayjs.extend(isSameOrAfter);
      dayjs.extend(isSameOrBefore);
      dayjs.updateLocale('en', {
        relativeTime: {
          past: "%s",
          s: 'A few seconds ago',
          m: "A minute ago",
          mm: function (number) {
            return number > 10 ? `${number} minutes ago` : "A few minutes ago";
          },
          h: "An hour ago",
          hh:"Today",
          d: "Yesterday",
          dd: function (number) {
            return number > 1 ? `${number} days ago` : "Yesterday";
          },
          M: "A month ago",
          MM: "%d months ago",
          y: "A year ago",
          yy: "%d years ago"
        }
      });
    }

  private _showLeaderLine(markup: IMarkup): void {
    this._hideLeaderLine();

    const start = document.getElementById(`note-panel-${markup.markupnumber}`);
    if (!start) return;

    const end = document.createElement('div');
    end.style.position = 'fixed';
    end.style.left = `${markup.xscaled + 92}px`;
    end.style.top = `${markup.yscaled + 58}px`;
    end.className = 'leader-line-end';
    document.body.appendChild(end);

    this.leaderLine = new LeaderLine({
      start,
      end,
      color: document.documentElement.style.getPropertyValue("--accent"),
      size: 2,
      path: 'grid',
      endPlug: 'arrow2',
      endPlugSize: 1.5
    });
  }

  private _hideLeaderLine(): void {
    if (this.leaderLine) {
      this.leaderLine.remove();
      this.leaderLine = undefined;
    }
    document.querySelectorAll(".leader-line-end,.leader-line").forEach(el => el.remove());
  }

  private _processList(list: Array<IMarkup> = []): void {
    /*modified for comment list panel */
    const query = list
    .filter((i: any) => {
      if (this.search) {
        if (this.connectorLine)
        this.connectorLine.hide();
        let searchQuery = this.search.toLocaleLowerCase();
        let comments: any = i.comments.map((i: any) => { return i.value.toLocaleLowerCase(); });
        if (comments.find((x:string) => x.indexOf(searchQuery) > -1) || i.author.toLocaleLowerCase().includes(searchQuery) || i.getMarkupType().label.toLocaleLowerCase().includes(searchQuery)) {
          return (this.dateFilter.startDate ? dayjs(i.timestamp).isSameOrAfter(this.dateFilter.startDate) : true)
            && (this.dateFilter.endDate ? dayjs(i.timestamp).isSameOrBefore(this.dateFilter.endDate.endOf('day')) : true) && !i.bisTextArrow
        }
        return;
      } else {
        return (this.dateFilter.startDate ? dayjs(i.timestamp).isSameOrAfter(this.dateFilter.startDate) : true)
          && (this.dateFilter.endDate ? dayjs(i.timestamp).isSameOrBefore(this.dateFilter.endDate.endOf('day')) : true) && !i.bisTextArrow
      }
     }
    )/*modified for comment list panel */
    /*.filter((i: any) =>
      i.type == MARKUP_TYPES.NOTE.type
      && (!this.search || i.text?.includes(this.search))
      && (this.createdByFilter.has(i.signature)
      && (this.dateFilter.startDate ? dayjs(i.timestamp).isSameOrAfter(this.dateFilter.startDate) : true)
      && (this.dateFilter.endDate ? dayjs(i.timestamp).isSameOrBefore(this.dateFilter.endDate.endOf('day')) : true))
    )*/
    .map((item: any) => {
      console.log("fffffffff: ", item)
      // item.author = RXCore.getDisplayName(item.signature);
      item.author = item.annotationUser;
      item.createdStr = dayjs(item.timestamp).format(`MMM D,${dayjs().year() != dayjs(item.timestamp).year() ? 'YYYY ': ''} h:mm A`);
      return item;
    })
    .sort((a, b) => {
      switch(this.sortByField) {
        case 'created':
          return b.timestamp - a.timestamp;

        case 'author':
          return a.author.localeCompare(b.author);
      }
    });

    if (this.sortByField == 'created') {
      this.list = query.reduce((list, item) => {
        const date = dayjs(item.timestamp).fromNow();
        if (!list[date]) {
          list[date] = [item];
        } else {
          list[date].push(item);
        }

        return list;
      }, {});
    } else {
      this.list = {
        "": query
      }
    }
  }

  ngOnInit(): void {
    this.annotationToolsService.notePanelState$.subscribe(state => {
      /*added for comment list panel */
      this.activeMarkupNumber = state?.markupnumber;
      if (this.activeMarkupNumber) {
        this.markupNoteList.push(this.activeMarkupNumber);
        this.markupNoteList = [...new Set(this.markupNoteList)];
        let markupList = this.rxCoreService.getGuiMarkupList();
        this._processList(markupList);
        if (Object.values(this.list).length > 0) {
          setTimeout(() => {
            markupList.filter((i: any) => {
              if (i.markupnumber === this.activeMarkupNumber) {
                this.onSelectAnnotation(i);
                this._setPosition(i);
              }
            });
          }, 200);
        }
      }
      /*added for comment list panel */

      
      this.visible = state?.visible;
      if(this.visible){
        RXCore.doResize(false,this.panelwidth, 0);/*added for comment list panel */
      }else{
        RXCore.doResize(false,0, 0);/*added for comment list panel */
      }

      this._hideLeaderLine();
    });

    this.rxCoreService.guiMarkupList$.subscribe((list = []) => {
      this.createdByFilter = new Set();
      if (this.activeMarkupNumber > 0)
        this.createdByFilterOptions = Object.values(list.filter(i => i.text.length > 0).reduce((options, item) => {
          if (!options[item.signature]) {
            options[item.signature] = {
              value: item.signature,
              label: RXCore.getDisplayName(item.signature),
              selected: true
            };
            this.createdByFilter.add(item.signature);
          }
          return options;
        }, {})
        );
        
        if (list.length > 0){
          this._processList(list);
        }else{
          this._processList(list);
        }

      

      /*this.createdByFilterOptions = Object.values(list.filter(i => i.type == MARKUP_TYPES.NOTE.type).reduce((options, item) => {
        if(!options[item.signature]) {
          options[item.signature] = {
            value: item.signature,
            label: RXCore.getDisplayName(item.signature),
            selected: true
          };
          this.createdByFilter.add(item.signature);
        }
        return options;
        }, {})
      );*/

      //this._processList(list);

      /*if (this.visible && Object.values(this.list).length > 0) {
        setTimeout(() => {
          list.filter((i: any) => {
            if (i.selected) {
              this.activeMarkupNumber = i.markupnumber;
              this._setPosition(i);
            }
          });
        }, 200);
      }*/


    });

    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
      this._hideLeaderLine();

      if(operation.modified || operation.created){
        this.SetActiveCommentSelect(markup);
      }

      if(operation.created){
       
        this.addTextNote(markup);
      }


    });

    this.guiOnPanUpdatedSubscription = this.rxCoreService.guiOnPanUpdated$.subscribe(({ sx, sy, pagerect }) => {
      if (this.connectorLine) {
        RXCore.unSelectAllMarkup();
        this.annotationToolsService.hideQuickActionsMenu();
        this.connectorLine.hide();
        this._hideLeaderLine();
      }
    });


  }

  get isEmpytyList(): boolean {
    return Object.keys(this.list || {}).length == 0 || this.list[""]?.length == 0;
  }

  get isFilterActive(): boolean {
    return this.filterVisible == true
    || this.createdByFilterOptions.length != this.createdByFilter.size
    || this.dateFilter.startDate != undefined
    || this.dateFilter.endDate != undefined;
  }

  onNoteClick(markup: IMarkup): void {
    RXCore.unSelectAllMarkup();
    RXCore.selectMarkUpByIndex(markup.markupnumber);
    this.rxCoreService.setGuiMarkup(markup, {});
    this._showLeaderLine(markup);
  }

  onSearch(event): void {
    this._processList(this.rxCoreService.getGuiMarkupList());
  }

  onSortFieldChanged(event): void {
    this.sortByField = event.value;
    this._processList(this.rxCoreService.getGuiMarkupList());
  }

  onCreatedByFilterChange(values): void {
    this.createdByFilter = new Set(values);
  }

  onDateSelect(dateRange: { startDate: dayjs.Dayjs, endDate: dayjs.Dayjs }): void {
    this.dateFilter = dateRange;
  }

  onFilterApply(): void {
    this._processList(this.rxCoreService.getGuiMarkupList());
    this.filterVisible = false;
  }

  onClose(): void {
    this.visible = false;
    this._hideLeaderLine();

    RXCore.doResize(false, 0, 0);/*added for comment list panel */
  }

  onWindowResize(event): void {
    this._hideLeaderLine();
  }

  addTextNote(markup : any) : void{
    if(markup.type == 9 || markup.type == 10){
      this.note[markup.markupnumber] = markup.text;
    }

  }

  onAddNote(markup: any): void {
    if (this.note[markup.markupnumber]) {
      if (this.noteIndex >= 0) {
        markup.editComment(this.noteIndex, this.note[markup.markupnumber]);
        this.noteIndex = -1;
      }
      else {
        /*const commentsObj = {
          id: markup.comments.length,
          signature: markup.signature,
          value: this.note[markup.markupnumber]
        };*/
        markup.AddComment(markup.comments.length, markup.signature, this.note[markup.markupnumber]);
        //markup.comments.push(commentsObj);
      }

      

      this.note[markup.markupnumber] = "";
    }
    else
      return;
  }


  GetCommentLength(): number {

    let noOfComments = 0;

    Object.values(this.list || {}).forEach(comment => {
      noOfComments += comment.length;
    });
    return noOfComments;

    //return Object.keys(this.list || {}).length;
  }


  OnEditComment(markupNo: any, itemNote: any): void {
    this.noteIndex = itemNote.id;
    this.note[markupNo] = itemNote.value;
  }


  OnRemoveComment(markup: any, id: number, index: number): void {
    markup.deleteComment(id);
    if (markup.comments.length === 0) {
      if (this.connectorLine)
        this.connectorLine.hide();
      this.markupNoteList = this.markupNoteList.filter(item => { return item !== markup.markupnumber; });
      this._processList(this.rxCoreService.getGuiMarkupList());
    }
    if (index === 0) {
      markup.comments = [];
      markup.selected = true;
      RXCore.deleteMarkUp();
    }
  }


  DrawConnectorLine(startElem, endElem) {
    if (startElem !== null && endElem !== null) {
      if (this.connectorLine)
        this.connectorLine.hide();
      this.connectorLine = new LeaderLine(
        startElem,
        endElem, {
        endPlug: 'square',
        endPlugOutline: false,
        size: 2.5,
        color: '#14ab0a',
        path: 'grid',
        startSocketGravity: 0,
        animOptions: { duration: 300, timing: 'linear' }
      });
    }
  }

  SetActiveCommentSelect(markup: any){

    let markupNo = markup.markupnumber;

    if (markupNo) {
      this.activeMarkupNumber = markupNo;
      //this.onSelectAnnotation(markup);
      this._setPosition(markup);
    }

  }

  SetActiveCommentThread(event, markupNo: number, markup: any): void {
    if (markupNo) {
      this.activeMarkupNumber = markupNo;
      this.onSelectAnnotation(markup);
      this._setPosition(markup);
    }
    event.preventDefault();
  }


  trackByFn(index, item) {
    return item.id;
  }


  ngOnDestroy(): void {
    this.guiOnPanUpdatedSubscription.unsubscribe();
  }

  onSelectAnnotation(markup: any): void {
    RXCore.unSelectAllMarkup();
    RXCore.selectMarkUp(true);
    RXCore.selectMarkUpByIndex(markup.markupnumber);
    markup.selected = true;
    this.rxCoreService.setGuiMarkup(markup, {});

  }


  private _setPosition(markup: any): void {
    //RXCore.unSelectAllMarkup();
    //this.rxCoreService.setGuiMarkup(markup, {});
    //this.lineConnectorNativElement.style.top = (markup.yscaled + (markup.hscaled / 2) - 10) + 'px';
    //this.lineConnectorNativElement.style.left = (markup.xscaled + markup.wscaled - 5) + 'px';
    //this.DrawConnectorLine(document.getElementById('note-panel-' + this.activeMarkupNumber), this.lineConnectorNativElement);

    if (markup.type !== MARKUP_TYPES.COUNT.type) {
      const wscaled = (markup.wscaled || markup.w) / window.devicePixelRatio;
      const hscaled = (markup.hscaled || markup.h) / window.devicePixelRatio;
      const xscaled = (markup.xscaled || markup.x) / window.devicePixelRatio;
      const yscaled = (markup.yscaled || markup.y) / window.devicePixelRatio;


      let _dx = window == top ? 0 : - 82;
      let _dy = window == top ? 0 : -48;

      let dx = 0 + _dx;
      let dy = -10 + _dy;

      switch (markup.type) {
        case MARKUP_TYPES.SHAPE.POLYGON.type:
        case MARKUP_TYPES.PAINT.POLYLINE.type:
        case MARKUP_TYPES.MEASURE.PATH.type:
        case MARKUP_TYPES.MEASURE.AREA.type: {
          let p = markup.points[0];
          for (let point of markup.points) {
            if (point.y < p.y) {
              p = point;
            }
          }
          this.rectangle = {
            x: (p.x / window.devicePixelRatio) - (markup.subtype == MARKUP_TYPES.SHAPE.POLYGON.subtype ? 26 : 4),
            y: (p.y / window.devicePixelRatio) - 16,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;
        }
        case MARKUP_TYPES.NOTE.type:
          dx = (wscaled / 2) - 5 + _dx;
          dy = -10 + _dy;
          this.rectangle = {
            x: xscaled + dx,
            y: yscaled + dy,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;
        case MARKUP_TYPES.ERASE.type:
          dx = ((wscaled - xscaled) / 2) - 5 + _dx;
          this.rectangle = {
            x: xscaled + dx,
            y: yscaled + dy,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;
        case MARKUP_TYPES.ARROW.type:
          dx = -26 + _dx;
          this.rectangle = {
            x: xscaled + dx,
            y: yscaled + dy,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;
        case MARKUP_TYPES.MEASURE.LENGTH.type:
          this.rectangle = {
            x: xscaled - 5,
            y: yscaled - 5,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;
        default:
          dx = (wscaled / 2) - 24 + _dx;
          this.rectangle = {
            x: xscaled + dx,
            y: yscaled + dy,
            x_1: xscaled + wscaled - 20,
            y_1: yscaled - 20,
          };
          break;
      }

      if (this.rectangle.y < 0) {
        this.rectangle.y += hscaled + 72;
        this.rectangle.position = "bottom";
      } else {
        this.rectangle.position = "top";
      }

      if (this.rectangle.x < 0) {
        this.rectangle.x = 0;
      }

      if (this.rectangle.x > document.body.offsetWidth - 200) {
        this.rectangle.x = document.body.offsetWidth - 200;
      }
      console.log("this.lineConnectorNativElement", this.lineConnectorNativElement)
      this.lineConnectorNativElement = document.getElementById('lineConnector')
      this.lineConnectorNativElement.style.top = this.rectangle.y + (hscaled / 2) + 10 + 'px';
      this.lineConnectorNativElement.style.left = this.rectangle.x + (wscaled / 2) + 20 + 'px';
      this.lineConnectorNativElement.style.position = this.rectangle.position;
      this.DrawConnectorLine(document.getElementById('note-panel-' + this.activeMarkupNumber), this.lineConnectorNativElement);
    }else{
      //this.onSelectAnnotation(markup);
    }

  }

}
