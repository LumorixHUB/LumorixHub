// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[tauri::command]
fn validate_game_executable(path: String) -> Result<String, String> {
    use std::path::Path;

    let file_path = Path::new(&path);

    if !file_path.is_absolute() {
        return Err("Oyun dosyası için tam bir dosya yolu gerekli.".to_string());
    }

    if !file_path.is_file() {
        return Err("Seçilen dosya bulunamadı.".to_string());
    }

    let is_exe = file_path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.eq_ignore_ascii_case("exe"))
        .unwrap_or(false);

    if !is_exe {
        return Err("Lütfen bir Windows .exe dosyası seç.".to_string());
    }

    Ok("Dosya mevcut ve .exe uzantılı.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, validate_game_executable])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
