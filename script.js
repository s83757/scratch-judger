const fileInput = document.getElementById("fileInput");
const questionBox = document.getElementById("question-box");
const questionText = document.getElementById("question-text");
const answerInput = document.getElementById("answer-input");
const submitAnswer = document.getElementById("submit-answer");

const vm = new window.VirtualMachine();

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const buffer = await file.arrayBuffer();

  vm.attachRenderer(new window.HTMLRenderer(document.getElementById("stage-container")));
  vm.loadProject(buffer).then(() => {
    vm.greenFlag(); // starts the project
  });
});

// Handle the ask-and-wait block
vm.on("QUESTION", (text) => {
  questionText.textContent = text;
  answerInput.value = "";
  questionBox.classList.remove("hidden");
});

submitAnswer.addEventListener("click", () => {
  const answer = answerInput.value;
  vm.postIOData("answer", { text: answer });
  vm.runtime.ioDevices.prompt._onPromptAnswer(answer);
  questionBox.classList.add("hidden");
});
