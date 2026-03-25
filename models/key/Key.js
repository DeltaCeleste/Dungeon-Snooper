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
    
    // Al nodo  this, la grapadora, se le cuelgan como hijos la base y la parte móvil
    this.add (base);

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
    var handle = new THREE.Mesh(new THREE.ExtrudeGeometry (handle_shape, handle_options), this.material);
    handle.scale.z = 0.1;
    handle.scale.y = 0.1;
    handle.scale.x = 0.1;

    // El cuerpo principal
    radio = radio*0.1/2
    var neck = new THREE.CylinderGeometry(radio, radio, altura, 40, 1, false);
    // Una punta redondeada para el cuerpo
    var point = new THREE.SphereGeometry(radio);
    point.translate(0,altura/2,0);

    var neckbrush = new CSG.Brush (neck , this.material);
    var pointbrush = new CSG.Brush (point , this.material);
    var evaluador = new CSG.Evaluator () ;
    var body = evaluador.evaluate (neckbrush, pointbrush, CSG.ADDITION);

    //Dientes
    var teethe_shape = this.teeth_deline();
    var teeth_options = {depth: 1, steps: 2, bevelEnabled: false};
    var teeth = new THREE.Mesh(new THREE.ExtrudeGeometry (teethe_shape, teeth_options), this.material);
    teeth.scale.z = (radio/3);
    teeth.scale.y = altura/4;
    teeth.scale.x = altura/3;

    //Lo posicionamos para unirlo en el extremo del cuerpo
    teeth.position.y = altura/5;
    body.add(teeth);

    // Lo apoyamos y desplazamos para unirla satisfactoriamente con el aro
    body.rotation.x = Math.PI/2;
    body.position.z = altura/2+radio/2+radio;
    //neck.position.y = radio/2+radio;

    base.add(handle);
    base.add(body);
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
}

export { Key }
