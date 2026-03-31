#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;
use std::process::Command;
use std::thread;
use std::time::Duration;

fn main() {
    env_logger::init();
    
    let php_child = start_php_server();
    
    tauri::Builder::default()
        .setup(|_app| {
            info!("Aplicação iniciada com sucesso!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Erro ao executar aplicação Tauri");
    
    if let Some(mut child) = php_child {
        let _ = child.kill();
    }
}

#[cfg(not(target_os = "android"))]
fn start_php_server() -> Option<std::process::Child> {
    let app_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| std::path::PathBuf::from("."));

    let php_dir = app_dir.clone();
    
    if !std::path::Path::new(&php_dir).join("api.php").exists() {
        return None;
    }

    let port = 8080;
    
    let child = Command::new("php")
        .args(&["-S", &format!("127.0.0.1:{}", port), "-t", &php_dir.to_string_lossy()])
        .spawn();

    match child {
        Ok(c) => {
            info!("PHP server started on port {}", port);
            thread::sleep(Duration::from_secs(1));
            Some(c)
        }
        Err(e) => {
            info!("Failed to start PHP server: {}", e);
            None
        }
    }
}

#[cfg(target_os = "android")]
fn start_php_server() -> Option<std::process::Child> {
    None
}
