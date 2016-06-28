/* eslint strict:0 no-param-reassign:0, no-console:0 */
'use strict';

// Add Babel polyfill to have ES7 features
import 'babel-core/register';
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import Renderer3DWrapper from './components/renderer-3d-wrapper/';

const source = {
  remoteFiles: {
    mtl: 'https://lopezjuri.com/videos/nRBC.mtl',
    obj: 'https://lopezjuri.com/videos/nRBC.obj',
    images: ['https://lopezjuri.com/videos/M_10___Default1.jpg'],
  },
};
const style3D = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  position: 'absolute',
};

const styleRoot = {
  position: 'relative',
  width: '100%',
  height: '100%',
};

const metadata = {
  labels: JSON.parse(`[{"id":1,"points":[{"x":0.08011267886422502,"y":1.7630375099710704,
    "z":0.2855099769166429},{"x":0.07996274114879043,"y":1.7642502742242812,"z":-0.24056268813839665}],
    "position":{"x":-1.2019907948864557,"y":2.368970534761047,"z":-0.06227645813365079},
    "text":"shoulders"},{"id":2,"points":[{"x":0.03834693213218543,"y":1.643665271571109,
    "z":-0.9189726189875955}],"position":{"x":0.5210503123113313,"y":2.325146086504418,"z":-1.4203780284125997},
    "text":"left hand"},{"id":3,"points":[{"x":0.05562013466743565,"y":1.6404827763992103,
    "z":0.9533487794309679}],"position":{"x":0.18885065242216115,"y":2.2365201279125415,"z":1.2479100379638908},
    "text":"right hand"},{"id":4,"points":[{"x":0.1636169699651191,"y":0.6388932187009857,
    "z":-0.07602061097736623}, {"x":0.18297738656877982,"y":0.6669522616368795,"z":0.12959693525661464}],
    "position":{"x":1.0465285433723466, "y":0.5071482887253147,"z":0.07387170013075206},"text":"knees"},
    {"id":5,"points":[{"x":-0.38885138245308326, "y":1.5720951288809317,"z":0.05662421976961696}],
    "position":{"x":-1.2029175571224187,"y":1.5549022450299006,
    "z":-0.011820433183759249},"text":"backpack"},{"id":6,"points":[{"x":0.004955719812194559,
    "y":2.051210552175462,"z":0.009528489769337511}],"position":{"x":0.5725380247647536,
    "y":2.6584205095426796,"z":0.011737539989184143},"text":"head"}]`),
};

const render = () => (
  <div style={styleRoot}>
    <Renderer3DWrapper
      blockProps={{
        mode: 'READONLY',
        source, metadata,
        style: style3D,
      }}
    />
    <style
      dangerouslySetInnerHTML={{
        __html:
        ` html {
            height: 100%;
          }
          body {
            margin: 0px;
            height: 100%;
          }
          #root {
            height: 100%;
          }
          `,
      }}
    />
  </div>
);
ReactDOM.render(render(), document.getElementById('root'));
