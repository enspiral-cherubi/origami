import THREE from 'three'
import Patch from './patch'

class Bucky {
  constructor (patchSize) {
    this.n = patchSize
    this.initGeometries()
  }

  initGeometries () {

    //make some patches
    var patch1 = new Patch(this.n, new THREE.Vector3(0,0,0))
    patch1.geometry.lookAt(new THREE.Vector3(1,0,0))
    var patch2 = new Patch(this.n, new THREE.Vector3(0,0,-40))
    patch2.geometry.lookAt(new THREE.Vector3(0,1,0))
    var patch3 = new Patch(this.n, new THREE.Vector3(0,0,40))
    patch3.geometry.lookAt(new THREE.Vector3(0,0,1))

    //we will store the patches like this
    this.patches = []
    this.patches.push(patch1)
    this.patches.push(patch2)
    this.patches.push(patch3)

    this.strips = []
    //glue the patches together (also makes some faces)
    this.strips.push(this.glueEdges(patch1,0,patch2,1))
    this.strips.push(this.glueEdges(patch2,3,patch3,1))
    this.strips.push(this.glueEdges(patch3,3,patch1,1))



  }

  updateGeometry (knobs) {
    //we use the Velocity Verlet Symplectic Integration Method
    var dt = knobs.dt
    var drag = knobs.drag
    var cornerPull = knobs.cornerPull

    this.patches.forEach((p) => {
      p.geometry.vertices.forEach((v) => {

            //first get velocity in half interval t+dt/2
            v.velocity.addScaledVector(v.accel,0.5*dt)

            //update position with half-velocity
            v.addScaledVector(v.velocity,dt)

            //now we get the force from the potential
            var force = new THREE.Vector3(0,0,0)

            //neighbor force
            v.neighbors.forEach((n)=>{
              var x = n.clone()
              x.sub(v)
              var mag = x.length()-1
              x.normalize()
              force.addScaledVector(x,mag*2)
            })

            //diagonal-neighbor force
            v.diagNeighbors.forEach((dn)=>{
              var x = dn.clone()
              x.sub(v)
              var mag = x.length()-Math.sqrt(2)
              x.normalize()
              force.addScaledVector(x,mag*0.5)
            })

            //next-neighbor force
            v.nextNeighbors.forEach((nn)=>{
              var x = nn.clone()
              x.sub(v)
              var mag = -x.length()
              x.normalize()
              force.addScaledVector(x,mag*knobs.nn)
            })

            //corner force
            if(v.corner){
              force.addScaledVector(v,cornerPull)
              force.addScaledVector(v,-v.length()*0)
            }

            //drag force
            force.addScaledVector(v.velocity,-drag*v.velocity.length())

            //update acceleration at t+dt
            v.accel.set(force.x,force.y,force.z)

            //calculation velocity at t+dt
            v.velocity.addScaledVector(v.accel,0.5*dt)

          })
          p.geometry.verticesNeedUpdate = true
          p.geometry.computeFaceNormals()
          p.geometry.normalsNeedUpdate = true
          p.geometry.computeBoundingSphere()
    })

    this.strips.forEach((s) => {
      s.verticesNeedUpdate = true
      s.computeFaceNormals()
      s.normalsNeedUpdate = true
      s.computeBoundingSphere()
    })


    // var i = Math.floor(Math.random()*this.numVertices)
    // var firstVertex = this.geometry.vertices[i]
    // var j = Math.floor(Math.random()*firstVertex.neighbors.length)
    // var secondVertex = firstVertex.neighbors[j]
    // var force = secondVertex.clone()
    // force.sub(firstVertex)
    // var d = force.length() - 1
    // force.normalize()
    // firstVertex.addScaledVector(force,0.5*d)
    // secondVertex.addScaledVector(force,-0.5*d)
    //
    // i = Math.floor(Math.random()*this.numVertices)
    // firstVertex = this.geometry.vertices[i]
    // if(firstVertex.diagNeighbors.length){
    //   j = Math.floor(Math.random()*firstVertex.diagNeighbors.length)
    //   secondVertex = firstVertex.diagNeighbors[j]
    //   force = secondVertex.clone()
    //   force.sub(firstVertex)
    //   d = force.length() - Math.sqrt(2)
    //   force.normalize()
    //   firstVertex.addScaledVector(force,0.5*d)
    //   secondVertex.addScaledVector(force,-0.5*d)
    // }

    // vertex.neighbors.forEach((n) => n.addScaledVector(force,0.03))

  }

  glueEdges (patch1,e1,patch2,e2) {
    //add faces to first patch
    var edge1 = patch1.edges[e1]
    var edge2 = []
    for(var i = 0;i<this.n;i++){
      edge2.push(patch2.edges[e2][this.n-i-1])
    }
    patch1.geometry.vertices.push(...edge2)


    var m = patch1.geometry.vertices.length
    for(var i=0; i<this.n; i++){
      edge1[i].neighbors.push(edge2[i])
      edge2[i].neighbors.push(edge1[i])
      if(i>0){
        edge1[i].diagNeighbors.push(edge2[i-1])
        edge2[i-1].diagNeighbors.push(edge1[i])
      }
      if(i<this.n-1){
        edge1[i].diagNeighbors.push(edge2[i+1])
        edge2[i+1].diagNeighbors.push(edge1[i])
      }
      edge1[i].corner = false
      edge2[i].corner = false
    }

    var stripGeometry = new THREE.Geometry()
    stripGeometry.vertices.push(...edge1)
    stripGeometry.vertices.push(...edge2)
    for(var i=0;i<this.n-1;i++){
      stripGeometry.faces.push(new THREE.Face3(
        i,
        i+this.n,
        i+this.n+1
      ))
      stripGeometry.faces.push(new THREE.Face3(
        i,
        i+1,
        i+this.n+1
      ))
    }

    return stripGeometry
  }
}

export default Bucky
