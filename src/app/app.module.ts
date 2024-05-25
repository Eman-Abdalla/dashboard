import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { CommonModule } from '@angular/common'; // Import CommonModule
@NgModule({
    declarations: [
      AppComponent,
      DashboardComponent
    ],
    imports: [
      BrowserModule,
      HttpClientModule,
      CommonModule // Import HttpClientModule
    ],
    providers: [],
    bootstrap: [AppComponent]
  })
  export class AppModule { }