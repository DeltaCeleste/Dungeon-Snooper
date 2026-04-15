import * as THREE from 'three'
import * as CSG from 'csg'

class Eye extends THREE.Object3D {
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

    constructor(gui,titleGui) {
        super();
        this.time = 0.0;
        this.targetX = 0.0;
        this.targetZ = 0.0;
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
        this.addIrisAndPupil();
        this.iris.rotateX(Math.PI / 2);
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
        this.time += 1;
        if(this.time % 70 === 0) {
            this.targetX = Math.PI / 2 + Math.random() * 1.4 - 0.7
            this.targetZ = Math.random() * 2.0 - 1.0
        }
        this.lerpIrisRotation(this.targetX, this.targetZ, 0.08);
        this.setPupilScale(this.getPupilScale() + 0.005)
    }
}

export { Eye }
