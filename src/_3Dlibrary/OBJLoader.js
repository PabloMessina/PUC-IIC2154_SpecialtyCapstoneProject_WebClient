import THREE from 'n3d-threejs';
import BufferedReader from './buffered-reader';

// v float float float
const vertexPattern = /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;
// vn float float float
const normalPattern = /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;
// vt float float
const uvPattern = /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;
// f vertex vertex vertex ...
const facePattern1 = /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/;
// f vertex/uv vertex/uv vertex/uv ...
const facePattern2 = /^f\s+((-?\d+)\/(-?\d+))\s+((-?\d+)\/(-?\d+))\s+((-?\d+)\/(-?\d+))(?:\s+((-?\d+)\/(-?\d+)))?/;
// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
const facePattern3 = /^f\s+((-?\d+)\/(-?\d+)\/(-?\d+))\s+((-?\d+)\/(-?\d+)\/(-?\d+))\s+((-?\d+)\/(-?\d+)\/(-?\d+))(?:\s+((-?\d+)\/(-?\d+)\/(-?\d+)))?/;
// f vertex//normal vertex//normal vertex//normal ...
const facePattern4 = /^f\s+((-?\d+)\/\/(-?\d+))\s+((-?\d+)\/\/(-?\d+))\s+((-?\d+)\/\/(-?\d+))(?:\s+((-?\d+)\/\/(-?\d+)))?/;
const objectPattern = /^[og]\s*(.+)?/;
const smoothingPattern = /^s\s+(\d+|on|off)/;

/**
 * [OBJLoader : namespace with methods to load meshes from OBJ files]
 */
const OBJLoader = {
  /**
   * [Parses local OBJ file and return a promise that gets resolved
   * with a collection of meshes]
   * @param  {[File]}       objFile   [text file with OBJ format]
   * @param  {[Material]}   materials [list of THREE.js materials]
   * @param  {[function]}   progressCallback
   * @return {[Promise]}            [promise that is resolved with a mesh collection]
   */
  loadObjectsFromFile: (objFile, materials, progressCallback) => {
    // vars and data structures
    const vertices = [];
    const normals = [];
    const uvs = [];
    const objects = [];
    let object;
    let foundObjects = false;

    addObject('');

    // Use a BufferedReader to read line by line, which requires to make several
    // asynchronous reads of chunks of the file, that's why they are performed
    // wrapped within a Promise
    return new Promise((resolve, reject) => {
      BufferedReader.readLineByLine(objFile, 1024 * 100, (_line, err, eof) => {
        if (err) {
          reject(err);
          return;
        }
        if (eof) {
          console.log("EOF reached");
          resolve();
          return;
        }
        const line = _line.trim();
        let result;
        if (line.length === 0 || line[0] === '#') {
          // skip blank or comment
          return;
        } else if ((result = vertexPattern.exec(line)) !== null) {
          // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
          vertices.push(
            Number(result[1]),
            Number(result[2]),
            Number(result[3])
          );
        } else if ((result = normalPattern.exec(line)) !== null ) {
          // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
          normals.push(
            Number(result[1]),
            Number(result[2]),
            Number(result[3])
          );
        } else if ((result = uvPattern.exec(line)) !== null) {
          // ["vt 0.1 0.2", "0.1", "0.2"]
          uvs.push(
            Number(result[1]),
            Number(result[2])
          );
        } else if ((result = facePattern1.exec(line)) !== null) {
          // ["f 1 2 3", "1", "2", "3", undefined]
          addFace(
            result[1], result[2], result[3], result[4]
          );
        } else if ((result = facePattern2.exec(line)) !== null) {
          // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3",
          // "3", "3", undefined, undefined, undefined]
          addFace(
            result[2], result[5], result[8], result[11],
            result[3], result[6], result[9], result[12]
          );
        } else if ((result = facePattern3.exec(line)) !== null) {
          // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2",
          // "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
          addFace(
            result[2], result[6], result[10], result[14],
            result[3], result[7], result[11], result[15],
            result[4], result[8], result[12], result[16]
          );
        } else if ((result = facePattern4.exec(line)) !== null) {
          // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2",
          // " 3//3", "3", "3", undefined, undefined, undefined]
          addFace(
            result[2], result[5], result[8], result[11],
            undefined, undefined, undefined, undefined,
            result[3], result[6], result[9], result[12]
          );
        } else if ((result = objectPattern.exec(line)) !== null) {
          // o object_name
          // or
          // g group_name
          const name = result[0].substr(1).trim();

          if (foundObjects === false) {
            foundObjects = true;
            object.name = name;
          } else {
            addObject(name);
          }
        } else if (/^usemtl /.test(line)) {
          // material
          object.material.name = line.substring(7).trim();
        } else if (/^mtllib /.test(line)) {
          // mtl file
        } else if ((result = smoothingPattern.exec(line)) !== null) {
          // smooth shading
          object.material.smooth = result[1] === '1' || result[1] === 'on';
        } else {
          reject({ reason: `unexpected line = {_line}` });
        }
      }, progressCallback);
    })
    // once we are done parsing the file, we put the data together into
    // buffergeometries and return them as a single group
    .then(() => {
      const container = new THREE.Group();

      for (let i = 0, l = objects.length; i < l; i ++) {
        object = objects[i];
        const geometry = object.geometry;
        const buffergeometry = new THREE.BufferGeometry();
        buffergeometry.addAttribute('position',
          new THREE.BufferAttribute(new Float32Array(geometry.vertices), 3));

        if (geometry.normals.length > 0) {
          buffergeometry.addAttribute('normal',
            new THREE.BufferAttribute(new Float32Array(geometry.normals), 3));
        } else {
          buffergeometry.computeVertexNormals();
        }

        if (geometry.uvs.length > 0) {
          buffergeometry.addAttribute('uv',
            new THREE.BufferAttribute(new Float32Array(geometry.uvs), 2));
        }

        let material;
        if (object.material.name !== '') {
          material = materials[object.material.name];
          if (material === undefined) {
            throw new Error('Material ' + object.material.name + ' was not found');
          }
        } else {
          material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        }

        material.shading = object.material.smooth ? THREE.SmoothShading : THREE.FlatShading;

        const mesh = new THREE.Mesh(buffergeometry, material);
        mesh.name = object.name;

        container.add(mesh);
      }
      return container;
    });


    // ---------------------------
    // Helper functions

    function addObject(name) {
      const geometry = {
        vertices: [],
        normals: [],
        uvs: [],
      };
      const material = {
        name: '',
        smooth: true,
      };
      object = { name, geometry, material };
      objects.push(object);
    }

    function parseVertexIndex(value) {
      const index = parseInt(value, 10);
      return (index >= 0 ? index - 1 : index + vertices.length / 3) * 3;
    }

    function parseNormalIndex(value) {
      const index = parseInt(value, 10);
      return (index >= 0 ? index - 1 : index + normals.length / 3) * 3;
    }

    function parseUVIndex(value) {
      const index = parseInt(value, 10);
      return (index >= 0 ? index - 1 : index + uvs.length / 2) * 2;
    }

    function addVertex(a, b, c) {
      object.geometry.vertices.push(
        vertices[a], vertices[a + 1], vertices[a + 2],
        vertices[b], vertices[b + 1], vertices[b + 2],
        vertices[c], vertices[c + 1], vertices[c + 2]
      );
    }

    function addNormal(a, b, c) {
      object.geometry.normals.push(
        normals[a], normals[a + 1], normals[a + 2],
        normals[b], normals[b + 1], normals[b + 2],
        normals[c], normals[c + 1], normals[c + 2]
      );
    }

    function addUV(a, b, c) {
      object.geometry.uvs.push(
        uvs[a], uvs[a + 1],
        uvs[b], uvs[b + 1],
        uvs[c], uvs[c + 1]
      );
    }

    function addFace(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
      let ia = parseVertexIndex(a);
      let ib = parseVertexIndex(b);
      let ic = parseVertexIndex(c);
      let id;

      if (d === undefined) {
        addVertex(ia, ib, ic);
      } else {
        id = parseVertexIndex(d);
        addVertex(ia, ib, id);
        addVertex(ib, ic, id);
      }

      if (ua !== undefined) {
        ia = parseUVIndex(ua);
        ib = parseUVIndex(ub);
        ic = parseUVIndex(uc);

        if (d === undefined) {
          addUV(ia, ib, ic);
        } else {
          id = parseUVIndex(ud);
          addUV(ia, ib, id);
          addUV(ib, ic, id);
        }
      }

      if (na !== undefined) {
        ia = parseNormalIndex(na);
        ib = parseNormalIndex(nb);
        ic = parseNormalIndex(nc);

        if (d === undefined) {
          addNormal(ia, ib, ic);
        } else {
          id = parseNormalIndex(nd);
          addNormal(ia, ib, id);
          addNormal(ib, ic, id);
        }
      }
    }
  },
  /**
   * [Parses OBJ file fetched from url through ajax
   * and returns a promise that gets resolved with a collection of meshes]
   * @param  {[string]}     objUrl   [remote obj file url]
   * @param  {[object]}     materials [map from strings to THREE.Materials]
   * @param  {[function]}   progressCallback
   * @return {[Promise]}            [promise that is resolved with a mesh collection]
   */
  loadObjectsFromUrl: (objUrl, materials, progressCallback) => {
    // vars and data structures
    const vertices = [];
    const normals = [];
    const uvs = [];
    const objects = [];
    let object;
    let foundObjects = false;

    addObject('');

    return fetch(objUrl, { method: 'GET', mode: 'cors' })
    .then(response => response.text())
    .then(text => parseText(text))
    .then(() => generateMeshGroup());

    // ---------------------------
    // Helper functions
    function parseText(text) {
      let start = 0;
      let count = 0;
      let end = -1;
      let line;
      return new Promise((resolve, reject) => {
        parseByChunks();

        function parseByChunks() {
          setTimeout(() => {
            try {
              count = 0;
              end = -1;
              while (true) {
                for (let i = start; i < text.length; ++i, ++count) {
                  const char = text[i];
                  if (char === '\n' || char === '\r') {
                    end = i;
                    break;
                  }
                }
                if (end === -1 || start >= text.length) {
                  line = text.substring(start);
                  parseLine(line);
                  progressCallback(text.length, text.length);
                  resolve();
                  break;
                } else {
                  line = text.substring(start, end);
                  parseLine(line);
                  start = end + 1;
                  if (count >= 200000) {
                    progressCallback(start, text.length);
                    parseByChunks();
                    break;
                  }
                }
              }
            } catch (err) { reject(err); }
          }, 0);
        }
      });
    }

    function parseLine(_line) {
      // debugger;
      const line = _line.trim();
      let result;
      if (line.length === 0 || line[0] === '#') {
        // skip blank or comment
        return;
      } else if ((result = vertexPattern.exec(line)) !== null) {
        // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
        vertices.push(
          Number(result[1]),
          Number(result[2]),
          Number(result[3])
        );
      } else if ((result = normalPattern.exec(line)) !== null ) {
        // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
        normals.push(
          Number(result[1]),
          Number(result[2]),
          Number(result[3])
        );
      } else if ((result = uvPattern.exec(line)) !== null) {
        // ["vt 0.1 0.2", "0.1", "0.2"]
        uvs.push(
          Number(result[1]),
          Number(result[2])
        );
      } else if ((result = facePattern1.exec(line)) !== null) {
        // ["f 1 2 3", "1", "2", "3", undefined]
        addFace(
          result[1], result[2], result[3], result[4]
        );
      } else if ((result = facePattern2.exec(line)) !== null) {
        // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3",
        // "3", "3", undefined, undefined, undefined]
        addFace(
          result[2], result[5], result[8], result[11],
          result[3], result[6], result[9], result[12]
        );
      } else if ((result = facePattern3.exec(line)) !== null) {
        // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2",
        // "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
        addFace(
          result[2], result[6], result[10], result[14],
          result[3], result[7], result[11], result[15],
          result[4], result[8], result[12], result[16]
        );
      } else if ((result = facePattern4.exec(line)) !== null) {
        // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2",
        // " 3//3", "3", "3", undefined, undefined, undefined]
        addFace(
          result[2], result[5], result[8], result[11],
          undefined, undefined, undefined, undefined,
          result[3], result[6], result[9], result[12]
        );
      } else if ((result = objectPattern.exec(line)) !== null) {
        // o object_name
        // or
        // g group_name
        const name = result[0].substr(1).trim();

        if (foundObjects === false) {
          foundObjects = true;
          object.name = name;
        } else {
          addObject(name);
        }
      } else if (/^usemtl /.test(line)) {
        // material
        object.material.name = line.substring(7).trim();
      } else if (/^mtllib /.test(line)) {
        // mtl file
      } else if ((result = smoothingPattern.exec(line)) !== null) {
        // smooth shading
        object.material.smooth = result[1] === '1' || result[1] === 'on';
      } else {
        throw new Error(`unexpected line = ${_line}`);
      }
    }

    function generateMeshGroup() {
      const container = new THREE.Group();

      for (let i = 0, l = objects.length; i < l; i ++) {
        object = objects[i];
        const geometry = object.geometry;
        const buffergeometry = new THREE.BufferGeometry();
        buffergeometry.addAttribute('position',
          new THREE.BufferAttribute(new Float32Array(geometry.vertices), 3));

        if (geometry.normals.length > 0) {
          buffergeometry.addAttribute('normal',
            new THREE.BufferAttribute(new Float32Array(geometry.normals), 3));
        } else {
          buffergeometry.computeVertexNormals();
        }

        if (geometry.uvs.length > 0) {
          buffergeometry.addAttribute('uv',
            new THREE.BufferAttribute(new Float32Array(geometry.uvs), 2));
        }

        let material;
        if (object.material.name !== '') {
          material = materials[object.material.name];
          if (material === undefined) {
            throw new Error('Material ' + object.material.name + ' was not found');
          }
        } else {
          material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        }

        material.shading = object.material.smooth ? THREE.SmoothShading : THREE.FlatShading;

        const mesh = new THREE.Mesh(buffergeometry, material);
        mesh.name = object.name;

        container.add(mesh);
      }
      return container;
    }

    function addObject(name) {
      const geometry = {
        vertices: [],
        normals: [],
        uvs: [],
      };
      const material = {
        name: '',
        smooth: true,
      };
      object = { name, geometry, material };
      objects.push(object);
    }

    function parseVertexIndex(value) {
      const index = parseInt(value, 10);
      return (index >= 0 ? index - 1 : index + vertices.length / 3) * 3;
    }

    function parseNormalIndex(value) {
      const index = parseInt(value, 10);
      return (index >= 0 ? index - 1 : index + normals.length / 3) * 3;
    }

    function parseUVIndex(value) {
      const index = parseInt(value, 10);
      return (index >= 0 ? index - 1 : index + uvs.length / 2) * 2;
    }

    function addVertex(a, b, c) {
      object.geometry.vertices.push(
        vertices[a], vertices[a + 1], vertices[a + 2],
        vertices[b], vertices[b + 1], vertices[b + 2],
        vertices[c], vertices[c + 1], vertices[c + 2]
      );
    }

    function addNormal(a, b, c) {
      object.geometry.normals.push(
        normals[a], normals[a + 1], normals[a + 2],
        normals[b], normals[b + 1], normals[b + 2],
        normals[c], normals[c + 1], normals[c + 2]
      );
    }

    function addUV(a, b, c) {
      object.geometry.uvs.push(
        uvs[a], uvs[a + 1],
        uvs[b], uvs[b + 1],
        uvs[c], uvs[c + 1]
      );
    }

    function addFace(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
      let ia = parseVertexIndex(a);
      let ib = parseVertexIndex(b);
      let ic = parseVertexIndex(c);
      let id;

      if (d === undefined) {
        addVertex(ia, ib, ic);
      } else {
        id = parseVertexIndex(d);
        addVertex(ia, ib, id);
        addVertex(ib, ic, id);
      }

      if (ua !== undefined) {
        ia = parseUVIndex(ua);
        ib = parseUVIndex(ub);
        ic = parseUVIndex(uc);

        if (d === undefined) {
          addUV(ia, ib, ic);
        } else {
          id = parseUVIndex(ud);
          addUV(ia, ib, id);
          addUV(ib, ic, id);
        }
      }

      if (na !== undefined) {
        ia = parseNormalIndex(na);
        ib = parseNormalIndex(nb);
        ic = parseNormalIndex(nc);

        if (d === undefined) {
          addNormal(ia, ib, ic);
        } else {
          id = parseNormalIndex(nd);
          addNormal(ia, ib, id);
          addNormal(ib, ic, id);
        }
      }
    }
  },

};

export default OBJLoader;
