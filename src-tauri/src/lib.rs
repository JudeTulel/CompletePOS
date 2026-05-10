use tauri_plugin_shell::ShellExt;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let app_handle = app.handle();

      // Resolve the resource directory so the sidecar can find schema.sql
      let resource_dir = app_handle
        .path()
        .resource_dir()
        .unwrap_or_default();

      let sidecar_command = app_handle
        .shell()
        .sidecar("backend-server")
        .unwrap()
        .env("TAURI_RESOURCE_DIR", resource_dir.to_str().unwrap_or(""));

      let (mut _rx, _child) = sidecar_command.spawn().unwrap();

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
