#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Compile the AppleScript into an application
osacompile -o "$DIR/Empiricist.app" "$DIR/Empiricist.applescript" --app

# Make the application executable
chmod +x "$DIR/Empiricist.app/Contents/MacOS/applet"

echo "Shortcut created successfully! You can now double-click Empiricist.app to start the program." 