import THREE from 'three'
import Environment from './environment'
import View from './view'
import $ from 'jquery'
import loop from 'raf-loop'

class Engine {

  constructor () {
    this.environment = new Environment()
    this.view = new View()
  }

  bindEventListeners () {
    $(window).load(this.view.closeLoadingScreen)
    $(window).keypress((e)=>{this.environment.turnKnobs(e)})
  }

  start () {
    loop((t) => {
      this.environment.render()
    }).start()
  }

}

export default Engine
