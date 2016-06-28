/* eslint strict:0 no-param-reassign:0, no-console:0 */
'use strict';

// Add Babel polyfill to have ES7 features
import 'babel-core/register';
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import Renderer3DWrapper from './components/renderer-3d-wrapper/';

const URL = 'http://files.lupi.online/api/v1/storage';
const getParam = (name) =>
  decodeURIComponent((new RegExp(`[?|&]${name}=([^&;]+?)(&|#|;|$)`).exec(location.search)
                      || [null, ''])[1].replace(/\+/g, '%20'))
                      || null;

// http://localhost:3000/3d/?f=9dcc5ae8ec60f88b2e668c6970ecc8b9&l=[{%22id%22:1,%22points%22:[{%22x%22:0.08011267886422502,%22y%22:1.7630375099710704,%20%22z%22:0.2855099769166429},{%22x%22:0.07996274114879043,%22y%22:1.7642502742242812,%22z%22:-0.24056268813839665}],%20%22position%22:{%22x%22:-1.2019907948864557,%22y%22:2.368970534761047,%22z%22:-0.06227645813365079},%20%22text%22:%22shoulders%22},{%22id%22:2,%22points%22:[{%22x%22:0.03834693213218543,%22y%22:1.643665271571109,%20%22z%22:-0.9189726189875955}],%22position%22:{%22x%22:0.5210503123113313,%22y%22:2.325146086504418,%22z%22:-1.4203780284125997},%20%22text%22:%22left%20hand%22},{%22id%22:3,%22points%22:[{%22x%22:0.05562013466743565,%22y%22:1.6404827763992103,%20%22z%22:0.9533487794309679}],%22position%22:{%22x%22:0.18885065242216115,%22y%22:2.2365201279125415,%22z%22:1.2479100379638908},%20%22text%22:%22right%20hand%22},{%22id%22:4,%22points%22:[{%22x%22:0.1636169699651191,%22y%22:0.6388932187009857,%20%22z%22:-0.07602061097736623},%20{%22x%22:0.18297738656877982,%22y%22:0.6669522616368795,%22z%22:0.12959693525661464}],%20%22position%22:{%22x%22:1.0465285433723466,%20%22y%22:0.5071482887253147,%22z%22:0.07387170013075206},%22text%22:%22knees%22},%20{%22id%22:5,%22points%22:[{%22x%22:-0.38885138245308326,%20%22y%22:1.5720951288809317,%22z%22:0.05662421976961696}],%20%22position%22:{%22x%22:-1.2029175571224187,%22y%22:1.5549022450299006,%20%22z%22:-0.011820433183759249},%22text%22:%22backpack%22},{%22id%22:6,%22points%22:[{%22x%22:0.004955719812194559,%20%22y%22:2.051210552175462,%22z%22:0.009528489769337511}],%22position%22:{%22x%22:0.5725380247647536,%20%22y%22:2.6584205095426796,%22z%22:0.011737539989184143},%22text%22:%22head%22}]

const source = {
  zipUrl: `${URL}/${getParam('f')}`,
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
  labels: JSON.parse(getParam('l')),
};

const render = () => (
  <div style={styleRoot}>
    <Renderer3DWrapper
      blockProps={{
        mode: 'READONLY',
        source,
        metadata,
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
