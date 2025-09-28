import { OptimizedQueue, SimpleStack } from "./dataStructures.js";

const TIME_LIMIT = 2000;

const vm = new window.VirtualMachine();

// vm.convertToPackagedRuntime();
vm.setTurboMode(true);
// vm.setFramerate(250);

// const storage = new Scratch.Storage();
const storage = new window.ScratchStorage.ScratchStorage();
// const storage = new ScratchStorage();
vm.attachStorage(storage);

var enabled = false;

function processSay(target, type, message) {
    console.log("say block detected");
    if (enabled == false) {
        return;
    }
    if (target) {
        const name = target.sprite && target.sprite.name ? target.sprite.name : 'Unknown';
        // const message = target.sayBubble && target.sayBubble.text ? target.sayBubble.text : 'No message';
        console.log(`Sprite "${name}" says: ${message}`);
    } else {
        console.warn('SAY event received with undefined target:', target, type, message);
    }
};
function processQuestion(data) {
    if (enabled == false) {
        vm.runtime.emit("ANSWER", "");
        return;
    }
    var q = "Insert input:";
    if ( data === null) {
        console.log("data is null, exited");
        return;
    } else if (typeof data === "string" && data === '') {
        
    } else {
        q = data[0]; // question is 1st element of data array
    }
    console.log("QUESTION ee event fired. question: " + q);

    var userResponse = prompt(q); // scratch-vm should format input field automatically
    vm.runtime.emit("ANSWER", userResponse);
};


// vm.start();



// file uploads
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        console.log("file submitted");
        
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }
    
        const reader = new FileReader();
        reader.onload = function () {
            const arrayBuffer = reader.result;
            runTests(arrayBuffer, "./test_data/sum/sum.zip");
        };
        reader.readAsArrayBuffer(file);
    });

    
});

function runTests(submission, testData) {
    fetch(testData)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            if (testData.endsWith('.zip')) {
                return processZipContents(arrayBuffer);
            } else {
                return processFolderContents(arrayBuffer);
            }
            
            // evaluate(submission, inputs, outputs);
        })
        .then(results => {
            const {inputs, outputs} = results;
            evaluate(submission, inputs, outputs);
        })
        .catch(error => console.error('Error fetching zip:', error));
}


function testDataComp(a, b) {
    return a[0] > b[0];
}

function processFolderContents(folder) {

}

function processZipContents(zipArrayBuffer) {
    const zip = new JSZip();
    return zip.loadAsync(zipArrayBuffer).then(function (loadedZip) {
        
        console.log("ZIP archive successfully loaded. Files inside:");

        const fileExtractionPromises = [];
        const rawInputs = [];
        const rawOutputs = [];

        loadedZip.forEach(function (relativePath, zipEntry) {
            if (!zipEntry.dir) {
                const fileExtension = relativePath.endsWith('.in') ? '.in' : 
                                        relativePath.endsWith('.out') ? '.out' : null;

                if (fileExtension) {
                    console.log(`Found file: ${relativePath}`);
                    const extractPromise = zipEntry.async("text").then(function (fileContent) { // async extract
                        if (fileExtension === '.in') {
                            rawInputs.push([relativePath, fileContent]);
                        } else { //.out
                            rawOutputs.push([relativePath, fileContent]);
                        }
                    });
                    fileExtractionPromises.push(extractPromise);
                }
            }
        });
        return Promise.all(fileExtractionPromises)
                .then(() => {
                    console.log("All files extracted. Sorting data.");

                    // 4. Sort the data only AFTER all promises are resolved
                    rawInputs.sort(testDataComp);
                    rawOutputs.sort(testDataComp);
                    
                    // 5. Return the final object that resolves the main processZipContents Promise
                    return { inputs: rawInputs, outputs: rawOutputs };
                });
    }).catch(e => {
        console.error("Error processing zip file:", e);
    });
}

async function evaluate(submission, inputs, outputs) {
    if (inputs.length != outputs.length) {
        console.warn("Bad input data (different amounts of input vs outputs");
        return;
    }

    const testResults = [];

    for (let i = 0; i < inputs.length; i++) {
        console.log(`\n--- Running Test Case ${i + 1} ---`);
        const result = await runSingleTest(
            submission, // The loaded project file content
            inputs[i][1],
            outputs[i][1],
            TIME_LIMIT
        );
        testResults.push({
            testCase: i+1,
            result: result
        });
    }
    console.log("\n--- All Tests Complete ---");
    console.table(testResults);
    return testResults;
}

// Assume vm and enabled are globally accessible, as in your setup.
// If not, they should be passed as arguments.
const TEST_TIMEOUT = 5000; // Example time limit (5 seconds)

/**
 * Runs a single test case using the Virtual Machine.
 * @param {ArrayBuffer} submission - The Scratch project file content.
 * @param {string} inputData - The input string to feed the QUESTION block.
 * @param {string} expectedOutput - The expected output string.
 * @param {number} timeoutMs - Time limit for the test run.
 * @returns {Promise<string>} A Promise that resolves to one of the result strings.
 */
function runSingleTest(submission, inputData, expectedOutput, timelimit) {
    
    var inputQueue = new OptimizedQueue();
    const inputLines = inputData.split(/\r?\n/).filter(line => line.trim().length > 0); // \r is for windows
    inputLines.forEach(line => inputQueue.enqueue(line));
    console.log(inputQueue);
    var startTime;
    var elapsedTime;

    return new Promise((resolve) => {

        const grade = () => {
            const normalizedActual = programOutput.trim();
            const normalizedExpected = expectedOutput.trim();
            // var elapsedTime = Math.round(performance.now() - startTime); 

            if (normalizedActual === normalizedExpected) {
                resolve("correct, " + elapsedTime + "ms");
            } else {
                console.log(`Expected: "${normalizedExpected}", Actual: "${normalizedActual}"`);
                resolve("rejected (wrong answer or tle)");
            }
        }

        const timer = setTimeout(() => {
            cleanup();
            // resolve("time limit exceeded");
            grade();
        }, timelimit);

        let programOutput = "";
        const sayListener = (target, type, message) => {
            programOutput += message;
            if (message !== "") {
                programOutput += "\n";
                // console.log("received nonempty say");
                elapsedTime = Math.round(performance.now() - startTime);
            }
            
            
        };
        const cleanup = () => {

            // Important: detach the event listeners here 
            // to prevent memory leaks/duplicate listeners on the next run
            vm.stopAll();
            // vm.runtime.removeListener('THREAD_EXIT', threadExitListener);
            vm.runtime.removeListener('SAY', sayListener);
            vm.runtime.removeListener('QUESTION', questionListener);
            vm.runtime.removeListener('RUNTIME_ERROR', runtimeErrorListener);
            
        }
        
        

        // Listener to feed input and finalize the test
        const questionListener = (data) => {
            
            if (data !== null) {
                // console.log("triggered");
                // Immediately feed the input data
                if (inputQueue.isEmpty()) {
                    console.warn("Project asked for more input than provided.");
                    cleanup();
                    // grade();
                    resolve("runtime error");
                    return;
                }
                const nextInput = inputQueue.dequeue();
                // console.log(nextInput);
                vm.runtime.emit('ANSWER', nextInput);
                // console.log("responded");
            }
            
        };
        
        // Listener to detect VM errors (e.g., stack overflow)
        const runtimeErrorListener = (error) => {
             // Clear the timeout and resolve with error status
            clearTimeout(timer);
            cleanup();

            console.error("Runtime Error Detected:", error);
            resolve("runtime error");
        };

        

        

        // --- 4. Load and Run ---
        vm.runtime.on('SAY', sayListener);
        vm.runtime.on('QUESTION', questionListener);

        vm.runtime.on('RUNTIME_ERROR', runtimeErrorListener); // Important for error catching

        vm.loadProject(submission)
            .then(() => {
                vm.stopAll();
                vm.start();
                startTime = performance.now();
                vm.greenFlag();
            })
            .catch(error => {
                clearTimeout(timer);
                console.error("Load Error:", error);
                cleanup();
                resolve("runtime error"); // Treat load error as a type of runtime failure
            });
    });
}

