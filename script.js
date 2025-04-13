
const vm = new window.VirtualMachine();

const storage = new window.ScratchStorage.default();
vm.attachStorage(storage);


vm.start();

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
            const loadPromise = vm.loadProject(arrayBuffer);
            if (loadPromise && typeof loadPromise.then === 'function') {
                loadPromise.then(() => {
                    console.log("Project Loaded");
                    vm.greenFlag();
                }).catch(error => {
                    console.error('Error loading project:', error);
                });
            } else {
                console.error('loadProject did not return a Promise. Ensure all dependencies are properly initialized.');
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // output
    vm.runtime.on('SAY', ({ target, type, message }) => {
        if (type === 'say') {
            console.log(`Sprite "${target.getName()}" says: ${message}`);
            // You can also display this message in the DOM or handle it as needed
        }
    });
    
    // input
    vm.runtime.on('QUESTION', (question) => {
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
});




