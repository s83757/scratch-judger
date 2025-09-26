
const vm = new window.VirtualMachine();

// const storage = new Scratch.Storage();
const storage = new window.ScratchStorage.ScratchStorage();
// const storage = new ScratchStorage();
vm.attachStorage(storage);

var enabled = false;

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
            if (loadPromise && typeof loadPromise.then === 'function') {
                loadPromise.then(() => {
                    console.log("Project Loaded");
                    console.log(JSON.stringify(vm.toJSON(), null, 2));
                    vm.stopAll();
                    vm.start();

                    // vm.runtime._monitors.forEach(m => {
                    //     if (m.params.opcode === 'sensing_answer') {
                    //         console.log("watcher silenced");
                    //         m.visible = false;

                    //     }
                    //   });

                    // output
                    vm.runtime.on('SAY', (data) => {
                        console.log("say block detected");
                        if (enabled == false) {
                            return;
                        }
                        console.log(data);
                        const target = data;
                        if (target) {
                            const name = target.sprite && target.sprite.name ? target.sprite.name : 'Unknown';
                            const message = target.sayBubble && target.sayBubble.text ? target.sayBubble.text : 'No message';
                            console.log(`Sprite "${name}" says: ${message}`);
                        } else {
                            console.warn('SAY event received with undefined target:', data);
                        }
                    });
                    
                    // input
                    vm.runtime.on('QUESTION', (data) => {
                        if (enabled == false) {
                            return;
                        }
                        console.log(data);
                        if (data == null) {
                            return;
                        }
                        const q = data.question;
                        console.log("QUESTION event fired. question: " + q);
                        
                        console.log(typeof data);
                        if (typeof q !== 'string' || q.trim() === '') {
                            console.log("invalidated");
                        }

                        return;
                        // Display the question to the user
                        const userResponse = prompt(question);
                    
                        console.log("user responded");
                        console.log(userResponse);
                        
                        // Provide the user's answer back to the VM
                        vm.postIOData('userInput', {
                            id: 'answer',
                            value: userResponse
                        });
                    });







                    console.log("starting...");
                    setTimeout(() => {
                        enabled = true;
                        console.log("Green Flag");
                        vm.greenFlag();   // Delay just to ensure log appears first
                        
                    }, 200); // or 10-50ms if needed
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




