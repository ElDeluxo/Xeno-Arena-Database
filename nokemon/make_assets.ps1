$output = "const ASSETS = {`n"
$items = Get-ChildItem -Path "icons", "classes" -File
foreach ($item in $items) {
    $folder = if ($item.DirectoryName -like "*\icons") { "icons" } else { "classes" }
    $path = "$folder/" + $item.Name
    $bytes = [System.IO.File]::ReadAllBytes($item.FullName)
    $b64 = [System.Convert]::ToBase64String($bytes)
    $ext = $item.Extension.Substring(1)
    $mime = "image/$ext"
    if ($ext -eq "avif") { $mime = "image/avif" }
    elseif ($ext -eq "webp") { $mime = "image/webp" }
    elseif ($ext -eq "png") { $mime = "image/png" }
    $output += "`"$path`": `"data:$mime;base64,$b64`",`n"
}
$output += "};"
[System.IO.File]::WriteAllText("$pwd\assets.js", $output, [System.Text.Encoding]::UTF8)
