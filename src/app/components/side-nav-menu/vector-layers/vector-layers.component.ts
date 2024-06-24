import { Component, OnInit } from '@angular/core';
import { RxCoreService } from 'src/app/services/rxcore.service';
import { RXCore } from 'src/rxcore';
import { IVectorLayer } from 'src/rxcore/models/IVectorLayer';

@Component({
  selector: 'rx-vector-layers',
  templateUrl: './vector-layers.component.html',
  styleUrls: ['./vector-layers.component.scss']
})
export class VectorLayersComponent implements OnInit {
  tabActiveIndex: number = 0;
  vectorLayersAll: boolean = true;
  vectorLayers: Array<IVectorLayer> = [];

  constructor(private readonly rxCoreService: RxCoreService) {}

  ngOnInit(): void {
    this.rxCoreService.guiVectorLayers$.subscribe((layers) => {
      this.vectorLayers = layers;
    });
  }

  onVectorLayersAllSelect(onoff: boolean): void {
    this.vectorLayersAll = onoff;
    RXCore.vectorLayersAll(onoff);
  }

  onVectorLayerClick(layer: IVectorLayer): void {
    RXCore.changeVectorLayer(layer?.index);
  }
}
