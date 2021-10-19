function simplifyCode(codeIn) { // Reduce code to only include the +-><.,[] characters
    outCode = "";
    validChars = ['+','-','>','<','.',',','[',']'];
    for(let i = 0; i < codeIn.length; i++) {
        if(validChars.includes(codeIn.charAt(i))) {
            outCode = outCode + codeIn.charAt(i); 
        }
    }
    return outCode;
}



function optimizeCode(codeIn) { // Optimizes code to simplify 
    let outCode = [];
    let previousInst = codeIn.charAt(0);
    let instNum = 0; 
    for(let i = 0; i < codeIn.length; i++ ) { // This part makes an array of each instruction and how many times the instruction repeats. Eg: [['+',6],['>',3]]
        let inst = codeIn.charAt(i);
        if(inst == previousInst && inst != '[' && inst != ']' && inst != ',') {
            instNum++;
        } else {
            if(instNum > 0) {
                outCode[outCode.length] = [previousInst,instNum];
            }
            previousInst = inst;
            instNum = 1;
        }
    } 

 
    for(let i = 0; i  < outCode.length; i++) { // Checks for each [] and defines the location for each matching pair, to avoid searching while running
        let inst = outCode[i][0]; 
        if(inst == '[') {
            let braceNum = 1;
            let stepInd = i+1;
            while(braceNum != 0) {
                if(outCode[stepInd][0] == '[') {
                    braceNum++;
                } else if(outCode[stepInd][0] == ']') {
                    braceNum--;
                }
                stepInd += 1;
            }
            outCode[i][1] = stepInd-1;
        } else if(inst == ']') {
            let braceNum = 1;
            let stepInd = i-1;
            while(braceNum != 0) {
                if(outCode[stepInd][0] == ']') {
                    braceNum++;
                } else if(outCode[stepInd][0] == '[') {
                    braceNum--;
                }
                stepInd -= 1;
            }
            outCode[i][1] = stepInd+1;
        }
    }


    return outCode;
}



let isRunning = false;
let runningCode = [];
let progCount = 0;
let mem = new Array(30000);
let ptr = 0;
let interv = setInterval(stepCode,1);
let waitingForInput = false;
let inputBuffer = [];
let prevInput = false; 

function stepCode() {
    clearInterval(interv);
    interv = setInterval(stepCode, document.getElementById('slide').value ); // Set call rate based on slider value
    let repeats = 1;
    if(document.getElementById('slide').value == 0) {
        repeats = 1000; // Run 1000 every time stepCode is called
    }
    for(let i = 0; i < repeats; i++) {
        if(isRunning && !waitingForInput) {
            
            let currentInst = runningCode[progCount][0]; // Current instruction
            let currentNum = runningCode[progCount][1]; // Number for current instruction
            if(prevInput) {
                mem[ptr] = inputBuffer.pop().charCodeAt(0); // Get input from buffer if the previous instruction was an input
                prevInput = false;
            }
            switch(currentInst) {
                case '+':
                    mem[ptr] = (mem[ptr]+currentNum)%256; // Add to memory cell and wrap on overflow
                break;
                case '-':
                    mem[ptr] = ((   (mem[ptr]-currentNum) % 256) + 256) % 256; // Subtract from memory cell and wrap on underflow
                break;
                case '>':
                    ptr+=currentNum; // Move pointer right

                break;
                case '<':
                    ptr-=currentNum; // Move pointer left

                break;
                case '[':
                    if(mem[ptr] == 0) {
                        progCount = currentNum; // Branch on zero
                    }
                break;
                case ']':
                    if(mem[ptr] != 0) {
                        progCount = currentNum; // Branch on not zero
                    }
                break;
                case '.':
                    for(let i = 0; i < currentNum; i++) {
                        document.getElementById('consoleOut').value+=String.fromCharCode(mem[ptr]  + 3); // Print the value of the current memory cell
                    }
                    document.getElementById("consoleOut").scrollTop = document.getElementById("consoleOut").scrollHeight // Auto scroll
                break;
                case ',':
                    if(inputBuffer.length == 0) { // If the input buffer is empty, wait for an input and set previous input flag
                        waitingForInput = true;
                        prevInput = true;
                    } else {
                        mem[ptr] = inputBuffer.pop().charCodeAt(0);
                    }
                break;
            }


            progCount++; 
            if(progCount >= runningCode.length) { // Stop program when it reaches the end
                isRunning = false;
            }

        }
    }
}


function showDebug() { // Shows the debug screen
    let outDebug = document.getElementById('bfDebug'); // Debug output
    outDebug.value = ''; // Clear the output
    
    
    for(let i = 0; i < 200; i++) {
        let curMem = mem[i]; // Get value at the memory address
        
        if(curMem == 0) { // This looks ugly but is done to avoid doing log(0)
            outDebug.value += '  0'; 
        } else {
            let numDigs = Math.floor(Math.log10(curMem)); // Get the number of digits to align everything
            if(numDigs == 0) {
                outDebug.value += '  '+ mem[i] ; // One digit number
            } else if(numDigs == 1) {
                outDebug.value += ' '+ mem[i] ; // Two digit number
            } else if(numDigs == 2) {
                outDebug.value += mem[i] ; // Thre digit number
            }
        }

        if(i == ptr) {
            outDebug.value+='<'; // Make a < point to the current memory address
        } else {
            outDebug.value+=' '
        }
    }
}


setInterval(showDebug,10); // Runs the showDebug function every 10ms

function runCode() {
    bfIn = document.getElementById('bfCode').value; // Get brainfuck code
    simpCode = simplifyCode(bfIn); // Simplify the brainfuck code
    runningCode = optimizeCode(simpCode + '#'); // Run the code through the optimizer
    document.getElementById('consoleOut').value=''; // Clears the console input and output
    document.getElementById('consoleIn').value='';
    waitingForInput = false; // Stop waiting for input
    prevInput = false; 
    inputBuffer = []; // Clear the input buffer

    progCount = 0; // Reset program counter, memory, and pointer
    mem = new Array(30000);
    for(let i = 0; i < mem.length; i++) {
        mem[i] = 0;
    }
    ptr = 0;

    isRunning = true; // Start running program
}

function searchButton() {
    if(event.key === 'Enter') { // Event is depricated. There should be a better solution, but I don't know what it is
        textInput();
    }
}

function stopCode() { // Stops running the code
    isRunning = false;
    runningCode = [];
}

function textInput() {
    let cinVal = document.getElementById('consoleIn').value + '\n'; // Get text from console input
    inputBuffer = []; // Clear the input buffer
    for(let i = 0; i < cinVal.length; i++) {
        inputBuffer[i] = cinVal.charAt( cinVal.length  - 1 - i); // Push each key from text input in reverse order into the input buffer
    }
    document.getElementById('consoleOut').value+='\n' + cinVal; // Echo the input in the console output
    document.getElementById('consoleIn').value = ''; // Clear the input
    waitingForInput = false;
}
