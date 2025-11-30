const socket = io();

const sequencer = document.getElementById("sequencer");
const ROWS = 17;
const COLS = 8;

const notes = [
    "D4","F4","A4","C5",
    "G4","B4","D5","F5",
    "C4","E4","E5","G5","B5",
    new Tone.Player("audio/brightSnare.wav").toMaster(),
    new Tone.Player("audio/bassElectric.wav").toMaster(),
    new Tone.Player("audio/trumpet-1_D_minor.wav").toMaster(),
    new Tone.Player("audio/drumss.wav").toMaster()
];
// your original colors
const rowColors = [
    ["rgb(181, 233, 112)", "darkgreen"],
    ["rgb(133, 230, 207)", "rgb(96, 140, 184)"],
    ["rgb(202, 113, 235)", "purple"],
    ["rgb(248, 180, 107)", "rgb(255, 140, 0)"],
    ["rgb(255, 160, 160)", "red"],
    ["rgb(255, 255, 153)", "gold"],
    ["rgb(153, 204, 255)", "dodgerblue"],
    ["rgb(204, 153, 255)", "mediumpurple"],
    ["rgb(255, 204, 153)", "chocolate"],
    ["rgb(255, 102, 178)", "deeppink"],
    ["rgb(153, 255, 204)", "teal"],
    ["rgb(255, 153, 153)", "crimson"],
    ["rgb(153, 153, 255)", "indigo"],
    ["rgb(255, 204, 204)", "maroon"],
    ["rgb(204, 255, 153)", "olive"],
    ["rgb(153, 255, 255)", "cadetblue"],
    ["rgb(255, 153, 255)", "mediumvioletred"]
];
const partyParrots = [
  ".greenParrot", ".blueParrot",".originalPartyParrot", 
  ".purpleParrot",".pinkParrot", ".redParrot",".mischeviousPartyParrot", ".yellowParrot",
   ".movingRainbowParrots", ".greyParrot",".darkBlueParrot", ".crazyParrot", 
   ".terminalParrot", ".drums_two",".redGuitar", ".trumpeta", ".drums" ]

const parrotElements = partyParrots.map(selector => document.querySelector(selector));
const rowCheckCounts = Array(ROWS).fill(0);


// Optimized function - just updates visibility based on count
function updateParrotVisibility(rowNum) {
  const parrotElement = parrotElements[rowNum - 1];
  if (!parrotElement) return;
  
  if (rowCheckCounts[rowNum - 1] > 0) {
      parrotElement.style.visibility = "visible";
      triggerBounce(parrotElement);
  } else {
    parrotElement.style.visibility = "hidden";

  }
}
function triggerBounce(element) {
  element.classList.remove("animate__bounce");
  void element.offsetWidth; 
  element.classList.add("animate__bounce");
}
// Helper to update the count when a checkbox changes
function updateCheckboxState(id, checked) {
  const rowNum = parseInt(id.match(/r(\d+)/)[1]);
  
  // Update count
  if (checked) {
      rowCheckCounts[rowNum - 1]++;
  } else {
      rowCheckCounts[rowNum - 1]--;
  }
  
  updateParrotVisibility(rowNum);
}

// Generate grid dynamically
for (let r = 1; r <= ROWS; r++) {
    const row = document.createElement("div");
    row.classList.add("row");

    row.style.setProperty("--row-color", rowColors[r - 1][0]);
    row.style.setProperty("--row-checked", rowColors[r - 1][1]);

    for (let c = 1; c <= COLS; c++) {
        const box = document.createElement("input");
        box.type = "checkbox";
        box.id = `r${r}-c${c}`;

        box.addEventListener("change", () => {
            socket.emit("checkbox-updated", {
                id: box.id,
                checked: box.checked
            });
            updateCheckboxState(box.id, box.checked);
        });

        row.appendChild(box);
    }

    sequencer.appendChild(row);
}

// initial state from server
socket.on("init-state", (state) => {
    for (const id in state) {
        const box = document.getElementById(id);
        if (box){
          box.checked = state[id];
          if (state[id]) {
            const rowNum = parseInt(id.match(/r(\d+)/)[1]);
            rowCheckCounts[rowNum - 1]++;
          }

        } 
    }
    // Update all parrot visibility based on counts
    for (let r = 1; r <= ROWS; r++) {
      updateParrotVisibility(r);
    }
});

// sync remote updates
socket.on("checkbox-updated", ({ id, checked }) => {
    const box = document.getElementById(id);
    if (box) {
      box.checked = checked;
      updateCheckboxState(id, checked);
    } 
});

document.documentElement.addEventListener("mousedown", () => {
    if (Tone.context.state !== "running") {
        Tone.context.resume();
    }
});

const synths = Array.from({ length: 17 }, () => new Tone.Synth().toMaster());


let index = 0;
Tone.Transport.scheduleRepeat(repeat, "8n");
Tone.Transport.start();

function repeat(time) {
    const step = index % COLS;
    for (let r = 1; r <= ROWS; r++) {
        const box = document.getElementById(`r${r}-c${step + 1}`);
        const note = notes[r-1];
        const synth = synths[r-1];

        if (box && box.checked) {
            if (typeof note === "string") {
                synth.triggerAttackRelease(note, "8n", time);
            } else {
                note.start(time);
            }
        }

    }

    index++;
}
const resetButton = document.getElementById("reset-button");
// When button is clicked, send reset request to server
resetButton.addEventListener("click", () => {
  socket.emit("reset-grid");
});

socket.on("grid-reset", (state) => {
  console.log("Resetting grid...");
  
  // Reset all checkboxes
  for (const id in state) {
      const box = document.getElementById(id);
      if (box) {
          box.checked = state[id];
      }
  }
  
  // Reset all row check counts to 0
  for (let i = 0; i < ROWS; i++) {
      rowCheckCounts[i] = 0;
  }
  
  // Hide all parrots
  for (let r = 1; r <= ROWS; r++) {
      updateParrotVisibility(r);
  }
  
  Tone.Transport.stop();
  Tone.Transport.start();
});