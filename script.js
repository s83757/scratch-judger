function isStrictInteger(str) {
    return /^-?\d+$/.test(str);
}

function isIntegerString(str) {
    const num = parseFloat(str);
    return Number.isInteger(num) && !isNaN(num);
}



const vm = new window.VirtualMachine();

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
            console.log(arrayBuffer);
            const loadPromise = vm.loadProject(arrayBuffer);

            vm.stopAll();
            enabled = false;

            vm.runtime.removeListener('SAY', processSay);
            vm.runtime.removeListener('QUESTION', processQuestion);
            console.log("Removed custom SAY and QUESTION listeners.");

            if (loadPromise && typeof loadPromise.then === 'function') {
                loadPromise.then(() => {
                    console.log("Project Loaded");
                    console.log(JSON.stringify(vm.toJSON(), null, 2));
                    vm.quit();
                    vm.stopAll();
                    vm.start();

                    vm.runtime.on('SAY', processSay);
                    
                    vm.runtime.on('QUESTION', processQuestion);

                    console.log("starting...");
                    
                    setTimeout(() => {
                        enabled = true;
                        console.log("Green Flag");
                        vm.greenFlag(); 
                        
                    }, 200);
                }).catch(error => {
                    console.error('Error loading project:', error);
                });
            } else {
                console.error('loadProject did not return a Promise. Ensure all dependencies are properly initialized.');
            }
        };
        reader.readAsArrayBuffer(file);
    });

    
});




