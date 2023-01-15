importScripts("https://cdn.jsdelivr.net/pyodide/v0.22.0/full/pyodide.js");

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  console.log(await pyodide.runPythonAsync(`
    import micropip
    await micropip.install('./onnx-1.13.0-cp310-cp310-emscripten_3_1_27_wasm32.whl')
    await micropip.install('./onnx_script-0.1.0-py3-none-any.whl')
  `));
  console.log("Finished worker init.");
}
let pyodideReadyPromise = loadPyodideAndPackages();


let isFirstRun = true;
self.onmessage = async (event) => {
  await pyodideReadyPromise;
  
  if(event.data.command === "codeToModel") {

    const { id, pythonCode } = event.data;
    
    await addFileToFileSystem({text:pythonCode}, "/home/pyodide/create_model.py")
    console.log("Loaded main.py into filesystem.");
    
    let result;
    if(isFirstRun) result = await self.pyodide.runPythonAsync(`import create_model`).catch(e => e);
    else result = await self.pyodide.runPythonAsync(`import create_model; from importlib import reload; reload(create_model);`).catch(e => e);
    isFirstRun = false;

    console.log("result:", result);

    let modelUint8Array;
    try { modelUint8Array = pyodide.FS.readFile("/model.onnx"); } catch(e) { modelUint8Array = new Uint8Array(1); }

    self.postMessage({ id, error:result, modelBuffer:modelUint8Array.buffer }, [modelUint8Array.buffer]);

  } else if(event.data.command === "modelToCode") {

    const { id, modelBuffer } = event.data;

    let modelBlob = new Blob([new Uint8Array(modelBuffer)]);
    let modelBlobUrl = URL.createObjectURL(modelBlob);
    await addFileToFileSystem({url:modelBlobUrl}, "/model.onnx");

    let pythonCode = await self.pyodide.runPythonAsync(`
      print("NOT YET SUPPORTED")
    `).catch(e => e);

    self.postMessage({ id, pythonCode });

  } else {
    throw new Error("Unknown command sent to pyodideWorker.js");
  }
};



async function addFileToFileSystem(dataObj, pyodidePath) {
  if(dataObj.url) {
    let fileArrayBuffer = await fetch(dataObj.url).then(r => r.arrayBuffer());
    let data = new Uint8Array(fileArrayBuffer);
    let stream = pyodide.FS.open(pyodidePath, 'w+');
    pyodide.FS.write(stream, data, 0, data.length, 0);
    pyodide.FS.close(stream);
  } else if (dataObj.text) {
    pyodide.FS.writeFile(pyodidePath, dataObj.text, { encoding: "utf8" });
  } else {
    throw new Error("Must provide either `dataObj.text` or `dataObj.url`");
  }
}
