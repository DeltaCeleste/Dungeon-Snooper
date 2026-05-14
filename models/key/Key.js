import * as THREE from 'three'
import * as CSG from 'csg'

class Key extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    //this.material = new THREE.MeshStandardMaterial({color: 0x885500});
    this.material = new THREE.MeshStandardMaterial({
      color: 0xaa8d52,
      emissive: 0x463f28,
      roughness: 0.5,
      metalness: 1,
      emissiveIntensity: 0.4,
    });
    this.material_textura = new THREE.MeshStandardMaterial({
      color: 0xaa8d52,
      emissive: 0x463f28,
      roughness: 0.5,
      metalness: 1,
      emissiveIntensity: 0.4,
      normalMap: new THREE.TextureLoader().load('../../imgs/metal.jpeg')
    });
    
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    var radio = 0.5;   
    var altura = 1;
    var base = this.createBody(radio, altura);
    this.hitbox = this.createHitbox(radio, altura);
    this.add(this.hitbox);
    // Al nodo  this, la grapadora, se le cuelgan como hijos la base y la parte móvil
    this.add (base);

  }
  
  createGUI (gui,titleGui) {

  }

  /** @param {number} radius @param {number} height */
  createHitbox(radius, height) {
    const hitboxGeometry = new THREE.BoxGeometry(radius, height, height * 1.5);
    hitboxGeometry.translate(0, 0, height / 2);
    const hitboxMaterial = new THREE.MeshStandardMaterial({
      color: THREE.Color.NAMES.green,
      transparent: true,
      opacity: 0,
    });
    return new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  }

  createBody(radio, altura) {
    // El nodo base
    var base = new THREE.Object3D();

    // El aro de la llave
    /*var handle = new THREE.Mesh(new THREE.TorusKnotGeometry(radio, radio_tubo, 300, 20, 2, 11), this.material); //su radio total es radio+radio/2+radio_tubo, de ancho radio/2+radio_tubo 
    // vamos a apoyarla sobre la mesa para mejor visualización
    handle.rotation.x = Math.PI/2;
    handle.position.y = radio/2+radio_tubo;*/
    var handle_shape = this.handle_deline(radio);

    var pts = [
      new THREE.Vector3(2,0,0),
      new THREE.Vector3(1.8,0,0.45),
      new THREE.Vector3(1.5,0,0.5),
      new THREE.Vector3(0.4,0,0.3),
      new THREE.Vector3(0,0,1),
      new THREE.Vector3(-0.4,0,0.3),
      new THREE.Vector3(-1.5,0,0.5),
      new THREE.Vector3(-1.8,0,0.45),
      new THREE.Vector3(-2,0,0),

      new THREE.Vector3(-1.25,0,-2),
      new THREE.Vector3(-1.5,0,-2.5),
      new THREE.Vector3(0,0,-1.25),
      new THREE.Vector3(1.5,0,-2.5),
      new THREE.Vector3(1.25,0,-2),

    ]
    var path = new THREE.CatmullRomCurve3(pts, true);
    var handle_options = {depth: 1, steps: 1500, bevelEnabled: false, extrudePath: path};
    this.handle = new THREE.Mesh(new THREE.ExtrudeGeometry (handle_shape, handle_options), this.material);
    this.handle.scale.setScalar(0.1);

    // El cuerpo principal
    radio = radio*0.1/2
    var neck = new THREE.CylinderGeometry(radio, radio, altura, 40, 1, false);
    // Una punta redondeada para el cuerpo
    var point = new THREE.SphereGeometry(radio);
    point.translate(0,altura/2,0);

    var neckbrush = new CSG.Brush (neck , this.material);
    var pointbrush = new CSG.Brush (point , this.material);
    var evaluador = new CSG.Evaluator () ;
    /** @type {THREE.Mesh} */
    this.body = evaluador.evaluate (neckbrush, pointbrush, CSG.ADDITION);

    //Dientes
    var teeth_shape = this.teeth_deline();
    var teeth_options = {depth: 1, steps: 2, bevelEnabled: false};
    this.teeth = new THREE.Mesh(new THREE.ExtrudeGeometry (teeth_shape, teeth_options), this.material);
    this.teeth.scale.set(altura/3, altura/4, radio/3);


    //Lo posicionamos para unirlo en el extremo del cuerpo
    this.teeth.position.y = altura/5;
    this.body.add(this.teeth);

    // Lo apoyamos y desplazamos para unirla satisfactoriamente con el aro
    this.body.rotation.x = Math.PI/2;
    this.body.position.z = altura/2+radio/2+radio;
    //neck.position.y = radio/2+radio;

    base.add(this.handle);
    base.add(this.body);
    return base;
  }

  teeth_deline(){
    var shape = new THREE.Shape();
    shape.moveTo(0,0);
    shape.lineTo(0,-1);
    shape.lineTo(1/3,-1);
    shape.lineTo(1/3,-2/3);
    shape.lineTo(4/6,-2/3);
    shape.lineTo(4/6, -1);
    shape.lineTo(1, -1);
    shape.lineTo(1, -2/7);
    shape.lineTo(3/8, -2/7);
    shape.lineTo(3/8, 2/7);
    shape.lineTo(7/8, 2/7);
    shape.lineTo(7/8, 3/7);
    shape.lineTo(4/8, 3/7);
    shape.lineTo(4/8, 4/7);
    shape.lineTo(1, 4/7);
    shape.lineTo(1, 1);
    shape.lineTo(0, 1);

    shape.lineTo(0,);

    return shape;
  }

  handle_deline(radio){
    var shape = new THREE.Shape();
    shape.lineTo(radio,0);
    shape.quadraticCurveTo(
      radio, radio/2,
      radio/2, radio/2
    )
    shape.quadraticCurveTo(
      radio/2, radio,
      0, radio
    )
    shape.quadraticCurveTo(
      -radio/2, radio,
      -radio/2, radio/2
    )
    shape.quadraticCurveTo(
      -radio, radio/2,
      -radio, 0
    )
    shape.quadraticCurveTo(
      -radio, -radio/2,
      -radio/2, -radio/2
    )
    shape.quadraticCurveTo(
      -radio/2, -radio,
      0, -radio
    )
    shape.quadraticCurveTo(
      radio/2, -radio,
      radio/2, -radio/2
    )
    shape.quadraticCurveTo(
      radio, -radio/2,
      radio, 0
    )

    return shape
  }
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }

  setUserData(parent) {
    this.hitbox.userData = parent;
  }
}

export { Key }
