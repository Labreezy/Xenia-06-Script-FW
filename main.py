import sys
import math
import re
import frida
from inpututils import *
from binascii import hexlify
command_re = re.compile(r"(ON|OFF|RAW){([A-Z_,]+)}")
stick_re = re.compile(r"(L|R)STICK{([\d]+),([\d]+)}")
MAX_MAGNITUDE = 100
recorded_states = b''
playback = True
def on_message(msg,data):
    global recorded_states
    print(msg)
    if msg['type'] == "send" and msg['payload'] == "ready":
        if playback:
            script.post(SCR_MESSAGE)
        else:
            script.post("record")
    if data is not None:
        recorded_states += data

    if msg.get('payload') == "stop":
        if not playback:
            open("rec2.bin",'wb').write(recorded_states)
        sys.exit(0)


OFFSET = -32767
def parse_betterscript(fn):
    bs_lines = open(fn).readlines()
    start_reached = False
    states = []
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
            current_duration = 1
        else:
            current_duration = int(line_args[0])
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
        for stype, xstr, ystr in stick_comms:
            x = int(xstr)
            y = int(ystr)
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

        for _ in range(current_duration):
            states.append(list(current_state.to_bytes()))
        current_state = XInputGamepadStruct()
    return states

def inputs_from_taseditor_script(fn):
    scr_lines = open(fn).readlines()
    states = []
    c_state = XInputGamepadStruct()
    for l in scr_lines:
        lineargs = l.split(" ")
        if len(lineargs) == 4:
            frame, btns, ls, rs = lineargs
        else:
            return states
        if btns != "NONE":
            for btn in btns.split(";"):
                if "ZL" in btn:
                    c_state.LT = 255
                elif "ZR" in btn:
                    c_state.RT = 255
                elif "PLUS" in btn:
                    c_state.buttons |= BTNS["KEY_START"]
                elif "MINUS" in btn or "STICK" in btn:
                    continue
                else:
                    c_state.buttons |= BTNS[btn]
        split_l = ls.split(";")
        c_state.LX = int(split_l[0])
        c_state.LY = int(split_l[1])
        split_r = rs.split(";")
        c_state.RX = int(split_r[0])
        c_state.RY = int(split_r[1])
        states.append(list(c_state.to_bytes()))
        c_state = XInputGamepadStruct()
    return states


def inputs_from_recording(fn):
    scriptsz = GAMEPAD_STRUCT_SZ
    with open(fn, "rb") as inputf:
        inputf.seek(0,2)
        fsize = inputf.tell()
        inputf.seek(0)
        if fsize % GAMEPAD_STRUCT_SZ != 0:
            print(f"Uneven filesize {fsize}")
            sys.exit(1)
        parsed_inputs = []
        while inputf.tell() < fsize:
            in_bytes = inputf.read(scriptsz)
            parsed_inputs.append(list(in_bytes))
    return parsed_inputs







if __name__ == "__main__":

    if playback:
        input_fn = "test1.txt"
        inputs = inputs_from_taseditor_script(input_fn)




    sys_session = frida.attach(0)
    script_text = open("_script.js").read()
    bytecode = sys_session.compile_script(name="tas-script", source=script_text)

    session = frida.attach("xenia.exe")
    script = session.create_script_from_bytes(bytecode)
    script.on("message", on_message)
    if playback:
        SCR_MESSAGE = {"type": "playback", "data": inputs}

    script.load()

    print("Loaded")

    sys.stdin.read()