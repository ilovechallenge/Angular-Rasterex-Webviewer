import { Component, OnInit, OnDestroy } from '@angular/core';
import { RXCore } from 'src/rxcore';
import { AnnotationToolsService } from '../annotation-tools.service';
import { Subscription } from 'rxjs';
import { ColorHelper } from 'src/app/helpers/color.helper';
import { MARKUP_TYPES } from 'src/rxcore/constants';
import { RxCoreService } from 'src/app/services/rxcore.service';

@Component({
  selector: 'rx-measure-panel',
  templateUrl: './measure-panel.component.html',
  styleUrls: ['./measure-panel.component.scss'],
})
export class MeasurePanelComponent implements OnInit, OnDestroy {
  private stateSubscription: Subscription;
  private guiMarkupSubscription: Subscription;

  MARKUP_TYPES = MARKUP_TYPES;

  visible: boolean = false;
  created: boolean = true;
  type: number = MARKUP_TYPES.MEASURE.LENGTH.type;
  color: string;
  lengthMeasureType: number;
  strokeThickness: number;
  strokeLineStyle: number;
  snap: boolean;

  private _setDefaults(): void {
    this.created = false;
    this.type = MARKUP_TYPES.MEASURE.LENGTH.type;
    this.color = '#333C4E';
    this.strokeThickness = 1;
    this.strokeLineStyle = 0;
    this.lengthMeasureType = 0;
    this.snap = false;
  }

  constructor(
    private readonly rxCoreService: RxCoreService,
    private readonly annotationToolsService: AnnotationToolsService,
    private readonly colorHelper: ColorHelper) {}

  ngOnInit(): void {
    this._setDefaults();

    this.stateSubscription = this.annotationToolsService.measurePanelState$.subscribe(state => {
      this.visible = state.visible;
      this.created = Boolean(state.created);
      if (this.created) {
        this.type = state.type;
      }
    });

    this.guiMarkupSubscription = this.rxCoreService.guiMarkup$.subscribe(({markup, operation}) => {
      this._setDefaults();
      this.visible = false;

      if (markup == -1 || operation.deleted) {
        return;
      }

      this.type = markup.type;
      this.color = this.colorHelper.rgbToHex(markup.strokecolor);
      this.strokeThickness = markup.linewidth;
      this.strokeLineStyle = markup.linestyle;
      this.lengthMeasureType = markup.subtype;
    });
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) this.stateSubscription.unsubscribe();
    if (this.guiMarkupSubscription) this.guiMarkupSubscription.unsubscribe();
  }

  onLengthMeasureTypeChange(type: number): void {
    this.lengthMeasureType = type;
    if (this.created) {
      RXCore.markUpDimension(true, type);
    } else {
      RXCore.markUpSubType(type);
    }
  }

  onColorSelect(color): void {
    this.color = color;
    RXCore.setGlobalStyle(true);
    RXCore.changeStrokeColor(color);
  }

  onStrokeThicknessChange(): void {
    RXCore.setLineWidth(this.strokeThickness);
  }

  onStrokeLineStyleSelect(lineStyle: number): void {
    this.strokeLineStyle = lineStyle;
    RXCore.setLineStyle(lineStyle);
  }

  onSnapChange(onoff: boolean): void {
    RXCore.changeSnapState(onoff);
  }

}
