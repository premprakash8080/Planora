import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductivityOverviewComponent } from './productivity-overview.component';

describe('ProductivityOverviewComponent', () => {
  let component: ProductivityOverviewComponent;
  let fixture: ComponentFixture<ProductivityOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductivityOverviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductivityOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

