# Reimporta as fotos oficiais de 2026. Execute com PowerShell 7 na raiz do projeto.
param([string]$ProjectRoot=(Join-Path $PSScriptRoot '..'),[string]$CacheDirectory=(Join-Path ([IO.Path]::GetTempPath()) 'nabocadopovo-fotos-2026'))
$ErrorActionPreference='Stop'
$project=(Resolve-Path -LiteralPath $ProjectRoot).Path
$output=Join-Path $project 'public/candidates/2026'
New-Item -ItemType Directory -Path $output,$CacheDirectory -Force|Out-Null
$catalog=Invoke-RestMethod 'https://dadosabertos.tse.jus.br/api/3/action/package_show?id=candidatos-2026'
$resources=@($catalog.result.resources|Where-Object {$_.name -match '^[A-Z]{2} - Fotos de candidatos$'}|Select-Object name,url)
if($resources.Count -ne 28){throw 'O catálogo não contém todos os 28 conjuntos esperados. Confira a fonte antes de importar.'}
Add-Type -AssemblyName System.IO.Compression.FileSystem
foreach($resource in $resources){
 if($resource.url -notmatch '^https://cdn\.tse\.jus\.br/'){throw 'Fonte de fotos não reconhecida.'}
 $uf=$resource.name.Substring(0,2)
 $archive=Join-Path $CacheDirectory ($uf+'.zip')
 Invoke-WebRequest $resource.url -OutFile $archive -TimeoutSec 120
 $zip=[IO.Compression.ZipFile]::OpenRead($archive)
 try{foreach($entry in $zip.Entries){if($entry.FullName -match '^F[A-Z]{2}(\d{11,12})_div\.jpg$'){
  $target=Join-Path $output ($Matches[1]+'.jpg')
  $inputStream=$entry.Open();$outputStream=[IO.File]::Create($target)
  try{$inputStream.CopyTo($outputStream)}finally{$inputStream.Dispose();$outputStream.Dispose()}
 }}}finally{$zip.Dispose()}
 Write-Host ('Importado: '+$uf)
}
$ids=@(Get-ChildItem -LiteralPath $output -Filter '*.jpg'|ForEach-Object {$_.BaseName}|Sort-Object)
ConvertTo-Json -InputObject $ids -Compress|Set-Content (Join-Path $project 'lib/candidate-photo-ids.json') -Encoding utf8
ConvertTo-Json -InputObject $resources|Set-Content (Join-Path $project 'lib/candidate-photo-sources.json') -Encoding utf8
Write-Host ($ids.Count.ToString()+' fotos disponíveis. Confira os builds antes de publicar.')
