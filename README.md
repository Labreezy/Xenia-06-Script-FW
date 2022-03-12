# Xenia-06-Script-FW
An input scripting framework for Sonic '06 and other Xenia games

##Build instructions

You need pip (and optionally, npm if you'd like to contribute to the js/ts side of things)


Run
``pip install -r requirements.txt``
to install dependencies. 

Right now, for scripts, source needs to be edited to target different files + set record vs playback.

The scripts follow the nx-tas format for nintendo switch, fully compatible with jadefalke's TAS editor for Super Mario Odessey located here: https://github.com/Jadefalke2/TAS-Editor

If you're recording, recording starts when you run the script and ends when you press R3.  The files that result are .bin files that are convertable to nx-tas scripts.

Command-line support to come with first release. Stay tuned!
