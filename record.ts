    let getinputstatePtrSdl = Module.getBaseAddress("xenia.exe").add(0x1DDE50);
var stateptr : NativePointer;
var keepState = false;
var callcount = 0;
var isRecord = false;
var inputdata = {};
var inp_index = 0;
function nonzero(el : any)
{
    return el != 0
};
send("ready");
let recordPlayBack = recv(function(msg){

    if(msg["type"] == "playback"){
        isRecord = false;
        inputdata = msg.data;
    } else{
        isRecord = true;
    }
});
recordPlayBack.wait();
if(isRecord) {
    Interceptor.attach(getinputstatePtrSdl, {
        onEnter: function (args) {

            //@ts-ignore
            if (this.context.rdx.toInt32() == 0) {

                keepState = true;
                //@ts-ignore
                stateptr = this.context.r8;
                callcount += 1
            } else if (callcount < 1200000) {
                keepState = false;
            } else {
                send("stop");
                console.log("recording done due to limit");
                Interceptor.detachAll();
            }
        },
        onLeave: function () {
            if (keepState) {

                var inpstate = stateptr.add(4).readByteArray(12);
                //@ts-ignore
                let test : number = stateptr.add(5).readU8();
                if((test & 0x80) != 0){
                    send("stop");
                    console.log("recording done");
                    Interceptor.detachAll();
                    return;
                }
                    send("state", inpstate);

            }
        }
    });
} else {
    console.log("Playing back");
    var limit = Object.keys(inputdata).length;

    Interceptor.attach(getinputstatePtrSdl,{
        onEnter: function(){
            if(callcount >= limit) {
                Interceptor.detachAll();
                console.log("Playback Done");
                send("stop");
                return;
            }
            //@ts-ignore
            if(this.context.rdx.toInt32() == 0){
                keepState = true;
                //@ts-ignore
                stateptr = this.context.r8;
            }


            else{
                keepState = false;
            }
        }, onLeave: function(){
            if(keepState) {
                // @ts-ignore
                stateptr.add(4).writeByteArray(inputdata[callcount]);
                // @ts-ignore
                if(inputdata[callcount][1] & 0x80 == 0x80){
                    // @ts-ignore
                    console.log(inputdata[callcount]);
                }

                callcount++;
            }
        }
    })
}