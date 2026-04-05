use tauri::{
    Manager,
    LogicalPosition,
    LogicalSize,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
const NOTIF_WIDTH: f64 = 360.0;
const NOTIF_DEFAULT_HEIGHT: f64 = 140.0;
const NOTIF_BOTTOM_MARGIN: f64 = 12.0;
const NOTIF_RIGHT_MARGIN: f64 = 16.0;

#[tauri::command]
async fn resize_notification(app: tauri::AppHandle, height: f64) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("notification") {
        let h = height.min(420.0).max(100.0);
        win.set_size(LogicalSize::new(NOTIF_WIDTH, h))
            .map_err(|e: tauri::Error| e.to_string())?;
        if let Ok(Some(monitor)) = win.current_monitor() {
            let size = monitor.size();
            let position = monitor.position();
            let scale = monitor.scale_factor();
            let logical_w = size.width as f64 / scale;
            let logical_h = size.height as f64 / scale;
            let logical_x = position.x as f64 / scale;
            let logical_y = position.y as f64 / scale;
            let x = logical_x + logical_w - NOTIF_WIDTH - NOTIF_RIGHT_MARGIN;
            let y = logical_y + logical_h - h - NOTIF_BOTTOM_MARGIN;
            let _ = win.set_position(LogicalPosition::new(x, y));
        }
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
async fn show_notification(app: tauri::AppHandle, body: String) -> Result<(), String> {
    let win = app
        .get_webview_window("notification")
        .ok_or_else(|| "notification window not found".to_string())?;

    // Pre-resize to default before positioning to prevent coordinate drift
    win.set_size(LogicalSize::new(NOTIF_WIDTH, NOTIF_DEFAULT_HEIGHT))
        .map_err(|e| e.to_string())?;

    // Position bottom-right, relative to a fixed margin
    if let Ok(Some(monitor)) = win.current_monitor() {
        let size = monitor.size();
        let position = monitor.position();
        let scale = monitor.scale_factor();
        let logical_w = size.width as f64 / scale;
        let logical_h = size.height as f64 / scale;
        let logical_x = position.x as f64 / scale;
        let logical_y = position.y as f64 / scale;
        let x = logical_x + logical_w - NOTIF_WIDTH - NOTIF_RIGHT_MARGIN;
        let y = logical_y + logical_h - NOTIF_DEFAULT_HEIGHT - NOTIF_BOTTOM_MARGIN;
        let _ = win.set_position(LogicalPosition::new(x, y));
    }

    // Push data directly via eval — reliable for hidden windows (no event system needed).
    // If __showNotification isn't registered yet, stash in __pendingNotif for the page to pick up.
    let title_json = serde_json::to_string("أذكار").map_err(|e| e.to_string())?;
    let body_json = serde_json::to_string(&body).map_err(|e| e.to_string())?;
    win.eval(&format!(
        "(function(){{var p={{title:{t},body:{b}}};if(window.__showNotification)window.__showNotification(p.title,p.body);else window.__pendingNotif=p;}})()",
        t = title_json,
        b = body_json,
    ))
    .map_err(|e: tauri::Error| e.to_string())?;

    win.show().map_err(|e: tauri::Error| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    std::env::set_var("GDK_BACKEND", "x11");

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![show_notification, hide_notification, resize_notification])
        .setup(|app| {
            // Pre-create the notification window hidden so it loads in the background.
            // Dev uses the Next.js dev server; production uses the static export.
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
                .build()?;

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
            window.open_devtools();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Azkar application");
}
