$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8000/")
$listener.Start()

Write-Host "Serveur démarré sur http://localhost:8000"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $url = $request.Url.LocalPath
    $filePath = Join-Path "c:\Users\DELL\Documents\Digital HUB OS" ($url -replace '^/', '')
    
    if ($url -eq '/') {
        $filePath = "c:\Users\DELL\Documents\Digital HUB OS\index.html"
    }
    
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $response.StatusCode = 200
        $response.ContentType = "text/html"
        
        if ($filePath -match '\.js$') {
            $response.ContentType = "application/javascript"
        } elseif ($filePath -match '\.css$') {
            $response.ContentType = "text/css"
        }
        
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
    }
    
    $response.Close()
}
