import { Component, Input } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'hello',
  templateUrl: './hello.component.html',
})
export class HelloComponent  {
  @Input() name: string;
}
