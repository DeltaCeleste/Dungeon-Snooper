
import * as THREE from 'three'

class Key extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    this.createGUI(gui,titleGui);
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0x885500});
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    var radio = 0.010;   
    var altura = 0.035;
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

      var radio_tubo = radio/5;

      // El aro de la llave
      var handle = new THREE.Mesh(new THREE.TorusKnotGeometry(radio, radio_tubo, 300, 20, 2, 11), this.material); //su radio total es radio+radio/2+radio_tubo, de ancho radio/2+radio_tubo 
      // vamos a apoyarla sobre la mesa para mejor visualización
      handle.rotation.x = Math.PI/2;
      handle.position.y = radio/2+radio_tubo;

      // El cuerpo principal
      var neck = new THREE.Mesh(new THREE.CylinderGeometry(radio_tubo, radio_tubo, altura, 40, 1, false), this.material);
      // Una punta redondeada para el cuerpo
      var point = new THREE.Mesh(new THREE.SphereGeometry(radio_tubo, 20, 20), this.material);
      point.position.y = altura/2;
      neck.add(point);

      // Lo apoyamos y desplazamos para unirla satisfactoriamente con el aro
      neck.rotation.x = Math.PI/2;
      neck.position.z = altura/2+radio/2+radio_tubo;
      neck.position.y = radio/2+radio_tubo;

      base.add(handle);
      base.add(neck);
      return base;
    }

    createBase(tama) {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var base = new THREE.Object3D();
    // Cada figura, un Mesh, está compuesto de una geometría y un material
    var cajaBase = new THREE.Mesh (new THREE.BoxGeometry (tama,tama*0.08,tama*0.2), this.material);
    cajaBase.position.y = tama*0.04;
    // La componente geometría se puede compartir entre varios meshes
    var geometriaPivote = new THREE.ConeGeometry (tama*0.05, tama*0.12);
    var pivote1 = new THREE.Mesh (geometriaPivote, this.material);
    var pivote2 = new THREE.Mesh (geometriaPivote, this.material);
    // Se posicionan los pivotes con respecto a la base
    pivote1.position.set (tama*0.45, tama*0.14, tama*0.05);
    pivote2.position.set (tama*0.45, tama*0.14, -tama*0.05);
    base.add(cajaBase);
    base.add(pivote1);
    base.add(pivote2);
    return base;
  }
  
  createMovil (tama) {
    // Se crea la parte móvil
    var cajaMovil = new THREE.Mesh (
        new THREE.BoxGeometry (tama, tama*0.12, tama*0.2),
        this.material
    );
    cajaMovil.position.set (-tama*0.45, tama*0.06, 0);
    
    var movil = new THREE.Object3D();
    // IMPORTANTE: Con independencia del orden en el que se escriban las 2 líneas siguientes, SIEMPRE se aplica primero la rotación y después la traslación. Prueba a intercambiar las dos líneas siguientes y verás que no se produce ningún cambio al ejecutar.    
    movil.rotation.z = this.guiControls.rotacion;
    movil.position.set(tama*0.45,tama*0.2,0);
    movil.add(cajaMovil);
    return movil;
  }
  
  setAngulo (valor) {
    this.movil.rotation.z = valor;
  }
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Key }
