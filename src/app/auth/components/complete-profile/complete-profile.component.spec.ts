import { ComponentFixture, TestBed } from '@angular/core/testing';

import { completeProfileComponent } from './complete-profile.component';

describe('completeProfileComponent', () => {
  let component: completeProfileComponent;
  let fixture: ComponentFixture<completeProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ completeProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(completeProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
