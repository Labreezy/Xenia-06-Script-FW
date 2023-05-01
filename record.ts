let getinputstatePtrSdl = Module.getBaseAddress("xenia_canary.exe").add(0xAFBA60); //xe::hid::InputSystem::GetState
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
var dumped = false;
    Interceptor.attach(getinputstatePtrSdl, {
        onEnter: function (args) {

            //@ts-ignore
             var user_index = args[1].toInt32();
            if (user_index == 0) {

                keepState = true;

                //@ts-ignore
                stateptr = args[2];
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
    console.log("Limit: " + limit);
    Interceptor.attach(getinputstatePtrSdl,{
        onEnter: function(args){
            if(callcount >= limit) {
                Interceptor.detachAll();
                console.log("Playback Done");
                send("stop");
                return;
            }


            //@ts-ignore
            var user_index = args[1].toInt32();

            if (user_index == 0) {

                keepState = true;
                //@ts-ignore
                stateptr = args[2];
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