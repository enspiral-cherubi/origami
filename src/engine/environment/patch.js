import THREE from 'three'

class Patch {
  //this is a combinatorial object for making patchworks
  constructor (size,origin) {

    //it has a double-indexed set of vertices with neighbors
    var vertexArray = []
    for(var i=0;i<size;i++){
      vertexArray.push([])
      for(var j=0;j<size;j++){
        vertexArray[i].push(origin.clone().add(new THREE.Vector3(i-size/2,j-size/2,0)))
        vertexArray[i][j].neighbors = []
        vertexArray[i][j].nextNeighbors = []
        vertexArray[i][j].diagNeighbors = []
        if(i>0){
          vertexArray[i-1][j].neighbors.push(vertexArray[i][j])
          vertexArray[i][j].neighbors.push(vertexArray[i-1][j])
        }
        if(j>0){
          vertexArray[i][j-1].neighbors.push(vertexArray[i][j])
          vertexArray[i][j].neighbors.push(vertexArray[i][j-1])
        }
        if(i>1){
          vertexArray[i-2][j].nextNeighbors.push(vertexArray[i][j])
          vertexArray[i][j].nextNeighbors.push(vertexArray[i-2][j])
        }
        if(j>1){
          vertexArray[i][j-2].nextNeighbors.push(vertexArray[i][j])
          vertexArray[i][j].nextNeighbors.push(vertexArray[i][j-2])
        }
        if(i>0 && j>0){
          vertexArray[i-1][j-1].diagNeighbors.push(vertexArray[i][j])
          vertexArray[i][j].diagNeighbors.push(vertexArray[i-1][j-1])
        }
        if(i>0 && j<size-1){
          vertexArray[i-1][j+1].diagNeighbors.push(vertexArray[i][j])
          vertexArray[i][j].diagNeighbors.push(vertexArray[i-1][j+1])
        }
      }
    }
    this.vertexArray = vertexArray

    //and a linear indexing of the same set of vertices with neighbors
    this.geometry = new THREE.Geometry()
    var index = 0
    for(var i=0;i<size;i++){
      for(var j=0;j<size;j++){
        this.geometry.vertices.push(vertexArray[i][j])
        vertexArray[i][j].index = index
        vertexArray[i][j].velocity = new THREE.Vector3(0,0,0)
        vertexArray[i][j].accel = new THREE.Vector3(0,0,0)
        index++
        if(j>0 && i>0){
          this.geometry.faces.push(new THREE.Face3(
            vertexArray[i][j-1].index,
            vertexArray[i][j].index,
            vertexArray[i-1][j].index
          ))
          this.geometry.faces.push(new THREE.Face3(
            vertexArray[i-1][j-1].index,
            vertexArray[i][j-1].index,
            vertexArray[i-1][j].index
          ))
        }
      }
    }

    vertexArray[0][0].corner = true
    vertexArray[0][size-1].corner = true
    vertexArray[size-1][0].corner = true
    vertexArray[size-1][size-1].corner = true

    //it also has a list of edges for gluing together
    var edges = [[],[],[],[]]
    for(var i=0;i<size;i++){
      //these must be cyclically ordered
      edges[1].push(vertexArray[i][0])
      edges[2].push(vertexArray[size-1][i])
      edges[3].push(vertexArray[size-i-1][size-1])
      edges[0].push(vertexArray[0][size-i-1])
    }
    this.edges = edges
  }
}

export default Patch
