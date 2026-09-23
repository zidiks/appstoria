import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsListAdditionalComponent } from './products-list-additional.component';

describe('ProductsListComponent', () => {
  let component: ProductsListAdditionalComponent;
  let fixture: ComponentFixture<ProductsListAdditionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductsListAdditionalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsListAdditionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
