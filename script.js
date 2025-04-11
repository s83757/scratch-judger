const vm = new window.VirtualMachine();

document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        const arrayBuffer = reader.result;
        vm.loadProject(arrayBuffer).then(() => {
            vm.start();
            vm.greenFlag();
        }).catch(error => {
            console.error('Error loading project:', error);
        });
    };
    reader.readAsArrayBuffer(file);
});

vm.runtime.on('SAY', ({ target, type, message }) => {
    if (type === 'say') {
        console.log(`Sprite "${target.getName()}" says: ${message}`);
        // You can also display this message in the DOM or handle it as needed
    }
});

vm.runtime.on('QUESTION', (question) => {
    // Display the question to the user
    const userResponse = prompt(question);
    
    // Provide the user's answer back to the VM
    vm.postIOData('userInput', {
        id: 'answer',
        value: userResponse
    });
});