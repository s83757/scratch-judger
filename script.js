// Create an instance of the Scratch VM
const vm = new ScratchVM();
const renderer = new ScratchRenderer(document.getElementById('output'));

// Load SB3 file when uploaded
document.getElementById('file-upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadSB3(file);
    }
});

// Function to load the SB3 file into the Scratch VM
function loadSB3(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const projectData = e.target.result;
        await vm.loadProject(projectData);
        vm.start();
        renderer.start(vm);  // Start rendering the project
        
        // Listen for "say" block output
        vm.runtime.on('say', (message) => {
            document.getElementById('output').innerText = message;
        });

        // Listen for "ask" block response
        vm.runtime.on('ask', async (question) => {
            const userResponse = prompt(question);  // Get response from user
            vm.runtime.emit('answer', userResponse);  // Send response back to VM
        });
    };
    reader.readAsArrayBuffer(file);
}
