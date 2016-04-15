import React, { Component } from 'react';
import THREE from 'n3d-threejs';

export default class Renderer3D extends Component {

  static get defaultProps() {
    return {
      width: 500,
      height: 500,
    };
  }

  constructor(props) {
    super(props);
    this.three_update = this.three_update.bind(this);
    this.three_render = this.three_render.bind(this);
    this.three_animate = this.three_animate.bind(this);
  }

  // function to update the scene
  three_update() {
    const cube = this.cube;
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;
  }

  // function to render the scene
  three_render()
    // get references to var stored in this
    // for ease of reading
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;

    // render scene
    renderer.render(scene, camera);
  }

  three_animate() {
    requestAnimationFrame(this.three_animate);
    this.three_update();
    this.three_render();
  }

  componentDidMount() {
    // canvas width and height
    const width = this.props.width;
    const height = this.props.height;

    // reference to the viewport div
    const viewport = this.refs.viewport;

    // set up instance of THREE.WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xff0000, 1);
    viewport.appendChild(renderer.domElement);

    // initialize scene
    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x000000));

    // initialize camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

    // dummy mesh for testing purposes
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube); // add cube to scene

    // set camera position
    camera.position.z = 5;

    // save variables into "this" to make them
    // accessible from other functions
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.cube = cube;

    console.log('viewport = ',viewport);

    // run animation
    this.three_animate();
  }

  render() {
    return (
      <div ref="viewport">
      hola, esto es un texto random
      </div>
    );
  }
}

Renderer3D.propTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
};
