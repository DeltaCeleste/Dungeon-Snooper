import * as THREE from 'three'
import * as CSG from 'csg'

class Mc extends THREE.Object3D {
  constructor() {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    // Se crea primero porque otros métodos usan las variables que se definen para la interfaz
    //this.createGUI(gui,titleGui);
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    //this.material = new THREE.MeshStandardMaterial({color: 0x885500});
    this.material = new THREE.MeshStandardMaterial({
      color: 0xa37911,
    });

    this.material_eyes = new THREE.MeshStandardMaterial({
      color: 0xffffff,
    });

    this.material_black = new THREE.MeshStandardMaterial({
      color: 0x000000,
    });

    this.material_mouth = new THREE.MeshStandardMaterial({
      color: 0xdd99bb,
    });
    
    // A la base no se accede desde ningún método. Se almacena en una variable local del constructor
    this.radio = 0.01;   
    this.altura = 2.34;
    var base = this.createEveryNyan(this.radio, this.altura);
    
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
  }

  createEveryNyan(radio, altura) {
    // El nodo base
    var base = new THREE.Object3D();
    const plano = 0.00001
    //Cuerpo---------------------------------------------------------------------------------------
    var body = new THREE.Mesh(new THREE.SphereGeometry (radio), this.material);
    body.scale.set(1,altura,1);
    base.add(body)

    var ear1 = new THREE.Mesh(new THREE.ConeGeometry(radio/2.5, radio), this.material); 
    ear1.translateY(altura*radio*0.95)
    ear1.translateX(radio/5)
    base.add(ear1)
    
    var ear2 = ear1.clone()
    ear2.translateX(-radio/5*2)
    base.add(ear2)

    var leg1 = new THREE.Mesh(new THREE.ConeGeometry(radio/2.8, radio*1.10), this.material); 
    leg1.rotateX(Math.PI)
    leg1.translateY(altura*radio*0.95)
    var trasx = radio/3.5
    leg1.translateX(trasx)
    base.add(leg1)
    var leg2 = leg1.clone()
    leg2.translateX(-trasx*2)
    base.add(leg2)

    //Ojos-----------------------------------------------------------------------------------------------------
    var eye_options = {depth: 1, steps: 2, bevelEnabled: false};
    var eye = new THREE.Mesh(new THREE.ExtrudeGeometry(this.eyeshape(), eye_options), this.material_eyes);
    var tmn_eye = radio*0.25
    eye.scale.set(tmn_eye,tmn_eye,plano)

    var pupila = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1.1), this.material_black);
    pupila.rotateX(Math.PI/2);
    pupila.translateY(0.5)
    eye.add(pupila)

    var eye2 = eye.clone();

    eye.rotateY(Math.PI*0.1);
    eye.translateZ(radio);

    eye2.rotateY(Math.PI*-0.1);
    eye2.translateZ(radio);

    var altura_eye = altura*radio*0.7
    var yNormalizada = altura_eye / (radio * altura);
    var x = eye.position.x;
    var z = Math.sqrt(1 - Math.pow(yNormalizada, 2) - Math.pow(x/radio,2)) * radio;
    const punto = new THREE.Vector3(x, altura_eye, z);
    eye.position.copy(punto);

    const normal = new THREE.Vector3(
        2 * punto.x / (radio * radio),
        2 * punto.y / (radio * radio * altura * altura),
        2 * punto.z / (radio * radio)
    ).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
    );
    eye.quaternion.copy(quaternion);

    x = eye2.position.x
    z = Math.sqrt(1 - Math.pow(yNormalizada, 2) - Math.pow(x/radio,2)) * radio;
    const punto2 = new THREE.Vector3(x, altura_eye, z);
    eye2.position.copy(punto2);

    const normal2 = new THREE.Vector3(
        2 * punto2.x / (radio * radio),
        2 * punto2.y / (radio * radio * altura * altura),
        2 * punto2.z / (radio * radio)
    ).normalize();
    quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal2
    );
    eye2.quaternion.copy(quaternion);

    base.add(eye)
    base.add(eye2)

    //Boca------------------------------------------------------------------------------------
    var lips_options = {depth: 1, steps: 2, bevelEnabled: false};
    var lips = new THREE.Mesh(new THREE.ExtrudeGeometry(this.lipshape(), lips_options), this.material_black);
    var mouth_options = {depth: 1, steps: 2, bevelEnabled: false};
    var mouth = new THREE.Mesh(new THREE.ExtrudeGeometry(this.mouthshape(), mouth_options), this.material_mouth);

    mouth.add(lips)
    var tmn_mouth = radio*0.25
    mouth.scale.set(tmn_mouth,tmn_mouth, plano)

    mouth.translateZ(radio);
    var altura_mouth = altura*radio*0.5
    yNormalizada = altura_mouth / (radio * altura);
    x = mouth.position.x;
    z = Math.sqrt(1 - Math.pow(yNormalizada, 2) - Math.pow(x/radio,2)) * radio;
    const punto3 = new THREE.Vector3(x, altura_mouth, z);
    mouth.position.copy(punto3);

    const normal3 = new THREE.Vector3(
        2 * punto3.x / (radio * radio),
        2 * punto3.y / (radio * radio * altura * altura),
        2 * punto3.z / (radio * radio)
    ).normalize();
    quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal3
    );
    mouth.quaternion.copy(quaternion);

    base.add(mouth)

    //Brazos---------------------------------------------------------
    var pts = []
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const angulo = -Math.PI/16 + (2*Math.PI/16) * t;
        
        const x = 10 + Math.cos(angulo) * -10;
        const y = 0 + Math.sin(angulo) * -10;
        const z = 0;
        
        pts.push(new THREE.Vector3(x, y, z));
    }

    var path = new THREE.CatmullRomCurve3(pts, false);
    var arm_options = {depth: 1, steps: 100, bevelEnabled: false, extrudePath: path};
    var circle = new THREE.Shape();
    circle.absellipse(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
    var arm = new THREE.Mesh(new THREE.ExtrudeGeometry (circle, arm_options), this.material);
    arm.scale.set(0.001,0.005,0.001)

    var arm2 = arm.clone()

    arm.translateX(-radio)
    arm.rotateZ(-Math.PI/11)

    arm2.rotateY(Math.PI)
    arm2.translateX(-radio)
    arm2.rotateZ(-Math.PI/11)

    base.add(arm)
    base.add(arm2)

    return base;
  }

  eyeshape(){
    var shape = new THREE.Shape()
    shape.moveTo(1.0, 0);
    shape.bezierCurveTo(
        0.66, 0.5,
        -0.66, 0.5,
        -1.0, 0
    );
    shape.bezierCurveTo(
        -0.66, -0.5,
        0.66, -0.5,
        1.0, 0
    );
    return shape;
  }

  lipshape(){
    var shape = new THREE.Shape()
    shape.moveTo(1.0,0.5)
    shape.bezierCurveTo(
        1.1, 0,
        0.8, 0.1,
        0.6, 0.15 
    );
    shape.bezierCurveTo(
        0.15, 0.16,  
        0.05, 0.29,
        0, 0.33
    );
    shape.bezierCurveTo(
        -0.05, 0.29,
        -0.15, 0.16,  
        -0.6, 0.15 
    );
    shape.bezierCurveTo(
        -0.8, 0.1,
        -1.1, 0,
        -1, 0.5
    );

    shape.bezierCurveTo(
        -1.1, 0.05,
        -0.8, 0.15,
        -0.6, 0.2 
    );
    shape.bezierCurveTo(
        -0.15, 0.21,  
        -0.05, 0.34,
        0, 0.38
    );
    shape.bezierCurveTo(
        0.05, 0.34,
        0.15, 0.21,
        0.6, 0.2 
    );
    shape.bezierCurveTo(
        0.8, 0.15,
        1.1, 0.05,
        1, 0.55
    );

    return shape;
  }
  
  mouthshape(){
    var shape = new THREE.Shape()
    shape.moveTo(0.6 ,0.15)
    shape.lineTo(0.6, -0.5);
    shape.bezierCurveTo(
        0.3, -1,
        -0.3, -1,
        -0.6, -0.5 
    );
    shape.lineTo(-0.6, 0.15);
    shape.bezierCurveTo(
        -0.15, 0.16,
        -0.05, 0.29,
        0, 0.33 
    );
    shape.bezierCurveTo(
        0.05, 0.29,
        0.15, 0.16,
        0.6, 0.15 
    );
    return shape;
  }
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Mc }
