import * as THREE from 'three'
import * as CSG from 'csg'

class Eye extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    
    var eyeMaterial = new THREE.MeshStandardMaterial({
      color: THREE.Color.NAMES.white,
      roughness: 0.1,
    });
    var eyeGeometry = new THREE.SphereGeometry(0.025, 32, 16);
    
    this.eyeball = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.add(this.eyeball);

  }
  
  createGUI (gui,titleGui) {
    // Controles para el movimiento de la parte móvil
    this.guiControls = {
      rotacion : 0
    } 
    
    // Se crea una sección para los controles de la caja
    var folder = gui.addFolder (titleGui);
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    folder.add (this.guiControls, 'rotacion', -0.125, 0.2, 0.001)
      .name ('Apertura : ')
      .onChange ( (value) => this.setAngulo (-value) );
  }

  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Eye }
