# 配置区 ==================================
$SERVER = "scratch-cw.top"           # 服务器地址
$SSH_USER = "yp"                      # SSH用户名
$SSH_KEY = (Resolve-Path "~\.ssh\win_server_key").Path  # 私钥绝对路径
$LOCAL_BUILD_DIR = ".\build"          # 本地构建目录
$REMOTE_DIR = "C:\inetpub\wwwroot\scratch\main\static"  # 远程目标目录
$TEMP_DIR = "$env:TEMP\deploy_temp"   # 临时目录
# ========================================

# 函数：使用原生SSH执行命令
function Invoke-SSHCommand {
    param (
        [string]$Command
    )
    
    # 使用原生SSH替代plink
    $sshCommand = "ssh -i `"$SSH_KEY`" ${SSH_USER}@${SERVER} `"$Command`""
    return Invoke-Expression $sshCommand 2>&1
}

# 函数：使用原生SCP传输
function Invoke-SCP {
    param (
        [string]$LocalPath,
        [string]$RemotePath,
        [string]$Direction = "Upload"  # "Upload" 或 "Download"
    )
    
    if ($Direction -eq "Upload") {
        $scpCommand = "scp -i `"$SSH_KEY`" `"$LocalPath`" ${SSH_USER}@${SERVER}:`"$RemotePath`""
    }
    else {
        $scpCommand = "scp -i `"$SSH_KEY`" ${SSH_USER}@${SERVER}:`"$LocalPath`" `"$RemotePath`""
    }
    
    return Invoke-Expression $scpCommand 2>&1
}

# 确保临时目录存在
if (-not (Test-Path $TEMP_DIR)) {
    New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null
}

# 1. 生产环境构建并校验
Write-Host "🚀 开始构建生产环境代码..." -ForegroundColor Cyan
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败：npm run build 执行出错" -ForegroundColor Red
    exit 1
}

# 2. 检查本地构建目录
if (-not (Test-Path $LOCAL_BUILD_DIR -PathType Container)) {
    Write-Host "❌ 本地构建目录不存在：$LOCAL_BUILD_DIR" -ForegroundColor Red
    exit 1
}

# 获取本地构建目录的绝对路径
$localBuildAbs = (Resolve-Path $LOCAL_BUILD_DIR).Path
Write-Host "✅ 构建目录验证通过：$localBuildAbs" -ForegroundColor Green

# 3. 验证SSH连接
Write-Host "🔗 验证SSH连接是否可用..." -ForegroundColor Cyan
try {
    $testOutput = Invoke-SSHCommand -Command "echo SSH_CONNECTED"
    if ($testOutput -match "SSH_CONNECTED") {
        Write-Host "✅ SSH连接验证通过" -ForegroundColor Green
    }
    else {
        throw "SSH连接无响应，请检查私钥配置"
    }
}
catch {
    Write-Host "❌ SSH连接失败：$_" -ForegroundColor Red
    Write-Host "💡 请确认私钥是否正确，或尝试手动连接：ssh -i `"$SSH_KEY`" $SSH_USER@$SERVER" -ForegroundColor Yellow
    exit 1
}

# 4. 获取本地文件信息
Write-Host "📊 正在分析本地文件..." -ForegroundColor Gray
$localFiles = @{}

if (Test-Path $localBuildAbs) {
    Get-ChildItem -Path $localBuildAbs -Recurse -File | ForEach-Object {
        $relPath = $_.FullName.Substring($localBuildAbs.Length + 1)
        $localFiles[$relPath] = @{
            Hash = (Get-FileHash -Path $_.FullName -Algorithm SHA256).Hash
            Size = $_.Length
            LastModified = $_.LastWriteTimeUtc
        }
    }
}

$localCount = @($localFiles.Keys).Count
Write-Host "✅ 本地文件分析完成：共 $localCount 个文件" -ForegroundColor Green

# 5. 获取远程文件信息 - 完全重写的方法
Write-Host "📊 正在分析远程文件..." -ForegroundColor Gray
$remoteFiles = @{}

# 创建远程脚本文件
$remoteScript = @"
`$remoteDir = "$REMOTE_DIR"
if (-not (Test-Path `$remoteDir)) { 
    Write-Host "REMOTE_DIR_NOT_FOUND"
    exit 
}

`$remoteFullPath = (Resolve-Path `$remoteDir).Path
Get-ChildItem -Path `$remoteFullPath -Recurse -File | ForEach-Object {
    `$relPath = `$_.FullName.Substring(`$remoteFullPath.Length + 1)
    `$hash = (Get-FileHash -Path `$_.FullName -Algorithm SHA256).Hash
    `$size = `$_.Length
    `$lastModified = `$_.LastWriteTimeUtc.ToString('o')
    [System.Console]::Out.WriteLine("`$relPath|`$hash|`$size|`$lastModified")
}
"@

# 保存远程脚本到临时文件
$remoteScriptPath = Join-Path -Path $TEMP_DIR -ChildPath "remote_scan.ps1"
$remoteScript | Out-File -FilePath $remoteScriptPath -Encoding UTF8

# 上传脚本到服务器
$remoteTempPath = "C:\Windows\Temp\remote_scan.ps1"
Invoke-SCP -LocalPath $remoteScriptPath -RemotePath $remoteTempPath -Direction "Upload" | Out-Null

# 执行远程脚本
$remoteFilesOutput = Invoke-SSHCommand -Command "powershell -ExecutionPolicy Bypass -File `"$remoteTempPath`""

# 解析远程文件信息
if ($remoteFilesOutput -match "REMOTE_DIR_NOT_FOUND") {
    Write-Host "⚠️ 远程目录不存在：$REMOTE_DIR" -ForegroundColor Yellow
    Write-Host "  将自动创建远程目录..." -ForegroundColor Yellow
    Invoke-SSHCommand -Command "New-Item -ItemType Directory -Path `"$REMOTE_DIR`" -Force" | Out-Null
}
elseif ($remoteFilesOutput) {
    $remoteFilesOutput -split "`n" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("Warning:") -and -not $line.StartsWith("Permanently added")) {
            $parts = $line -split "\|", 4
            if ($parts.Count -eq 4) {
                $relPath = $parts[0].Trim()
                $remoteFiles[$relPath] = @{
                    Hash = $parts[1].Trim()
                    Size = [long]$parts[2]
                    LastModified = [datetime]::Parse($parts[3])
                }
            }
        }
    }
}

$remoteCount = @($remoteFiles.Keys).Count
Write-Host "✅ 远程文件分析完成：共 $remoteCount 个文件" -ForegroundColor Green

# 6. 计算差异（新增、删除、修改的文件）
$filesToAdd = @()      # 本地新增的文件
$filesToUpdate = @()   # 本地修改的文件
$filesToDelete = @()   # 本地删除的文件

foreach ($relPath in $localFiles.Keys) {
    if (-not $remoteFiles.ContainsKey($relPath)) {
        # 本地新增的文件
        $filesToAdd += $relPath
    }
    elseif ($localFiles[$relPath].Hash -ne $remoteFiles[$relPath].Hash) {
        # 内容修改的文件（基于哈希比较）
        $filesToUpdate += $relPath
    }
}

foreach ($relPath in $remoteFiles.Keys) {
    if (-not $localFiles.ContainsKey($relPath)) {
        # 本地已删除的文件
        $filesToDelete += $relPath
    }
}

# 7. 执行同步操作
$totalChanges = $filesToAdd.Count + $filesToUpdate.Count + $filesToDelete.Count
if ($totalChanges -eq 0) {
    Write-Host "🔄 本地与远程文件完全一致，无需同步" -ForegroundColor Blue
    exit 0
}

Write-Host "🚧 开始同步文件，共计 $totalChanges 处变更..." -ForegroundColor Yellow

# 7.1 上传新增文件
foreach ($relPath in $filesToAdd) {
    $localFilePath = Join-Path -Path $localBuildAbs -ChildPath $relPath
    $remoteFilePath = Join-Path -Path $REMOTE_DIR -ChildPath $relPath
    
    # 确保远程目录存在
    $remoteDir = [System.IO.Path]::GetDirectoryName($remoteFilePath)
    Invoke-SSHCommand -Command "if (-not (Test-Path '$remoteDir')) { New-Item -ItemType Directory -Path '$remoteDir' -Force | Out-Null }" | Out-Null
    
    # 上传文件
    $scpOutput = Invoke-SCP -LocalPath $localFilePath -RemotePath $remoteFilePath -Direction "Upload"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "➕ 新增文件：$relPath" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ 新增失败：$relPath" -ForegroundColor Yellow
        Write-Host "   错误详情：$scpOutput" -ForegroundColor DarkGray
    }
}

# 7.2 更新修改的文件
foreach ($relPath in $filesToUpdate) {
    $localFilePath = Join-Path -Path $localBuildAbs -ChildPath $relPath
    $remoteFilePath = Join-Path -Path $REMOTE_DIR -ChildPath $relPath
    
    # 上传更新
    $scpOutput = Invoke-SCP -LocalPath $localFilePath -RemotePath $remoteFilePath -Direction "Upload"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "♻️ 更新文件：$relPath" -ForegroundColor Cyan
    }
    else {
        Write-Host "⚠️ 更新失败：$relPath" -ForegroundColor Yellow
        Write-Host "   错误详情：$scpOutput" -ForegroundColor DarkGray
    }
}

# 7.3 删除远程多余的文件（可选）
if ($filesToDelete.Count -gt 0) {
    Write-Host "❓ 检测到 $(@($filesToDelete).Count) 个本地已删除的文件，是否同步删除远程文件？" -ForegroundColor Yellow
    $answer = Read-Host "输入 Y 确认删除，其他键跳过 (Y/N)"
    if ($answer -eq "Y") {
        foreach ($relPath in $filesToDelete) {
            $remoteFilePath = Join-Path -Path $REMOTE_DIR -ChildPath $relPath
            Invoke-SSHCommand -Command "Remove-Item -Path '$remoteFilePath' -Force" | Out-Null
            Write-Host "➖ 删除文件：$relPath" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⏭️ 跳过远程文件删除操作" -ForegroundColor Blue
    }
}

# 8. 清理临时文件
Remove-Item -Path $remoteScriptPath -Force -ErrorAction SilentlyContinue
Invoke-SSHCommand -Command "Remove-Item -Path `"$remoteTempPath`" -Force" | Out-Null

# 9. 结果报告
$summary = @"
✅ 同步完成!

📊 统计:
  新增文件: $($filesToAdd.Count)
  更新文件: $($filesToUpdate.Count)
  删除文件: $($filesToDelete.Count)

🔗 服务器: $SERVER
📂 远程目录: $REMOTE_DIR
"@
Write-Host $summary -ForegroundColor Green