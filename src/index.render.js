/* eslint strict:0 no-param-reassign:0, no-console:0 */
'use strict';

// Add Babel polyfill to have ES7 features
import 'babel-core/register';
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import Renderer3DWrapper from './components/renderer-3d-wrapper/';

ReactDOM.render(<Renderer3DWrapper />, document.getElementById('root'));
