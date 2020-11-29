// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"script.js":[function(require,module,exports) {
// const video = document.getElementById('webcam');
// const liveView = document.getElementById('liveView');
// const demosSection = document.getElementById('demos');
// const enableWebcamButton = document.getElementById('webcamButton');
// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function LERP(iL, iR, fRatio) {
  if (iL < iR) {
    return iL + (iR - iL) * fRatio;
  } else {
    return iL - (iL - iR) * fRatio;
  }
}

function greyScaleC(iR, iG, iB) {
  var iBrightness = 3 * iR + 4 * iG + iB >>> 3;
  return [iBrightness, iBrightness, iBrightness];
}

var energy = 0.0;
var activity = false;
document.addEventListener('keypress', function (e) {
  if (e.code === "KeyG" && energy < 1.0) {
    energy = energy + 0.025;
    activity = true;
  }
});
document.addEventListener('keyup', function (e) {
  activity = false;
});
document.addEventListener('DOMContentLoaded', function () {
  var eVideo = document.getElementById("player"); //eVideo.playbackRate = 0.2;

  var eCanvas = document.getElementById('canvas');
  var ctx = eCanvas.getContext('2d');
  eVideo.muted = true;
  var eBackCanvas = document.createElement('canvas');
  var ctxBack = eBackCanvas.getContext('2d');
  var iCanvasWidth = window.innerWidth;
  var iCanvasHeight = window.innerHeight;
  var fCanvasAspect = iCanvasWidth / iCanvasHeight;
  eCanvas.width = iCanvasWidth;
  eCanvas.height = iCanvasHeight;
  eVideo.addEventListener("loadedmetadata", function (e) {
    var iWidth = this.videoWidth;
    var iHeight = this.videoHeight;
    var fVideoAspect = iWidth / iHeight;
    console.log("M[" + iWidth + "," + iHeight + "]=" + fVideoAspect);
    eVideo.width = iCanvasWidth;
    eVideo.height = eVideo.width / fVideoAspect;
    eBackCanvas.width = eVideo.width;
    eBackCanvas.height = eVideo.height;
    console.log("V[" + eVideo.width + "," + eVideo.height + "]=" + fVideoAspect);
    console.log("C[" + iCanvasWidth + "," + iCanvasHeight + "]=" + fCanvasAspect); // Initialise the webcam.

    render();
  }, false); // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will
  // define in the next step.
  // if (getUserMediaSupported()) {
  // 	console.log("render");
  // 	render();
  //  		//enableWebcamButton.addEventListener('click', enableCam);
  // } else {
  //  		console.warn('getUserMedia() is not supported by your browser');
  // }

  function render() {
    ctxBack.drawImage(eVideo, 0, 0, eVideo.width, eVideo.height);
    var aPixels = ctxBack.getImageData(0, 0, eVideo.width, eVideo.height);
    ctx.beginPath();
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.rect(0, 0, iCanvasWidth, iCanvasHeight);
    ctx.fill();
    ctx.closePath();
    var iNumPixels = eVideo.width * eVideo.height * 4;

    for (var i = 0; i < iNumPixels; i = i + 4) {
      var cColor = greyScaleC(aPixels.data[i], aPixels.data[i + 1], aPixels.data[i + 2]);
      aPixels.data[i] = LERP(cColor[0], aPixels.data[i], energy);
      aPixels.data[i + 1] = LERP(cColor[1], aPixels.data[i + 1], energy);
      aPixels.data[i + 2] = LERP(cColor[2], aPixels.data[i + 2], energy);
    }

    var iDeltaH = (iCanvasHeight - eVideo.height) / 2;
    ctx.putImageData(aPixels, 0, iDeltaH);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillText("Press g to simulate activity (" + energy.toFixed(2) + ")", 10, 15);

    if (activity) {
      ctx.fillText("Activity Detected", 10, 30);
    } else {
      if (energy >= 0.1) {
        energy = energy - 0.0125;
      }
    }

    eVideo.playbackRate = LERP(0.2, 1.5, energy); //console.log(energy)

    setTimeout(render, 0);
  }
}, false); // // Enable the live webcam view and start classification.
// function enableCam(event) {
//   // Only continue if the COCO-SSD has finished loading.
//   if (!model) {
//     return;
//   }
//   // Hide the button once clicked.
//   event.target.classList.add('removed');
//   // getUsermedia parameters to force video but not audio.
//   const constraints = {
//     video: true
//   };
//   // Activate the webcam stream.
//   navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
//     video.srcObject = stream;
//     video.addEventListener('loadeddata', predictWebcam);
//   });
// }
// // Store the resulting model in the global scope of our app.
// var model = undefined;
// // Before we can use COCO-SSD class we must wait for it to finish
// // loading. Machine Learning models can be large and take a moment
// // to get everything needed to run.
// // Note: cocoSsd is an external object loaded from our index.html
// // script tag import so ignore any warning in Glitch.
// cocoSsd.load().then(function (loadedModel) {
//   model = loadedModel;
//   // Show demo section now model is ready to use.
//   demosSection.classList.remove('invisible');
// });
// var children = [];
// function predictWebcam() {
//   // Now let's start classifying a frame in the stream.
//   model.detect(video).then(function (predictions) {
//     // Remove any highlighting we did previous frame.
//     for (let i = 0; i < children.length; i++) {
//       liveView.removeChild(children[i]);
//     }
//     children.splice(0);
//     // Now lets loop through predictions and draw them to the live view if
//     // they have a high confidence score.
//     for (let n = 0; n < predictions.length; n++) {
//       // If we are over 66% sure we are sure we classified it right, draw it!
//       if (predictions[n].score > 0.66) {
//         const p = document.createElement('p');
//         p.innerText = predictions[n].class  + ' - with '
//             + Math.round(parseFloat(predictions[n].score) * 100)
//             + '% confidence.';
//         p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
//             + (predictions[n].bbox[1] - 10) + 'px; width: '
//             + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
//         const highlighter = document.createElement('div');
//         highlighter.setAttribute('class', 'highlighter');
//         highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
//             + predictions[n].bbox[1] + 'px; width: '
//             + predictions[n].bbox[2] + 'px; height: '
//             + predictions[n].bbox[3] + 'px;';
//         liveView.appendChild(highlighter);
//         liveView.appendChild(p);
//         children.push(highlighter);
//         children.push(p);
//       }
//     }
//     // Call this function again to keep predicting when the browser is ready.
//     window.requestAnimationFrame(predictWebcam);
//   });
// }
},{}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55700" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","script.js"], null)
//# sourceMappingURL=/script.75da7f30.js.map