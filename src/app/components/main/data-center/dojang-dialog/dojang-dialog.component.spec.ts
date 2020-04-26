import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DojangDialogComponent } from './dojang-dialog.component';

describe('DojangDialogComponent', () => {
  let component: DojangDialogComponent;
  let fixture: ComponentFixture<DojangDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DojangDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DojangDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
