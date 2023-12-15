import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, HelloComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }


/*
const svgPaths = [
      `M13 22.5V44H521V23C520.667 21.6667 519.5 18.5 517.5 16.5C515.5 14.5 513 14 512 14H21.5C20.3333 14.3333 17.5 15.5 15.5 17.5C13.5 19.5 13 21.6667 13 22.5Z`,
      `M13 70V44H521V52.5H146.5L111 70H13Z`,
      `M521 54.5V52.5H146.5L121 65H359.5L372.576 54.5H521Z`,
    ];
*/