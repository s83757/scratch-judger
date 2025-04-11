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