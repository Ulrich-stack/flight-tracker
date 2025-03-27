import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightSidebarComponent } from './flight-sidebar.component';

describe('FlightSidebarComponent', () => {
  let component: FlightSidebarComponent;
  let fixture: ComponentFixture<FlightSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlightSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
