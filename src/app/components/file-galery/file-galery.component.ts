import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FileGaleryService } from './file-galery.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'rx-file-galery',
  templateUrl: './file-galery.component.html',
  styleUrls: ['./file-galery.component.scss']
})
export class FileGaleryComponent implements OnInit {
  @ViewChild('fileToUpload') fileToUpload: ElementRef; 
  @ViewChild('progressBar') progressBar: ElementRef;
  @Output() onSelect = new EventEmitter<any>();
  @Output() onUpload = new EventEmitter<void>();

  groups = [
    {
      "name": "CAD Drawings",
      "items":
      [
        {"id": "CAD_AUTOCAD", "name": "AutoCAD Drawing", "file": "demo1.dwg", "type": "2D", "size": 106},
        {"id": "CAD_MIROSTATION", "name": "Microstation Drawing", "file": "demo5.dgn", "type": "2D", "size": 5706},
        //{"id": "CAD_SOLIDWORKS", "name": "SolidWorks Drawing", "file": "Sprinkler.SLDDRW", "type": "2D", "size": 3127},
        //{"id": "CAD_COMPARE", "name": "Compare", "action": "compare", "file": ["RXHDEMO5.dwg","Rxhdemo6.dwg"], "type": "2D"}
      ]
    },
    {
      "name": "3D Models",
      "items":
      [
        {"id": "C3D_IFCMODEL", "name": "IFC model", "file": "AC11-FZK-Haus-IFC.ifc", "type": "3D", "size": 4048},
        {"id": "C3D_KARLSRUHE", "name": "Karlsruhe institue", "file": "AC11-Institute-Var-2-IFC.ifc", "type": "3D", "size": 2769},
        {"id": "C3D_HITO", "name": "HITO School building", "file": "Plan_20070203_2x3.ifc", "type": "3D", "size": 72915}
      ]
    },
    {
      "name": "Plotter Files",
      "items":
      [
        {"id": "PLOTTER_HPGL", "name": "HPGL Plot File", "file": "demo2.plt", "type": "2D", "size": 38},
        {"id": "PLOTTER_GERBER", "name": "Gerber File",  "file": "demo.gbr", "type": "2D", "size": 62}
      ]
    },
    {
      "name": "Image Files",
      "items":
      [
        {"id": "IMAGE_TIFF", "name": "Color Tiff", "file": "demo6.tif", "type": "2D", "size": 193},
        {"id": "IMAGE_TIFF_MONO", "name": "Mono Tiff", "file": "demo7.tif", "type": "2D", "size": 396},
        {"id": "IMAGE_MULTIPAGE", "name": "Multipage Tiff", "file": "demo8.tif", "type": "2D", "size": 870},
        {"id": "IMAGE_JPEG", "name": "Jpeg", "file": "X-35.jpg", "type": "2D", "size": 714}
      ]
    },
    {
      "name": "Office Documents",
      "items":
      [
        //{"id": "OFFICE_EXCEL", "name": "Excel Spreadsheet", "file": "demo11.xlsx", "type": "2D"},
        {"id": "OFFICE_PDF", "name": "PDF Document", "file": "040915 MOBSLAKT.pdf", "type": "PDF", "size": 125},
        {"id": "RXVIEW360_API_REFERENCE", "name": "API reference", "file": "RxView360_API_Specification.pdf", "type": "PDF", "size": 1727},
        {"id": "demo9", "name": "Sign demo", "file": "demo9.pdf", "type": "PDF", "size": 68}
      ]
    }
  ];

  selected = this.groups[0];
  leftTabActiveIndex: number = 0;
  selectedFileName: string;
  fileSize: number = 0;
  fileSizeUnits: string;
  file: any;
  isUploadFile: boolean = false;
  fileType: string;
  modalRoomOpened$ = this.fileGaleryService.modalRoomOpened$;

  constructor(
    private readonly fileGaleryService: FileGaleryService,
    private readonly websocketService: WebsocketService) { }

  ngOnInit() {
    this.fileGaleryService.getStatusActiveDocument().subscribe(status => {
      if (status === 'awaitingSetActiveDocument' && this.progressBar) this.progressBar.nativeElement.value = 100;
      else {
        this.clearData(); 
        this.leftTabActiveIndex = 0;
      }
    });
  }

  handleFileSelect(item): void {
    console.log("item", item)
    this.fileGaleryService.setSelectedFile(item);
    this.fileGaleryService.openRoomModal();
  }

  createRoomAndUploadFile(roomName: string): void {
    console.log("RoomName:", roomName)
    let selectedItem = this.fileGaleryService.getSelectedFile();
    this.uploadFile(selectedItem)
    this.fileType = selectedItem.type;
    this.onSelect.emit(selectedItem);
    this.websocketService.createRoom(selectedItem, roomName)
  }

  joinRoomAndUploadFile(status): void {
    let selectedItem = this.fileGaleryService.getSelectedFile();
    this.uploadFile(selectedItem)
    this.fileType = selectedItem.type;
    this.onSelect.emit(selectedItem);
    this.websocketService.joinRoom(selectedItem, status)
  }

  handleFileUpload(event) {
    const file = this.file = event.target ? event.target.files[0] : event[0];

    if (file) {
      this.selectedFileName = file.name;
      const bytes = file.size;

      if (bytes < 1024) {
        this.fileSize = parseFloat(bytes.toFixed(2)); 
        this.fileSizeUnits = 'B';
      } else if (bytes < 1024 * 1024) {
        this.fileSize = parseFloat((bytes / 1024).toFixed(2));
        this.fileSizeUnits = 'КB';
      } else if (bytes < 1024 * 1024 * 1024) {
        this.fileSize = parseFloat((bytes / (1024 * 1024)).toFixed(2));
        this.fileSizeUnits = 'МB';
      } else {
        this.fileSize = parseFloat((bytes / (1024 * 1024 * 1024)).toFixed(2));
        this.fileSizeUnits = 'GB';
      }
    }
  }

  uploadFile(fileSelect) {
    if (this.file || fileSelect) {
      this.isUploadFile = true;
      const fileSize = this.file?.size || fileSelect.size;
      const chunkSize = 1024 * 1024;
      const totalChunks = Math.ceil(fileSize / chunkSize);
      let currentChunk = 0;

      const reader = new FileReader();

      reader.onload = () => {
        currentChunk++;
        
        const progressBar = this.progressBar.nativeElement;
        const increment = 1; 
        const intervalDelay = 20; 
        const finalValue = (currentChunk / totalChunks) * 95; 

        let currentValue = 0;

        const interval = setInterval(() => {
          currentValue += increment;
          progressBar.value = currentValue;
          
          if (currentValue >= finalValue) {
            clearInterval(interval); 
          }
        }, intervalDelay);

        if (currentChunk < totalChunks) loadNextChunk();
      };

      const loadNextChunk = () => {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, fileSize);
        const blob = this.file ? this.file.slice(start, end) : fileSelect ? new Blob([fileSelect], { type: fileSelect.type }) : null;
        if (blob) reader.readAsBinaryString(blob);
      };

      loadNextChunk();
    }
    this.fileGaleryService.sendEventUploadFile();

    if (this.file) this.onUpload.emit();
  }

  clearData() {
    this.file = undefined;
    this.selectedFileName = ''; 
    this.isUploadFile = false;
    if (this.progressBar) this.progressBar.nativeElement.value = 0;
  }

  handleCloseModalFileGalery() {
    this.fileGaleryService.closeModal();
    if (this.selectedFileName) this.clearData();
  }

  public onDrop(files: FileList): void {
    this.handleFileUpload(files);
    this.fileToUpload.nativeElement.files = files;
  }

  public onChooseClick() {
    this.fileToUpload.nativeElement.click();
  }
}
