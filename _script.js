(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
let getinputstatePtrSdl = Module.getBaseAddress("xenia_canary.exe").add(0xAFBA60); //xe::hid::InputSystem::GetState
var stateptr;
var keepState = false;
var callcount = 0;
var isRecord = false;
var inputdata = {};
var inp_index = 0;
function nonzero(el) {
    return el != 0;
}
;
send("ready");
let recordPlayBack = recv(function (msg) {
    if (msg["type"] == "playback") {
        isRecord = false;
        inputdata = msg.data;
    }
    else {
        isRecord = true;
    }
});
recordPlayBack.wait();
if (isRecord) {
    var dumped = false;
    Interceptor.attach(getinputstatePtrSdl, {
        onEnter: function (args) {
            //@ts-ignore
            var user_index = args[1].toInt32();
            if (user_index == 0) {
                keepState = true;
                //@ts-ignore
                stateptr = args[2];
                callcount += 1;
            }
            else if (callcount < 1200000) {
                keepState = false;
            }
            else {
                send("stop");
                console.log("recording done due to limit");
                Interceptor.detachAll();
            }
        },
        onLeave: function () {
            if (keepState) {
                var inpstate = stateptr.add(4).readByteArray(12);
                //@ts-ignore
                let test = stateptr.add(5).readU8();
                if ((test & 0x80) != 0) {
                    send("stop");
                    console.log("recording done");
                    Interceptor.detachAll();
                    return;
                }
                send("state", inpstate);
            }
        }
    });
}
else {
    console.log("Playing back");
    var limit = Object.keys(inputdata).length;
    console.log("Limit: " + limit);
    Interceptor.attach(getinputstatePtrSdl, {
        onEnter: function (args) {
            if (callcount >= limit) {
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
            else {
                keepState = false;
            }
        }, onLeave: function () {
            if (keepState) {
                // @ts-ignore
                stateptr.add(4).writeByteArray(inputdata[callcount]);
                // @ts-ignore
                if (inputdata[callcount][1] & 0x80 == 0x80) {
                    // @ts-ignore
                    console.log(inputdata[callcount]);
                }
                callcount++;
            }
        }
    });
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUEsSUFBSSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0NBQWdDO0FBQ25ILElBQUksUUFBd0IsQ0FBQztBQUM3QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDdEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztBQUNyQixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFNBQVMsT0FBTyxDQUFDLEVBQVE7SUFFckIsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ2xCLENBQUM7QUFBQSxDQUFDO0FBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2QsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVMsR0FBRztJQUVsQyxJQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxVQUFVLEVBQUM7UUFDekIsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztLQUN4QjtTQUFLO1FBQ0YsUUFBUSxHQUFHLElBQUksQ0FBQztLQUNuQjtBQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3RCLElBQUcsUUFBUSxFQUFFO0lBQ2IsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ2YsV0FBVyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRTtRQUNwQyxPQUFPLEVBQUUsVUFBVSxJQUFJO1lBRW5CLFlBQVk7WUFDWCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FB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
