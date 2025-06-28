# deploy.ps1 - Script para deploy da API NestJS no Windows

Write-Host "Iniciando deploy da API NestJS..." -ForegroundColor Green

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "ERRO: Arquivo .env nao encontrado!" -ForegroundColor Red
    Write-Host "Copiando .env.example para .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Arquivo .env criado. Configure suas variaveis e execute novamente." -ForegroundColor Green
    exit 1
}

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "ERRO: Docker nao esta rodando. Inicie o Docker Desktop e tente novamente." -ForegroundColor Red
    exit 1
}

# Parar containers existentes
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
docker-compose down

# Construir e iniciar os serviços
Write-Host "Construindo e iniciando os servicos..." -ForegroundColor Blue
docker-compose up --build -d

# Aguardar os serviços iniciarem
Write-Host "Aguardando servicos iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar status dos containers
Write-Host "Status dos containers:" -ForegroundColor Cyan
docker-compose ps

# Mostrar logs do ngrok para pegar a URL pública
Write-Host ""
Write-Host "Obtendo URL publica do ngrok..." -ForegroundColor Green
Start-Sleep -Seconds 5

# Tentar obter a URL do ngrok via API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $ngrokUrl = $response.tunnels | Where-Object { $_.public_url -like "https://*" } | Select-Object -First 1 -ExpandProperty public_url
    
    if ($ngrokUrl) {
        Write-Host "SUCCESS: Sua API esta disponivel em: $ngrokUrl" -ForegroundColor Green
        Write-Host "Dashboard do ngrok: http://localhost:4040" -ForegroundColor Cyan
    } else {
        Write-Host "AVISO: Nao foi possivel obter a URL automaticamente." -ForegroundColor Yellow
        Write-Host "Acesse http://localhost:4040 para ver a URL publica" -ForegroundColor Yellow
    }
} catch {
    Write-Host "AVISO: Nao foi possivel obter a URL automaticamente." -ForegroundColor Yellow
    Write-Host "Acesse http://localhost:4040 para ver a URL publica" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Cyan
Write-Host "  - Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  - Parar: docker-compose down" -ForegroundColor White
Write-Host "  - Reiniciar: docker-compose restart" -ForegroundColor White
Write-Host ""
Write-Host "Deploy concluido!" -ForegroundColor Green