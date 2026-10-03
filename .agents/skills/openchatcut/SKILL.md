---
name: openchatcut
description: "OpenChatCut video editor integration and MCP tool orchestration. Use this skill when managing video timelines, importing media, editing speech/captions, rendering motion graphics, previewing frames, and exporting videos via the local OpenChatCut daemon."
---

# OpenChatCut Integration Guide

OpenChatCut is a local AI-native video editor and timeline engine running on this machine.

## Endpoints and Paths

- **Web Editor**: [http://127.0.0.1:3100/projects](http://127.0.0.1:3100/projects)
- **Local Daemon API**: `http://127.0.0.1:3210/api/v1` (health check: `http://127.0.0.1:3210/health`)
- **State & Data Directory**: `C:\Users\azrie\.codex\Ulpana2\tools\openchatcut-local\state`
- **Authorized Media Root**: `C:\Users\azrie\.codex\Ulpana2\tools\openchatcut-local\media`
- **Launcher**: `C:\Users\azrie\.codex\Ulpana2\tools\openchatcut-local\launch.mjs`

## MCP Server Configuration

Configured in `~/.gemini/config/mcp_config.json`:

```json
"openchatcut": {
  "command": "C:\\Users\\azrie\\scoop\\apps\\nodejs-lts\\24.19.0\\node.exe",
  "args": [
    "C:\\Users\\azrie\\.codex\\Ulpana2\\tools\\openchatcut-local\\launch.mjs",
    "--stdio"
  ]
}
```

Tool schemas are indexed at: `C:\Users\azrie\.gemini\antigravity\mcp\openchatcut\`

## Available MCP Tools (25)

1. **`get_status`**: Check daemon health, instance ID, and capabilities.
2. **`list_projects`**: Enumerate all projects with metadata and revisions.
3. **`create_project`**: Create a new project with dimensions, frame rate, and title.
4. **`read_project`**: Retrieve complete timeline, tracks, assets, and revision ID.
5. **`get_editor_url`**: Get the web editor URL for a project or scene.
6. **`import_local_media`**: Import video/audio/images from authorized roots.
7. **`import_remote_media`**: Download and ingest external media URLs.
8. **`import_project_package`**: Ingest zipped project bundles.
9. **`inspect_media`**: Probe media metadata, codecs, streams, and durations.
10. **`search_broll`**: Search available b-roll clips.
11. **`process_audio`**: Apply audio filters, leveling, or noise reduction.
12. **`validate_timeline_edit`**: Pre-validate timeline modifications before applying.
13. **`apply_timeline_edit`**: Execute revisions (cut, split, move, trim, ripple).
14. **`change_history`**: Query undo/redo history and revision tree.
15. **`start_transcription`**: Initiate speech-to-text transcript jobs.
16. **`read_script`**: Read text script / dialog representation.
17. **`apply_script_edit`**: Edit video timeline via text script modifications.
18. **`edit_captions`**: Style, align, and refine subtitle layers.
19. **`list_generators`**: List available generative AI backends and assets.
20. **`generate_asset`**: Trigger AI asset generation tasks.
21. **`create_motion_graphic`**: Generate JSX/DSL-based motion graphics elements.
22. **`render_preview_frames`**: Render high-fidelity preview frames at specific timestamps.
23. **`validate_project`**: Complete project integrity, missing asset, and timeline validation.
24. **`start_export`**: Export timeline to MP4 via hardware/FFmpeg pipeline.
25. **`track_jobs`**: Poll background render/transcode/export jobs.
