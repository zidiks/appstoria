import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesDialogComponent } from './types-dialog.component';

describe('TypesDialogComponent', () => {
  let component: TypesDialogComponent;
  let fixture: ComponentFixture<TypesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
