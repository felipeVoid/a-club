import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalDataComponent } from './local-data.component';

describe('LocalDataComponent', () => {
  let component: LocalDataComponent;
  let fixture: ComponentFixture<LocalDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
