import sys
import math
import re
import frida
from inpututils import *

command_re = re.compile(r"(ON|OFF|RAW){([A-Z_,]+)}")
stick_re = re.compile(r"(L|R)STICK{([\d]+),([\d]+)}")
MAX_MAGNITUDE = 100

def on_message(msg,data):
    print(msg,data)
    if msg['type'] == "send" and msg['payload'] == "ready":
        script.post(SCR_MESSAGE)

OFFSET = -32767
def parse_betterscript(fn):
    bs_lines = open(fn).readlines()
    start_reached = False
    states = []
    current_frame = 2
    current_duration = 0
    current_state = XInputGamepadStruct()
    last_l = (0,0)
    last_r = (0,0)
    for l in bs_lines:
        line_args = l.split(" ")
        if len(line_args) == 0:
            continue
        if not start_reached and line_args[0] != "+":
            continue
        elif not start_reached:
            start_reached = True
        else:
            current_frame  += int(line_args[0])
        commands = command_re.findall(l)
        for comtype, klist in commands:
            if comtype == "ON":
                for key in klist.split(","):
                    current_state.buttons |= BTNS[key]
            elif comtype == "OFF":
                for key in klist.split(","):
                    current_state.buttons &= ~BTNS[key]
            elif comtype == "RAW":
                current_state.buttons = 0
                for key in klist.split(","):
                    current_state.buttons |= BTNS[key]
        stick_comms = stick_re.findall(" ".join(line_args[1:]))
        for stype, magstr, anglestr in stick_comms:
            power = int(magstr)
            if power > 100:
                power = 100
            angle = int(anglestr)

            #convert to cartesian
            rads = angle *  math.pi / 180
            x = int(power * math.cos(rads) / 100 * 32767)
            y = int(power * math.sin(rads) / 100 * 32767)

            if stype == "L":
                current_state.LX = x
                current_state.LY = y
                last_l = (x,y)
            else:
                current_state.RX = x
                current_state.RY = y
                last_r = (x,y)
        if len(stick_comms) == 0:
            current_state.LX, current_state.LY = last_l
            current_state.RX, current_state.RY = last_r

        states.append({"frame": current_frame,   "inputs":current_state.to_dict()})
        current_frame += current_duration
        current_state = XInputGamepadStruct()
    return states







if __name__ == "__main__":
    input_fn = "script1.tig"
    inputs = parse_betterscript(input_fn)



    sys_session = frida.attach(0)
    script_text = open("_script.js").read()
    bytecode = sys_session.compile_script(name="tas-script", source=script_text)

    session = frida.attach("xenia.exe")
    script = session.create_script_from_bytes(bytecode)
    script.on("message", on_message)
    SCR_MESSAGE = {"type": "inputs", "data": inputs}

    script.load()

    print("Loaded")

    sys.stdin.read()