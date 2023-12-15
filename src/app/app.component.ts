// app.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Font } from 'three';

@Component({
  selector: 'my-app',
  template: `
  <div #rendererContainer></div>
  <input #hiddenInput type="text" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; background: transparent; border: none; color: transparent; outline: none;" /> 
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('rendererContainer') rendererContainer: ElementRef;

  private textMeshInput: THREE.Mesh;
  private currentText: string = 'Jesse';

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private group: THREE.Group;

  @ViewChild('hiddenInput') hiddenInput: ElementRef<HTMLInputElement>;

  font: Font;

  private fontReady: boolean = false;

  ngOnInit() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.z = 500;

    // Create a group to hold all meshes
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.updateOnResize();
  }

  private updateOnResize(): void {
    // Update camera aspect ratio and recompute projection matrix
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngAfterViewInit() {
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.createMeshes();
    this.addLights();
    this.animate();
    this.scene.background = new THREE.Color(0x444444);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Add click event listener to focus the canvas
    this.renderer.domElement.addEventListener('click', () => {
      // this.renderer.domElement.focus();
      this.focusTextInput();
    });

    // For touch devices
    this.renderer.domElement.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault(); // Prevent the default browser behavior on touch
        this.hiddenInput.nativeElement.focus(); // Focus the input to show the keyboard
      },
      false
    );

    this.hiddenInput.nativeElement.addEventListener('input', () => {
      const value = this.hiddenInput.nativeElement.value;
      this.currentText = value;
      this.updateTextMesh();
    });

    // Make the canvas tabbable
    this.renderer.domElement.tabIndex = 0;

    window.addEventListener('keydown', this.handleKeyboardEvent.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleKeyboardEvent);
    window.removeEventListener('input', () => {});
  }

  focusTextInput() {
    this.hiddenInput.nativeElement.style.pointerEvents = 'auto'; // Allow it to receive pointer events
    this.hiddenInput.nativeElement.style.zIndex = '2'; // Bring it to top
    this.hiddenInput.nativeElement.focus(); // Focus the input to show the keyboard on mobile devices
    console.log('focused');
  }

  handleKeyboardEvent = (event: KeyboardEvent) => {
    if (!this.fontReady) return;
    // Check for specific keys if needed (e.g., Enter, Backspace)
    if (event.key === 'Backspace') {
      this.currentText = this.currentText.slice(0, -1); // Remove last character
    } else if (event.key === 'Enter') {
      // You could do something here if enter is pressed
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // Add typed character, but prevent adding non-character keys and limit the length
      if (this.currentText.length < 20) {
        // Set your own limit
        this.currentText += event.key;
      }
    }

    // Update the 3D text mesh
    this.updateTextMesh();
  };

  private updateTextMesh() {
    if (this.fontReady && this.textMeshInput && this.font) {
      // Dispose of the old geometry to avoid memory leaks
      this.textMeshInput.geometry.dispose();

      // Create a new text geometry with the updated text
      const textGeometry = new THREE.TextGeometry(this.currentText, {
        font: this.font,
        size: 15,
        height: 7,
      });

      // Update the existing mesh with the new geometry
      this.textMeshInput.geometry = textGeometry;
      this.textMeshInput.geometry.needsUpdate = true;

      // Update the mesh's position if necessary
      this.textMeshInput.position.set(30, 37, 5);
    }
  }

  private createMeshes() {
    const svgDataArray = [
      {
        path: `<svg xmlns="http://www.w3.org/2000/svg"><path d="M13 22.5V44H521V23C520.667 21.6667 519.5 18.5 517.5 16.5C515.5 14.5 513 14 512 14H21.5C20.3333 14.3333 17.5 15.5 15.5 17.5C13.5 19.5 13 21.6667 13 22.5Z"/></svg>`,
        color: 0x222222,
        depth: 8,
        bevelEnabled: false,
        z: 0,
      },
      {
        path: `<svg xmlns="http://www.w3.org/2000/svg"><path d="M13 70V44H521V52.5H146.5L111 70H13Z"/></svg>`,
        color: 0x000000,
        depth: 12,
        bevelEnabled: false,
        z: -2,
      },
      {
        path: `<svg xmlns="http://www.w3.org/2000/svg"><path d="M521 54.5V52.5H146.5L121 65H359.5L372.576 54.5H521Z"/></svg>`,
        color: 0x0000aa,
        depth: 8,
        bevelEnabled: false,
        z: 0,
      },
    ];

    const loader = new SVGLoader();

    for (const svgData of svgDataArray) {
      const svg = loader.parse(svgData.path);
      const shapes = svg.paths.flatMap((path) => path.toShapes(true));

      for (const shape of shapes) {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: svgData.depth,
          bevelEnabled: svgData.bevelEnabled,
        });
        const material = new THREE.MeshPhongMaterial({ color: svgData.color });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.z = svgData.z;

        // Add the mesh to the group
        this.group.add(mesh);
      }
    }

    // Load the font
    const fontLoader = new THREE.FontLoader();
    fontLoader.load(
      'node_modules/three/examples/fonts/optimer_regular.typeface.json',

      (font) => {
        console.log('font loaded correctly');
        this.font = font;
        this.fontReady = true;
        // Create text geometrys
        const textGeometryInput = new THREE.TextGeometry(this.currentText, {
          font: font,
          size: 15,
          height: 7,
        });

        const textGeometryLabel = new THREE.TextGeometry('First Name', {
          font: font,
          size: 10,
          height: 6,
        });

        const textGeometryDescription = new THREE.TextGeometry(
          'Type your first name',
          {
            font: font,
            size: 7,
            height: 6,
          }
        );

        // Create a material for the text
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

        // Create a mesh from the text geometry and material
        this.textMeshInput = new THREE.Mesh(textGeometryInput, textMaterial);
        const textMeshLabel = new THREE.Mesh(textGeometryLabel, textMaterial);
        const textMeshDescription = new THREE.Mesh(
          textGeometryDescription,
          textMaterial
        );

        // Rotate the text mesh to correct its orientation
        this.textMeshInput.rotation.x = Math.PI;
        textMeshLabel.rotation.x = Math.PI;
        textMeshDescription.rotation.x = Math.PI;

        // Position the text mesh
        this.textMeshInput.position.set(100, -50, 0);
        textMeshLabel.position.set(100, -50, 0);
        textMeshDescription.position.set(100, -50, 0);

        // Position and add the text mesh to the group
        this.textMeshInput.position.set(30, 37, 5);
        textMeshLabel.position.set(30, 62, 3);
        textMeshDescription.position.set(150, 62, 5);

        this.group.add(this.textMeshInput);
        this.group.add(textMeshLabel);
        this.group.add(textMeshDescription);
      },
      undefined,
      (error) => {
        console.error('Font failed to load', error);
      }
    );
    this.group.rotation.x = 9.5;
    this.group.rotation.y = -0.9;
    this.group.position.x = -90;
    this.group.position.y = 50;
    this.group.position.z = 320;
  }

  private addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(180, -20, 7);
    this.scene.add(directionalLight);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    // Rotate the group containing all meshes
    if (this.group) {
      // uncomment these 2 lines to rotate the text field (if you wish)
      // this.group.rotation.x += 0.001;
      // this.group.rotation.y += 0.003;
    }
    this.renderer.render(this.scene, this.camera);
  }
}
