tell application "Terminal"
	activate
	do script "cd \"" & (POSIX path of (path to me as text)) & "/..\" && ./start.sh"
end tell 