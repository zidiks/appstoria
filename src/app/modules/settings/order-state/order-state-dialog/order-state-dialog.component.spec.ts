import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStateDialogComponent } from './order-state-dialog.component';

describe('OrderStateDialogComponent', () => {
  let component: OrderStateDialogComponent;
  let fixture: ComponentFixture<OrderStateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderStateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
