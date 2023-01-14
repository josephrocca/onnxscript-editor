Demo: https://josephrocca.github.io/onnxscript-editor/demo

A prototype to code up an ONNX model with [ONNX Script](https://github.com/microsoft/onnx-script) while visualising your edits live with [Netron](https://github.com/lutzroeder/netron). It runs **completely in the browser** - no server involved. This is thanks to [Pyodide](https://github.com/pyodide/pyodide/) - a Python runtime compiled to wasm.

The `onnxscript` package is pure Python so it was easy to get working (just clone repo, install `pyodide-build` with `pip`, and then run `pyodide build`). Building `onnx` was a bit harder since it has C++ code. The build process for `onnx` is [detailed here](https://github.com/josephrocca/onnx-pyodide).



https://user-images.githubusercontent.com/1167575/212470731-7741452e-c0d4-4931-a996-f7c0e456c820.mp4



### Changes made to Netron

A few things hackily changed to get this prototype working:

* Replace [these lines](https://github.com/lutzroeder/netron/blob/v6.4.0/source/index.js#L79-L193) with `resolve()` to remove telemetry stuff.
* Add this `if(!window.___iframeExports) window.___iframeExports = {}; window.___iframeExports.open = this._open.bind(this);` [here](https://github.com/lutzroeder/netron/blob/v6.4.0/source/index.js#L281).
* Remove [this line](https://github.com/lutzroeder/netron/blob/v6.4.0/source/view.js#L289) and [this line](https://github.com/lutzroeder/netron/blob/v6.4.0/source/dialog.js#L65) - otherwise netron steals focus every time a model is visualised.
* Remove [this line](https://github.com/lutzroeder/netron/blob/v6.4.0/source/index.js#L11).
