import THREE from 'three'
import $ from 'jquery'
import THREEFlyControls from 'three-fly-controls'
THREEFlyControls(THREE)
import WindowResize from 'three-window-resize'
import Bucky from './bucky'
var lastTimeMsec = null

class Environment {

  constructor () {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.01, 1000)
    this.camera.position.z = 5

    this.renderer = new THREE.WebGLRenderer({alpha: true, canvas: $('#three-canvas')[0]})
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0, 1)

    this.controls = new THREE.FlyControls(this.camera, this.renderer.domElement)
    this.controls.movementSpeed = 0.1

    var windowResize = new WindowResize(this.renderer, this.camera)

    this.knobs = {dt:0.03, drag:0.5, cornerPull:0, nn:0.2}

    this.bucky = new Bucky(50)
    var origamiMaterial = new THREE.MeshNormalMaterial({side: THREE.DoubleSide})
    this.bucky.patches.forEach((p) => {
      this.scene.add(new THREE.Mesh(p.geometry,origamiMaterial))
    })
    this.bucky.strips.forEach((s) => {
      this.scene.add(new THREE.Mesh(s,origamiMaterial))
    })






  }

  render () {

    this.renderer.render(this.scene, this.camera)

    this.controls.update()

    this.bucky.updateGeometry(this.knobs)

  }

  turnKnobs (e) {
    if(e.key==='u'){
      this.knobs.cornerPull+=0.5
    }
    if(e.key==='h'){
      this.knobs.cornerPull-=0.5
    }
    if(e.key==='i'){
      this.knobs.drag-=0.01
    }
    if(e.key==='j'){
      this.knobs.drag+=0.01
    }
    if(e.key==='o'){
      this.knobs.dt+=0.01
    }
    if(e.key==='k'){
      this.knobs.dt-=0.01
    }
    if(e.key==='p'){
      this.knobs.nn+=0.1
    }
    if(e.key==='l'){
      this.knobs.nn-=0.1
    }
  }


}

export default Environment
