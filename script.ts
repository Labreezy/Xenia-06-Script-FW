let xeniabase = Module.getBaseAddress("xenia.exe");
let getinputstatePtr = xeniabase.add(0x2C7DDC);
var callcount = -1;
var inputdata = {};
send("ready");
let inp_recv = recv("inputs",function(msg){
    console.log("WAITING PLEASE")
    inputdata = msg.data;
});
inp_recv.wait();
console.log("Done Waiting");
var inp_index = 0;
// @ts-ignore
console.log(JSON.stringify(inputdata));
// @ts-ignore
let keys = Object.keys(inputdata);
var current_frame = 0;
 // @ts-ignore
let current_inputs = inputdata[current_frame].inputs;
// @ts-ignore
let current_fc : number = inputdata[current_frame].frame;
Interceptor.attach(getinputstatePtr, {onEnter: function(args) {


        // @ts-ignore
        if (this.context.rdx.toInt32() == 0) {

            // @ts-ignore
            let stateptr = this.context.r15.add(4);
            // @ts-ignore
            if (callcount > current_fc) {
                // @ts-ignore
                inp_index += 1


                if (inp_index >= Object.keys(inputdata).length) {
                    console.log("Done")
                    Interceptor.detachAll();
                    return;
                } else {
                    // @ts-ignore
                    current_inputs = inputdata[keys[inp_index]].inputs;
                    // @ts-ignore
                    current_fc = inputdata[keys[inp_index]].frame;
                    console.log("Current next frame " + current_fc);
                }
            }
                // @ts-ignore
                stateptr.writeU16(current_inputs.buttons);
                // @ts-ignore
                stateptr.add(4).writeU16(current_inputs.LX);

                // @ts-ignore
                stateptr.add(6).writeU16(current_inputs.LY);



            callcount++;
        }
    }
})