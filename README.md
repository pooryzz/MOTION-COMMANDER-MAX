# MOTION COMMANDER — NEON FRONTIER

A browser-based top-down action game controlled by a normal webcam.

## Core idea

The player controls the commander with one hand. The camera feed and a real-time hand skeleton are visible beside the game. MediaPipe provides hand landmarks; the project defines its own application-level gesture rules.

## Controls

- **Hand position** — move the commander around the arena.
- **Fist** — pulse attack against the nearest enemy.
- **Open palm** — energy shield.
- **Index finger raised** — Nova special ability.
- **Unclear/partial hand** — Error Mode gives a concrete correction.

## Complete scenario

1. Initialize the camera.
2. Enter the arena.
3. Defeat at least 8 enemies.
4. Use hand position to reach the extraction portal.
5. Receive score, kill count, accuracy and combo results.

## Error Mode

The system distinguishes an unclear hand shape from a valid command. Instead of only showing "not recognized", it explains how to correct the gesture, e.g.:
- "For ATTACK close all fingers; for SHIELD open all fingers."
- "Show your hand clearly inside the camera frame."

## Technology

HTML, CSS, JavaScript ES Modules, Canvas 2D, MediaPipe Tasks Vision / Hand Landmarker, WebRTC getUserMedia.

## Run

Use VS Code + Live Server, or:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` and allow camera access.

## Hackathon note

The hand-tracking model/library is an allowed dependency. The game mechanics, gesture rules, feedback logic, scoring and interaction layer are application code.

For a competition with a strict start-time rule, preserve an honest Git history and disclose any boilerplate or pre-existing work as required by the event.


## Live Demo
https://motion-commander-max.vercel.app

## 📊 Presentation
[View Presentation PDF](./presentation/Презентация%20проекта%20MOTION%20COMMANDER.pdf)
