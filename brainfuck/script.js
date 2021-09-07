let element = document.body;
let run = false;
let step = 0;

let interv = setInterval(runStep,1);

let mem = new Array(30000);
let inputBuffer = new Array(64);
for(let i = 0; i < mem.length; i++) {mem[i] = 0;}
let ptr = 0;

let outp = document.getElementById('outp');

let waitInput = false;

function reset() {
    let cd = document.getElementById('txtbx').value;
    let parCount = 0;
    for(let i = 0; i < cd.length; i++) {
        if(cd.charAt(i) == '[') {
            parCount++;
        }
        if(cd.charAt(i) == ']') {
            parCount--;
        }
    }
    if(parCount == 0) {
        for(let i = 0; i < mem.length; i++) {mem[i] = 0;}
        ptr = 0;
        run = true;
        step = 0;
        outp.value = "";
        clearInterval(interv);
        interv = setInterval(runStep, document.getElementById('slide').value );
        inputBuffer = new Array(64);
        for(let i = 0; i < inputBuffer.length; i++) {
            inputBuffer[i] = 0;
        }
    } else {
        if(parCount > 0) {
            outp.value = "Missing ']'"
        }
        if(parCount < 0) {
            outp.value = "Missing '['"
        }
    }
}

function runStep() {
    clearInterval(interv);
    interv = setInterval(runStep, document.getElementById('slide').value );
    let repeat = 1;

    if(document.getElementById('slide').value == 0) {
        repeat = 100;
    }
    for(let rep = 0; rep < repeat; rep++) {
 
    let code = document.getElementById('txtbx').value;
    let debug = document.getElementById('debug');
    let status = document.getElementById('stat');
    if(run) {
        let c = code.charAt(step);
        
        
        switch(c) {
            case '>':
                ptr++;
            break;
            case '<':
                ptr--;
            break;
            case '+':
                mem[ptr]++;
                mem[ptr]%=256;
            break;
            case '-':
                mem[ptr]--;
                if(mem[ptr] < 0) {
                    mem[ptr] = 255;
                }
            break;
            case '.':
                outp.value = outp.value + String.fromCharCode(mem[ptr]);
            break;
            case ',':
                
                if(inputBuffer[0] == 0) {
                    inp = prompt("Input:") + '\n';
                    mem[ptr] = inp.charCodeAt(0);
                    if(inp.length > 1) {
                        for(let i = 1; i < inp.length; i++) {
                            inputBuffer[i-1] = inp.charCodeAt(i);
                        }
                    }
                } else {
                    mem[ptr] = inputBuffer[0];
                    for(let i = 0; i < inputBuffer.length-1; i++) {
                        inputBuffer[i] = inputBuffer[i+1];
                    }
                }

                
                if(mem[ptr] == 124) {
                    run = false;
                    outp.value = outp.value + "\n--BREAK--"
                }
                
                
            break;
            case '[':
                if(mem[ptr] == 0) {
                    let counter = 1;
                    while(counter > 0) {
                        let inc = code.charAt(step+1);
                        step++;
                        if(inc == '[') {
                            counter++;
                        } else if(inc == ']') {
                            counter--;
                        }

                    }
                }
            break;
            case ']':
                if(mem[ptr] != 0) {
                    let counter = 1;
                    while(counter > 0) {
                        let inc = code.charAt(step-1);
                        step--;
                        if(inc == '[') {
                            counter--;
                        } else if(inc == ']') {
                            counter++;
                        }

                    }
                }
            break;
        }
        debug.value = "Step: " + step + "\n";
        debug.value = debug.value + "Pointer: " + ptr + "\n";
        debug.value = debug.value + "Cell Value: " + mem[ptr] + "\n";
        debug.value = debug.value + "Instruction: " + c + "\n";
        for(let i = 0; i < 16; i++) {
            debug.value = debug.value + i + ": " + mem[i] + "\n";
        }

        step++;
        if(step >= code.length) {
            step = 0;
            run = false;
        }
    } // if(run)

    if(run) {
        status.value = "Running.";
    } else {
        status.value = "Stopped."
    }


} // end of for loop

} // end of runStep
