import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborationRoomComponent } from './collaboration-room.component';

describe('CollaborationRoomComponent', () => {
  let component: CollaborationRoomComponent;
  let fixture: ComponentFixture<CollaborationRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CollaborationRoomComponent]
    });
    fixture = TestBed.createComponent(CollaborationRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
