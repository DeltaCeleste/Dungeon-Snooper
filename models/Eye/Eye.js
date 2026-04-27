import * as THREE from 'three'
import * as CSG from 'csg'

class Eye extends THREE.Object3D {
  constructor(_gui,_titleGui) {
    super();
    
    this.timer = new THREE.Timer();
    this.totalTimeClamped = 0.0;
    //Animacion
    //ojo--------------------------
    this.targetX = Math.PI/2;
    this.targetZ = 0.0;
    this.targetPupilScale = 1.0;

    //alas-------------------------
    this.maxRotation = -Math.PI/4
    this.minRotation = Math.PI/6

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
    this.rightWing = new Wing();
    this.rightWing.scale.set(0.1,0.1,0.1)
    this.rightWing.position.set(0.01,0.01,0)
    this.leftWing = new Wing();
    this.leftWing.scale.set(-0.1,0.1,0.1)
    this.leftWing.position.set(-0.01,0.01,0)
    
    this.add(this.rightWing)
    this.add(this.leftWing)
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

    static MIN_PUPIL_SCALE = 1.0;
    static MAX_PUPIL_SCALE = 4.0
    setPupilScale(scale) {
        if(Eye.MIN_PUPIL_SCALE < scale && scale < Eye.MAX_PUPIL_SCALE) {
            this.pupil.scale.x = scale;
            this.pupil.scale.z = scale;
        }
    }
    
    getPupilScale() { return this.pupil.scale.x; };

    lerpPupilScale(targetScale, factor) {
        this.pupil.scale.x = THREE.MathUtils.lerp(this.pupil.scale.x, targetScale, factor);
        this.pupil.scale.z = THREE.MathUtils.lerp(this.pupil.scale.z, targetScale, factor);
    }

    changeTarget() {
        this.targetX = Math.PI / 2 + Math.random() * 1.4 - 0.7;
        this.targetZ = Math.random() * 1.5 - 0.5;
        this.targetPupilScale = Math.random() * (Eye.MAX_PUPIL_SCALE - Eye.MIN_PUPIL_SCALE) + Eye.MIN_PUPIL_SCALE;
    }

    static EYE_LOOK_FREQUENCY = 0.8;

    update () {
        let totalTime = this.timer.getElapsed();
        let deltaTime = this.timer.getDelta();
        this.totalTimeClamped += deltaTime;
        //Animación Ojo------------------------
        if(this.totalTimeClamped >= Eye.EYE_LOOK_FREQUENCY) {
            this.totalTimeClamped -= Eye.EYE_LOOK_FREQUENCY;
            this.changeTarget();
        }
        this.lerpIrisRotation(this.targetX, this.targetZ, 0.08);
        this.lerpPupilScale(this.targetPupilScale, 0.1);

        //Animación alas--------------------------
        //var giro = this.max_rot*(Math.sin(this.timer.getElapsed()+3*Math.PI/2)+1);
        let rotationMid = (this.maxRotation-this.minRotation) / 2
        var giro = rotationMid * Math.sin(8 * totalTime + 3*Math.PI/2) + (rotationMid + this.minRotation);
        
        
        this.timer.update()
        this.leftWing.update(giro)
        this.rightWing.update(giro)
    }

    setUserData(parent) {
        this.eyeball.userData = parent;
        this.iris.userData = parent;
        this.pupil.userData = parent;
        this.leftWing.setUserData(parent);
        this.rightWing.setUserData(parent);
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

    var foreWingExtrudeOptions = {depth: 0.001, steps: 2, bevelEnabled: false};
    this.foreWing = new THREE.Mesh(new THREE.ExtrudeGeometry(this.foreWingShape(), foreWingExtrudeOptions), material);
    this.foreWing.translateX(0.5)
    this.foreWing.rotation.y = (Math.PI/6)

    var wingExtrudeOptions = {depth: 0.0011, steps: 2, bevelEnabled: false};
    this.wing = new THREE.Mesh(new THREE.ExtrudeGeometry(this.wingShape(), wingExtrudeOptions), material);
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

  setUserData(parent) {
    this.wing.userData = parent;
    this.foreWing.userData = parent;
  }

}