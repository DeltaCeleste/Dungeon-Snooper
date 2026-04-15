import * as THREE from 'three'
import * as CSG from 'csg'

class Eye extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);

    //Animacion
    this.max_rot = Math.PI/4
    this.min_rot = -Math.PI/6
    this.alpha = 0
    this.beta = 0

    this.reloj = new THREE.Timer();
    this.velocidad = 10;
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    this.right_wing = new Wing();
    this.left_wing = new Wing();
    this.left_wing.scale.set(-1,1,1)
    
    // Al nodo  this, la grapadora, se le cuelgan como hijos la base y la parte móvil
    this.add(this.right_wing)
    this.add(this.left_wing)

  }
  
  createGUI (gui,titleGui) {

  }

  update () {
    this.reloj.update()
    //var giro = this.max_rot*(Math.sin(this.reloj.getElapsed()+3*Math.PI/2)+1);
    var giro = (this.max_rot-this.min_rot)/2*Math.sin(8*this.reloj.getElapsed()+3*Math.PI/2)+((this.max_rot-this.min_rot)/2+this.min_rot);
    this.left_wing.update(giro)
    this.right_wing.update(giro)
    //console.log((-(this.max_rot-this.min_rot)/2))
    //console.log(giro)
  }
}

export { Eye }

class Wing extends THREE.Object3D {
  constructor(){
    super();

    var material = new THREE.MeshStandardMaterial({
      color: 0x111111,
    });
     // El nodo base
    var base = new THREE.Object3D();

    var foreWing_options = {depth: 0.001, steps: 2, bevelEnabled: false};
    this.foreWing = new THREE.Mesh(new THREE.ExtrudeGeometry(this.foreWingShape(), foreWing_options), material);
    this.foreWing.translateX(0.5)
    this.foreWing.rotation.y = (-Math.PI/6)

    var wing_options = {depth: 0.0011, steps: 2, bevelEnabled: false};
    this.wing = new THREE.Mesh(new THREE.ExtrudeGeometry(this.wingShape(), wing_options), material);
    this.wing.rotation.y = (-Math.PI/12)
    this.wing.rotation.x = (-Math.PI/4)
    
    this.wing.add(this.foreWing)
    base.add(this.wing)

    this.add(base);
  }

  foreWingShape(){
    var shape = new THREE.Shape();
    shape.moveTo(0,0.25);
    shape.bezierCurveTo(
        0.2, 0.8,
        0.2, 0.2,
        0, 1 
    );
    shape.bezierCurveTo(
        0.1, 1.1,
        1.2, 1.1,
        1.3, 1 
    );
    shape.bezierCurveTo(
        0.8, 0.8,
        0.8, 0.2,
        1, 0 
    );
    shape.bezierCurveTo(
        0.6, -0.1,
        0.2, -0.2,
        0, -0.5 
    );

    return shape;
  }

  wingShape(){
    var shape = new THREE.Shape();
    shape.moveTo(0,0);
    shape.lineTo(0,-0.25)
    shape.bezierCurveTo(
        0.1, -0.15,
        0.4, -0.3,
        0.5, -0.5 
    );
    shape.lineTo(0.5,0.25)
    shape.moveTo(0,0)

    return shape;
  }

  update(giro) {
    this.foreWing.rotation.y = (giro*1.5)
    this.wing.rotation.y = (giro)
    //console.log((-(this.max_rot-this.min_rot)/2))
    //console.log(giro)
  }

}