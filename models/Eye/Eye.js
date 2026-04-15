import * as THREE from 'three'
import * as CSG from 'csg'

class Eye extends THREE.Object3D {
  constructor(gui,titleGui) {
    super();
    
    // Se crea la parte de la interfaz que corresponde a la grapadora
    this.createGUI(gui,titleGui);

    //Animacion
    //ojo--------------------------
    this.time = 0.0;
    this.targetX = 0.0;
    this.targetZ = 0.0;

    //alas-------------------------
    this.max_rot = -Math.PI/4
    this.min_rot = Math.PI/6
    this.reloj = new THREE.Timer();

    //Construcción
    //ojos-------------------------
    var eyeMaterial = new THREE.MeshStandardMaterial({
        color: THREE.Color.NAMES.white,
        roughness: 0.1,
    });
    var eyeGeometry = new THREE.SphereGeometry(0.025, 32, 16);
    
    this.eyeball = new THREE.Mesh(eyeGeometry, eyeMaterial);
    this.add(this.eyeball);
    this.addIrisAndPupil();
    this.iris.rotateX(Math.PI / 2);
    
    //alas--------------------------
    this.right_wing = new Wing();
    this.right_wing.scale.set(0.1,0.1,0.1)
    this.right_wing.position.set(0.01,0.01,0)
    this.left_wing = new Wing();
    this.left_wing.position.set(-0.01,0.01,0)
    this.left_wing.scale.set(-0.1,0.1,0.1)
    
    this.add(this.right_wing)
    this.add(this.left_wing)

  }

  addPupil() {
        var pupilGeometry = new THREE.CylinderGeometry(0.002, 0.002, 0.0005, 12);
        pupilGeometry.translate(0.0, 0.005, 0.0);
        var pupilMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.black,
            roughness: 0.1
        })
        this.pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.pupil.position.set(0, 0.02, 0);
        this.iris.add(this.pupil);
    }

    addIrisAndPupil() {
        var irisGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.01, 16);
        irisGeometry.translate(0.0, 0.0198, 0.0);
        var irisMaterial = new THREE.MeshStandardMaterial({
            color: THREE.Color.NAMES.blue,
        });
        this.iris = new THREE.Mesh(irisGeometry, irisMaterial);
        this.addPupil();
        this.eyeball.add(this.iris);
    }

    addIrisRotation(rotX = undefined, rotZ = undefined) {
        if(x !== undefined) {
            this.iris.rotation.x += rotX;
        }
        if(z !== undefined) {
            this.iris.rotation.z += rotZ;
        }
    }

    lerpIrisRotation(toRotX, toRotZ, factor) {
        this.iris.rotation.x = THREE.MathUtils.lerp(this.iris.rotation.x, toRotX, factor);
        this.iris.rotation.z = THREE.MathUtils.lerp(this.iris.rotation.z, toRotZ, factor);
    }

    setPupilScale(scale) {
        if(scale < 4.0 && scale > 0.5) {
            this.pupil.scale.x = scale;
            this.pupil.scale.z = scale;
        }
    }
    
    getPupilScale() { return this.pupil.scale.x; };
  
    createGUI (gui,titleGui) {

    }

    update () {
        //Animación Ojo-------------------------------------------------
        this.time += 1;
        if(this.time % 70 === 0) {
            this.targetX = Math.PI / 2 + Math.random() * 1.4 - 0.7
            this.targetZ = Math.random() * 2.0 - 1.0
        }
        this.lerpIrisRotation(this.targetX, this.targetZ, 0.08);
        this.setPupilScale(this.getPupilScale() + 0.005)

        //Animación alas--------------------------
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
    this.foreWing.rotation.y = (Math.PI/6)

    var wing_options = {depth: 0.0011, steps: 2, bevelEnabled: false};
    this.wing = new THREE.Mesh(new THREE.ExtrudeGeometry(this.wingShape(), wing_options), material);
    this.wing.rotation.y = (Math.PI/12)
    this.wing.rotation.x = (Math.PI/4)
    
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