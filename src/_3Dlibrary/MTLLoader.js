import THREE from 'three';

/**
 * An object to parse and retrieve the material list from
 * an MTL file. It relies on THREE.js behind the scenes.
 */
const MTLLoader = {
  /**
   * Returns a Promise that resolves with the list of parsed materials
   * @mtlFile : the mtl file to read from
   * @texturePaths : a dictionary that maps texture names to their paths
   * @interrupter: an object with properties to check for interruptions
   */
  loadMaterialsFromFile: (mtlFile, texturePaths, interrupter, onFileDownloadStarted) => {
    // first check for interruptions
    if (interrupter.stop) return Promise.reject(interrupter.reason);

    return new Promise((resolve, reject) => {
      // to read files
      const fr = new FileReader();

      // set filereader's success function
      fr.onload = () => {
        // auxiliar variables and data structures
        const text = fr.result; // file's text
        parseMtlText(text, texturePaths, resolve, reject, interrupter, onFileDownloadStarted);
      };

      // set error function
      fr.onerror = (err) => {
        reject(err);
      };

      // read the file as plain text
      fr.readAsText(mtlFile);
    });
  },

  loadMaterialsFromUrl: (mtlUrl, textureUrls, interrupter, onFileDownloadStarted) => {
    onFileDownloadStarted(mtlUrl);
    return fetch(mtlUrl, { method: 'GET', mode: 'cors' })
    .then(response => response.text())
    .then(text => (new Promise((resolve, reject) => {
      parseMtlText(text, textureUrls, resolve, reject, interrupter, onFileDownloadStarted);
    })));
  },
};

function parseMtlText(mtlText, texturePaths, resolve, reject, interrupter, onFileDownloadStarted) {
  if (interrupter.stop) {
    reject(interrupter.reason);
    return;
  }
  const lines = mtlText.split(/[\n\r]/);
  const materials = {};
  const paramsList = [];
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = 'anonymous';
  const promiseMap = {};
  const promiseList = [];
  const textureMap = {};
  const auxList = [];
  const textureNamesUsed = [];
  let params = null;

  // parse each line
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i].trim();
    if (line.length === 0 || line[0] === '#') {
      // blank line or comment, ignore it
      continue;
    }
    // split the line into tokens
    const tokens = line.split(/\s+/);

    // make sure we have at least 2 tokens
    if (tokens.length >= 2) {
      // read the key
      const key = tokens[0].toLowerCase();

      if (key === 'newmtl') { // reading a new material
        // we save a new params object into the params list
        params = { name: tokens[1] };
        paramsList.push(params);
      } else if (params) { // make sure we already have a current params object
        if (tokens.length === 4) { // 3 tokens after the key
          switch (key) {
            case 'kd':
              // diffuse color
              params.color = new THREE.Color(
                Number(tokens[1]), Number(tokens[2]), Number(tokens[3]));
              break;

            case 'ka':
              // ambient color, in THREE.js it seems to be 'emissive'
              params.emissive = new THREE.Color(
                Number(tokens[1]), Number(tokens[2]), Number(tokens[3]));
              break;

            case 'ks':
              // specular color
              params.specular = new THREE.Color(
                Number(tokens[1]), Number(tokens[2]), Number(tokens[3]));
              break;

            default:
              break;
          }
        } else if (tokens.length === 2) { // just 1 token after the key
          const value = tokens[1];
          switch (key) {
            case 'ns':
              // specular exponent
              params.shininess = Number(value);
              break;

            case 'd': {
              // opacity
              const opacity = Number(value);
              if (0 <= opacity && opacity <= 1) {
                params.opacity = opacity;
                params.transparent = true;
              }
              break;
            }

            case 'tr': {
              // transparency
              const transparency = Number(value);
              if (0 <= transparency && transparency <= 1) {
                params.opacity = 1 - transparency;
                params.transparent = true;
              }
              break;
            }

            case 'map_ka':
              // ambient texture map, in THREE.js it seems to be 'emissiveMap'
              if (!trySetTextureAsynchronously(value, 'emissiveMap')) return;
              break;

            case 'map_kd':
              // diffuse texture map
              if (!trySetTextureAsynchronously(value, 'map')) return;
              break;

            case 'map_ks':
              // specular texture map
              if (!trySetTextureAsynchronously(value, 'specularMap')) return;
              break;

            case 'map_disp':
              // displacement texture map
              if (!trySetTextureAsynchronously(value, 'displacementMap')) return;
              break;

            case 'map_bump':
            case 'bump':
              // bump texture map
              if (!trySetTextureAsynchronously(value, 'bumpMap')) return;
              break;

            default:
              break;
          }
        }
      }
    }
  }

  // if we try to load at least one texture asynchronously, and therefore
  // have at least one promise in the promise list, we need to wait for all those
  // promises to get resolved before we go on to create the materials
  // (the textures need to be already loaded when the materiales are created)
  if (promiseList.length > 0) {
    Promise.all(promiseList)
    .then(() => { // success
      // set the textures
      for (let i = 0; i < auxList.length; i += 3) {
        const _params = auxList[i];
        const _mapName = auxList[i + 1];
        const _textureName = auxList[i + 2];
        _params[_mapName] = textureMap[_textureName];
      }
      // generate materials and resolve
      paramsList.forEach((p) => { materials[p.name] = new THREE.MeshPhongMaterial(p); });
      resolve({ materials, textureNamesUsed });
    })
    .catch(err => reject(err));
  } else { // no promises (nobody is using textures)
    // generate materials and resolve
    paramsList.forEach((p) => { materials[p.name] = new THREE.MeshPhongMaterial(p); });
    resolve({ materials, textureNamesUsed });
  }

  /**
   * [trySetTextureAsynchronously : helper function to load a texture
   * asynchronously as a promise]
   * @param  {[string]} textureName [name of the texture/image file]
   * @param  {[string]} mapName     [name of the material's texture map property
   * that the texture will be set to]
   */
  function trySetTextureAsynchronously(textureName, mapName) {
    // check for interruptions
    if (interrupter.stop) {
      reject(interrupter.reason);
      return;
    }
    if (promiseMap[textureName] === undefined) {
      // make sure the image exists
      const path = texturePaths[textureName];
      if (path === undefined) {
        // path not found in textureMap, reject the global promise
        // and return false
        reject(`path to image ${textureName} not found`);
        return false;
      }
      // promise wrapping a TextureLoader's load call
      const p = new Promise((res, rej) => {
        onFileDownloadStarted(path);
        loader.load(
          path, (texture) => {
            textureMap[textureName] = texture;
            textureNamesUsed.push(textureName);
            res();
          },
          null, (err) => {
            rej(err);
          }
        );
      });
      // remember that we already have a promise in process for this texture
      promiseMap[textureName] = p;
      promiseList.push(p);
    }
    // remember the params, the property and the value that later on
    // we need to set
    auxList.push(params, mapName, textureName);
    // success
    return true;
  }
}

export default MTLLoader;
