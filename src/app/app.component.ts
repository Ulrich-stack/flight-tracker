import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { Flight } from './models';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'flight-tracker';
  constructor(private api : ApiService, private authService: AuthService){}
  // public flights? : AviationState[];
  @Input() flights? : Flight[];

  public ngOnInit(): void {
      // this.api.getFlights().subscribe((results)=> {
      //   this.flights= results.data;
      //   console.log(results.data);
        
      // })
      this.authService.loadUserDataOnAppStart();

      
  }

}
