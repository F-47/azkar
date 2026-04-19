use std::sync::Mutex;
use tauri::{
    Manager,
    LogicalSize,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_positioner::{WindowExt, Position};

const NOTIF_WIDTH: f64 = 360.0;
const NOTIF_DEFAULT_HEIGHT: f64 = 140.0;
const NOTIF_BOTTOM_MARGIN: f64 = 12.0;
const NOTIF_RIGHT_MARGIN: f64 = 16.0;

// ---------------------------------------------------------------------------
// Scheduler state — lives on the Rust side so it keeps running even when the
// webview is hidden (Linux/WebKitGTK pauses JS in hidden windows).
// ---------------------------------------------------------------------------

struct SchedulerState {
    handle: Option<tauri::async_runtime::JoinHandle<()>>,
}

impl Default for SchedulerState {
    fn default() -> Self {
        Self { handle: None }
    }
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct SchedulerSettings {
    enabled: bool,
    interval_minutes: u32,
    texts: Vec<String>,
    titles: Vec<String>,
}

// ---------------------------------------------------------------------------
// Notification display logic (shared between the command and the scheduler)
// ---------------------------------------------------------------------------

async fn trigger_notification(app: &tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    if app.get_webview_window("notification").is_none() {
        #[cfg(debug_assertions)]
        let notif_url = tauri::WebviewUrl::External(
            "http://localhost:3000/notification".parse().unwrap(),
        );
        #[cfg(not(debug_assertions))]
        let notif_url = tauri::WebviewUrl::App("notification/index.html".into());

        tauri::WebviewWindowBuilder::new(app, "notification", notif_url)
            .title("")
            .inner_size(NOTIF_WIDTH, NOTIF_DEFAULT_HEIGHT)
            .visible(false)
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .resizable(false)
            .skip_taskbar(true)
            .focused(false)
            .shadow(false)
            .build()
            .map_err(|e| e.to_string())?;

        // Give the webview time to load before calling eval on it.
        tokio::time::sleep(std::time::Duration::from_millis(1500)).await;
    }

    let win = app
        .get_webview_window("notification")
        .ok_or_else(|| "notification window not found".to_string())?;

    // Pre-resize to default before positioning to prevent coordinate drift
    win.set_size(LogicalSize::new(NOTIF_WIDTH, NOTIF_DEFAULT_HEIGHT))
        .map_err(|e| e.to_string())?;

    // Position bottom-right safely (accounts for taskbar using positioner plugin)
    let _ = win.move_window(Position::BottomRight);
    if let Ok(pos) = win.outer_position() {
        if let Ok(scale) = win.scale_factor() {
            let mut logical_pos = pos.to_logical::<f64>(scale);
            logical_pos.x -= NOTIF_RIGHT_MARGIN;
            logical_pos.y -= NOTIF_BOTTOM_MARGIN;
            let _ = win.set_position(logical_pos);
        }
    }

    // Push data directly via eval — reliable for hidden windows (no event system needed).
    // If __showNotification isn't registered yet, stash in __pendingNotif for the page to pick up.
    let title_json = serde_json::to_string(&title).map_err(|e| e.to_string())?;
    let body_json = serde_json::to_string(&body).map_err(|e| e.to_string())?;
    win.eval(&format!(
        "(function(){{var p={{title:{t},body:{b}}};if(window.__showNotification)window.__showNotification(p.title,p.body);else window.__pendingNotif=p;}})()",
        t = title_json,
        b = body_json,
    ))
    .map_err(|e: tauri::Error| e.to_string())?;

    Ok(())
}

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

#[tauri::command]
async fn resize_notification(app: tauri::AppHandle, height: f64) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("notification") {
        let h = height.min(420.0).max(100.0);
        
        if let Ok(Some(monitor)) = win.current_monitor() {
            if let Ok(scale) = win.scale_factor() {
                // Completely bypass unreliable positioner plugins.
                // We fetch the raw mathematical dimensions of the monitor,
                // and compute the bottom-right corner absolutely.
                let monitor_size = monitor.size().to_logical::<f64>(scale);
                let monitor_pos = monitor.position().to_logical::<f64>(scale);

                // 60px accounts for large Windows taskbars, ensuring it ALWAYS sits above it visually.
                // If they have no taskbar, a 60px bottom margin still looks completely natural and beautiful.
                let anchor_margin_y = 60.0;
                let anchor_margin_x = 24.0;

                let final_x = monitor_pos.x + monitor_size.width - NOTIF_WIDTH - anchor_margin_x;
                let final_y = monitor_pos.y + monitor_size.height - h - anchor_margin_y;

                let _ = win.set_position(tauri::LogicalPosition::new(final_x, final_y));
            }
        }
        
        let _ = win.set_size(LogicalSize::new(NOTIF_WIDTH, h));
        let _ = win.show();
    }
    Ok(())
}

#[tauri::command]
async fn hide_notification(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("notification") {
        win.hide().map_err(|e: tauri::Error| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn show_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    trigger_notification(&app, title, body).await
}

#[tauri::command]
async fn configure_scheduler(
    app: tauri::AppHandle,
    state: tauri::State<'_, Mutex<SchedulerState>>,
    settings: SchedulerSettings,
) -> Result<(), String> {
    {
        let mut scheduler = state.lock().map_err(|e| e.to_string())?;

        // Abort the previous background task if any
        if let Some(handle) = scheduler.handle.take() {
            handle.abort();
        }
    }

    if !settings.enabled || settings.texts.is_empty() {
        return Ok(());
    }

    let interval = std::time::Duration::from_secs(settings.interval_minutes as u64 * 60);
    let texts = settings.texts;
    let titles = settings.titles;
    let app_handle = app.clone();


    // Relock to set the new handle
    {
        let mut scheduler = state.lock().map_err(|e| e.to_string())?;
        scheduler.handle = Some(tauri::async_runtime::spawn(async move {
            let mut pointer = 0usize;

            loop {
                tokio::time::sleep(interval).await;

                let index = pointer % texts.len();
                let body = texts[index].clone();
                let title = if !titles.is_empty() {
                    titles[index % titles.len()].clone()
                } else {
                    "أذكار".to_string()
                };
                let _ = trigger_notification(&app_handle, title, body).await;

                pointer += 1;
                if pointer >= texts.len() {
                    pointer = 0;
                }
            }
        }));
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// App entry point
// ---------------------------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    std::env::set_var("GDK_BACKEND", "x11");

    tauri::Builder::default()
        .manage(Mutex::new(SchedulerState::default()))
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, Some(vec!["--hidden"])))
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![
            show_notification,
            hide_notification,
            resize_notification,
            configure_scheduler
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            // Hide to tray instead of closing
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window_clone.hide();
                }
            });

            // Tray context menu
            let show_item = MenuItem::with_id(app, "show", "Open", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("أذكار")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                    }
                })
                .build(app)?;

            #[cfg(debug_assertions)]
            let _ = window.set_title("Azkar App (DEBUG)");

            let args: Vec<String> = std::env::args().collect();
            if !args.contains(&"--hidden".to_string()) {
                let _ = window.show();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Azkar application");
}
