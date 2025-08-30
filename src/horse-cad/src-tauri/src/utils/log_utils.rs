pub fn prettify_byte_count(number_of_bytes: u64) -> String {
    let units = ["B", "KB", "MB", "GB"];
    let mut size = number_of_bytes as f64;
    let mut unit = 0;

    while size >= 1024.0 && unit < units.len() - 1 {
        size /= 1024.0;
        unit += 1;
    }

    format!("{:.2} {}", size, units[unit])
}