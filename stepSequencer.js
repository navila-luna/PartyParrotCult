
document.documentElement.addEventListener('mousedown', () => {
    if (Tone.context.state !== 'running') Tone.context.resume();
  });

const synths = [
    new Tone.Synth(),
    new Tone.Synth(), 
    new Tone.Synth(),

    new Tone.Synth(),
    new Tone.Synth(), 
    new Tone.Synth(), 

    new Tone.Synth(),
    new Tone.Synth(), 
    new Tone.Synth(),

    new Tone.Synth(),
    new Tone.Synth(), 
    new Tone.Synth(), 

    new Tone.Synth(),
    new Tone.Synth(), 
    new Tone.Synth(),
    new Tone.Synth(), 
    new Tone.Synth()
]

synths[0].oscillator.type = 'triangle'
synths[1].oscillator.type = 'sine'
synths[2].oscillator.type = 'sawtooth'

synths[3].oscillator.type = 'triangle'
synths[4].oscillator.type = 'sine'
synths[5].oscillator.type = 'sawtooth'

synths[6].oscillator.type = 'triangle'
synths[7].oscillator.type = 'sine'
synths[8].oscillator.type = 'sawtooth'

synths[9].oscillator.type = 'sine'
synths[10].oscillator.type = 'sawtooth'
synths[11].oscillator.type = 'triangle'
synths[12].oscillator.type = 'sine'

const gain = new Tone.Gain(0.6);
gain.toMaster();
synths.forEach(synth => synth.toMaster())

// will select any child of a div
console.log("document.body", document.body)
const $rows = document.body.querySelectorAll('div > div.row1, div.row2, div.row3, div.row4, div.row5, div.row6, div.row7, div.row8, div.row9, div.row10, div.row11, div.row12, div.row13, div.row14, div.row15, div.row16, div.row17')
console.log($rows)

document.body.querySelectorAll('.checkbox-size').forEach((checkbox) => {
 checkbox.addEventListener('click', () => {
    if(checkbox.checked){
      checkbox.style.rotate = '45deg'
    }
    else {
      checkbox.style.rotate = '0deg'
    }
  } )
})
let trumpet = new Tone.Player("audio/trumpet-1_D_minor.wav").toMaster();
let trapSnare = new Tone.Player("audio/brightSnare.wav").toMaster();
// let uke = new Tone.Player("audio/ukuleleSnippet.wav").toMaster();
let bassElectric = new Tone.Player("audio/bassElectric.wav").toMaster();
let drums = new Tone.Player("audio/drumss.wav").toMaster();

const notes = ["D4", "F4", "A4", "C5",
               "G4", "B4", "D5", "F5", 
               "C4", "E4", "E5", "G5", "B5", trapSnare, bassElectric,  trumpet, drums];

// list of all the images for party parrots (does not currently include the gifs)
const partyParrots = [".greenParrot", ".blueParrot",".originalPartyParrot", 
".purpleParrot",".pinkParrot", ".redParrot",".mischeviousPartyParrot", ".yellowParrot",
 ".movingRainbowParrots", ".greyParrot",".darkBlueParrot", ".crazyParrot", ".terminalParrot", ".drums_two",".redGuitar", ".trumpeta", ".drums" ]
let assignedPartyParrots = {}
for(let i=0; i < partyParrots.length; i++){
  assignedPartyParrots[i] = partyParrots[i]
}
console.log("assignedPartyParrots", assignedPartyParrots)

// Helper to select the appropriate image
function selectImage(givenImage){
  return document.querySelector(givenImage)
}

let index = 0
Tone.Transport.scheduleRepeat(repeat, '8n')
Tone.Transport.start()
let to;
// checks if a image associated to a row is currently on or not.

let buttonClicked = {}
function repeat(time) {
    let step = index % 8
    for(let i = 0; i < $rows.length; i++) {
        let synth = synths[i],
        note = notes[i],
        $row = $rows[i],
        $input = $row.querySelector(`input:nth-child(${step + 1})`)
        console.log($input, note)
        if($input.checked) {
            if (typeof note === 'string') {
                synth.triggerAttackRelease(note, '8n', time);
              } else if (note instanceof Tone.Player) {
                note.start(time);
              }
        console.log("meow", $input.checked, note)
        if((i in assignedPartyParrots) && ($input.checked)) {
          let givenParrotElement = selectImage(assignedPartyParrots[i])
          if (!(givenParrotElement in buttonClicked)) {
            buttonClicked["givenParrotElement"] = "ON"
            givenParrotElement.style.visibility = "visible";
          }
          givenParrotElement.classList.remove("animate__bounce");
          to = setTimeout(() => {
            givenParrotElement.classList.add("animate__bounce")
            }, 10);
          }
        }
    index ++
  }
}
