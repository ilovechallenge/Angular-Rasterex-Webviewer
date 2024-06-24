import { Component, OnInit } from '@angular/core';
import { AnnotationToolsService } from './annotation-tools.service';
import { RXCore } from 'src/rxcore';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { IGuiConfig } from 'src/rxcore/models/IGuiConfig';

@Component({
  selector: 'rx-annotation-tools',
  templateUrl: './annotation-tools.component.html',
  styleUrls: ['./annotation-tools.component.scss']
})
export class AnnotationToolsComponent implements OnInit {
  guiConfig$ = this.rxCoreService.guiConfig$;
  opened$ = this.service.opened$;
  guiConfig: IGuiConfig | undefined;
  shapesAvailable: number = 5;

  isActionSelected = {
    "TEXT": false,
    "CALLOUT": false,
    "SHAPE_RECTANGLE": false,
    "SHAPE_RECTANGLE_ROUNDED": false,
    "SHAPE_ELLIPSE": false,
    "SHAPE_CLOUD": false,
    "SHAPE_POLYGON": false,
    "NOTE": false,
    "ERASE": false,
    "ARROW_FILLED_BOTH_ENDS": false,
    "ARROW_FILLED_SINGLE_END": false,
    "ARROW_BOTH_ENDS": false,
    "ARROW_SINGLE_END": false,
    "PAINT_HIGHLIGHTER": false,
    "PAINT_FREEHAND": false,
    "PAINT_TEXT_HIGHLIGHTING": false,
    "PAINT_POLYLINE": false,
    "COUNT": false,
    "STAMP": false,
    "MEASURE_LENGTH": false,
    "MEASURE_AREA": false,
    "MEASURE_PATH": false,
    "MARKUP_LOCK" : false
  };

  get isPaintSelected(): boolean {
    return this.isActionSelected["PAINT_HIGHLIGHTER"]
      || this.isActionSelected["PAINT_FREEHAND"]
      || this.isActionSelected["PAINT_TEXT_HIGHLIGHTING"]
      || this.isActionSelected["PAINT_POLYLINE"];
  }

  get isShapeSelected(): boolean {
    return this.isActionSelected["SHAPE_RECTANGLE"]
      || this.isActionSelected["SHAPE_RECTANGLE_ROUNDED"]
      || this.isActionSelected["SHAPE_ELLIPSE"]
      || this.isActionSelected["SHAPE_CLOUD"]
      || this.isActionSelected["SHAPE_POLYGON"];
  };

  get isArrowSelected(): boolean {
    return this.isActionSelected["ARROW_FILLED_BOTH_ENDS"]
      || this.isActionSelected["ARROW_FILLED_SINGLE_END"]
      || this.isActionSelected["ARROW_BOTH_ENDS"]
      || this.isActionSelected["ARROW_SINGLE_END"];
  };

  get isMeasureSelected(): boolean {
    return this.isActionSelected["MEASURE_LENGTH"]
      || this.isActionSelected["MEASURE_AREA"]
      || this.isActionSelected["MEASURE_PATH"];
  };

  constructor(
    private readonly service: AnnotationToolsService,
    private readonly rxCoreService: RxCoreService) { }

  ngOnInit(): void {
    this.guiConfig$.subscribe(config => {
      this.guiConfig = config;

      this.shapesAvailable = Number(!this.guiConfig.disableMarkupShapeRectangleButton)
      + Number(!this.guiConfig.disableMarkupShapeRoundedRectangleButton)
      + Number(!this.guiConfig.disableMarkupShapeEllipseButton)
      + Number(!this.guiConfig.disableMarkupShapeCloudButton)
      + Number(!this.guiConfig.disableMarkupShapePolygonButton);
    });

    this.rxCoreService.guiState$.subscribe(state => {
      this._deselectAllActions();
      this.service.setNotePanelState({ visible: false });
      this.service.hideQuickActionsMenu();
      this.service.setNotePopoverState({visible: false, markup: -1});
      this.service.hide();
      this.service.setMeasurePanelState({ visible: false });
    });

    this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
      if (markup !== -1) {
        if (markup.type == MARKUP_TYPES.COUNT.type) return;
        if (markup.type == MARKUP_TYPES.STAMP.type) {
          if (operation?.created) return;
          this.isActionSelected["STAMP"] = false;
        }
      }

      if (markup === -1 || operation?.created) {
        const selectedAction = Object.entries(this.isActionSelected).find(([key, value]) => value);

        //console.log("reset to default tool here");
        if(operation?.created){
          this._deselectAllActions();
        }
        //this._deselectAllActions();


        if (operation?.created && this.shapesAvailable == 1 && selectedAction) {
          this.onActionSelect(selectedAction[0]);
        }
      }
    });
  }

  private _deselectAllActions(): void {
    Object.entries(this.isActionSelected).forEach(([key, value]) => {
      this.isActionSelected[key] = false;

      /*if (key == 'NOTE') {
        RXCore.markUpNote(false);
      }*/
    });

    console.log("deselect all called");
    RXCore.restoreDefault();
    this.service.hideQuickActionsMenu();
    //this.service.setNotePanelState({ visible: false });
    this.service.setPropertiesPanelState({ visible: false });
    this.service.setMeasurePanelState({ visible: false });
  }

  onActionSelect(actionName: string) {
    const selected = this.isActionSelected[actionName];
    //this._deselectAllActions();
    this.isActionSelected[actionName] = !selected;

    switch(actionName) {
      case 'TEXT':
        RXCore.markUpTextRect(this.isActionSelected[actionName])
        break;

      case 'CALLOUT':
        RXCore.markUpTextRectArrow(this.isActionSelected[actionName])
        break;

      case 'SHAPE_RECTANGLE':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 0);
        break;

      case 'SHAPE_RECTANGLE_ROUNDED':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 0, 1);
        break;

      case 'SHAPE_ELLIPSE':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 1);
        break;

      case 'SHAPE_CLOUD':
        RXCore.setGlobalStyle(true);
        if (this.shapesAvailable == 1) {
          RXCore.changeFillColor("A52A2AFF");
          RXCore.markUpFilled();
          RXCore.changeTransp(20);
        }
        RXCore.markUpShape(this.isActionSelected[actionName], 2);
        break;

      case 'SHAPE_POLYGON':
        RXCore.setGlobalStyle(true);
        RXCore.markUpShape(this.isActionSelected[actionName], 3);
        break;

      case 'NOTE':
        RXCore.markUpNote(this.isActionSelected[actionName]);
        //this.service.setNotePanelState({ visible: this.isActionSelected[actionName] });
        break;

      case 'ERASE':
        RXCore.markUpErase(this.isActionSelected[actionName]);
        break;

      case 'ARROW_SINGLE_END':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 0);
        break;

      case 'ARROW_FILLED_SINGLE_END':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 1);
        break;

      case 'ARROW_BOTH_ENDS':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 2);
        break;

      case 'ARROW_FILLED_BOTH_ENDS':
        RXCore.setGlobalStyle(true);
        RXCore.markUpArrow(this.isActionSelected[actionName], 3);
        break;

      case 'PAINT_HIGHLIGHTER':
        RXCore.markUpHighlight(this.isActionSelected[actionName]);
        break;

      case 'PAINT_FREEHAND':
        RXCore.markUpFreePen(this.isActionSelected[actionName]);
        if (!this.isActionSelected[actionName]) {
          RXCore.selectMarkUp(true);
        }
        break;

      case 'PAINT_TEXT_HIGHLIGHTING':
        RXCore.textSelect(this.isActionSelected[actionName]);
        break;

      case 'PAINT_POLYLINE':
        RXCore.markUpPolyline(this.isActionSelected[actionName]);
        break;

      case 'STAMP':
        break;

      case 'MEASURE_LENGTH':
        this.service.setMeasurePanelState({ visible: this.isActionSelected[actionName], type: MARKUP_TYPES.MEASURE.LENGTH.type, created: true });
        RXCore.markUpDimension(this.isActionSelected[actionName], 0);
        break;

      case 'MEASURE_AREA':
        this.service.setMeasurePanelState({ visible: this.isActionSelected[actionName], type: MARKUP_TYPES.MEASURE.AREA.type, created: true });
        RXCore.markUpArea(this.isActionSelected[actionName]);
        break;

      case 'MEASURE_PATH':
        this.service.setMeasurePanelState({ visible: this.isActionSelected[actionName], type:  MARKUP_TYPES.MEASURE.PATH.type, created: true });
        RXCore.markupMeasurePath(this.isActionSelected[actionName]);
        break;
      case 'COUNT':
        if(!this.isActionSelected[actionName]){
          RXCore.markupCount(this.isActionSelected[actionName]);
        }
        break;
      case 'MARKUP_LOCK' :
        RXCore.lockMarkup(this.isActionSelected[actionName]);
        break;

    }
  }

  onPaintClick(): void {
    if (this.isActionSelected['PAINT_FREEHAND']) {
      this.onActionSelect('PAINT_FREEHAND');
    }
  }

  onAction (undo: boolean) {
    if (undo) RXCore.markUpUndo();
    else RXCore.markUpRedo();
  }
}
