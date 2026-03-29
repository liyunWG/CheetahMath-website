$Root='E:\20260323_LiyunWG_Cheetah_website'
$OfficeDir=Join-Path $Root 'migration-data\latest\office-files'
$Workbooks=Join-Path $Root 'migration-data\latest\workbooks'
function Ensure($p){if(!(Test-Path $p)){New-Item -ItemType Directory -Path $p|Out-Null}}
Ensure $OfficeDir
function Esc([string]$s){if($null -eq $s){return ''};return (($s -replace '&','&amp;') -replace '<','&lt;' -replace '>','&gt;' -replace '"','&quot;')}
function ColName([int]$i){$n=$i+1;$r='';while($n -gt 0){$m=($n-1)%26;$r=[char](65+$m)+$r;$n=[math]::Floor(($n-1)/26)};$r}
function New-SharedStrings($sheets){$vals=New-Object System.Collections.Generic.List[string];$idx=@{};foreach($s in $sheets){foreach($h in $s.Headers){if($h -ne '' -and -not $idx.ContainsKey($h)){$idx[$h]=$vals.Count;$vals.Add($h)}};foreach($row in $s.Rows){foreach($h in $s.Headers){$v=""+$row.$h;if($v -ne '' -and -not $idx.ContainsKey($v)){$idx[$v]=$vals.Count;$vals.Add($v)}}}};[pscustomobject]@{Values=$vals;Index=$idx}}
function Sheet-Xml($headers,$rows,$shared){$all=@();$all+=,@($headers);foreach($row in $rows){$vals=@();foreach($h in $headers){$vals+=,(""+$row.$h)};$all+=,@($vals)};$rowXml='';for($r=0;$r -lt $all.Count;$r++){$cells='';for($c=0;$c -lt $all[$r].Count;$c++){$v=""+$all[$r][$c];if($v -eq ''){continue};$ref="$(ColName $c)$($r+1)";$id=$shared.Index[$v];$cells+="<c r=\"$ref\" t=\"s\"><v>$id</v></c>"};$rowXml+="<row r=\"$($r+1)\">$cells</row>"};"<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><sheetData>$rowXml</sheetData></worksheet>"}
function Write-Xlsx($path,$sheets){Add-Type -AssemblyName System.IO.Compression,System.IO.Compression.FileSystem;$shared=New-SharedStrings $sheets;$tmp=[System.IO.Path]::GetTempFileName();Remove-Item $tmp -Force;if(Test-Path $path){Remove-Item $path -Force};$zip=[System.IO.Compression.ZipFile]::Open($path,[System.IO.Compression.ZipArchiveMode]::Create);try{$entries=@{}
$entries['[Content_Types].xml']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/><Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/><Override PartName=\"/xl/sharedStrings.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml\"/><Override PartName=\"/docProps/core.xml\" ContentType=\"application/vnd.openxmlformats-package.core-properties+xml\"/><Override PartName=\"/docProps/app.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.extended-properties+xml\"/>$((1..$sheets.Count|ForEach-Object{"<Override PartName=\"/xl/worksheets/sheet$_.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"}) -join '')</Types>"
$entries['_rels/.rels']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/><Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties\" Target=\"docProps/core.xml\"/><Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties\" Target=\"docProps/app.xml\"/></Relationships>"
$now=(Get-Date).ToString('s')+'Z'
$entries['docProps/core.xml']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><cp:coreProperties xmlns:cp=\"http://schemas.openxmlformats.org/package/2006/metadata/core-properties\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type=\"dcterms:W3CDTF\">$now</dcterms:created><dcterms:modified xsi:type=\"dcterms:W3CDTF\">$now</dcterms:modified></cp:coreProperties>"
$entries['docProps/app.xml']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Properties xmlns=\"http://schemas.openxmlformats.org/officeDocument/2006/extended-properties\" xmlns:vt=\"http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes\"><Application>Codex</Application><HeadingPairs><vt:vector size=\"2\" baseType=\"variant\"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>$($sheets.Count)</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size=\"$($sheets.Count)\" baseType=\"lpstr\">$(($sheets|ForEach-Object{"<vt:lpstr>$(Esc $_.Name)</vt:lpstr>"}) -join '')</vt:vector></TitlesOfParts></Properties>"
$entries['xl/workbook.xml']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"><sheets>$(for($i=0;$i -lt $sheets.Count;$i++){"<sheet name=\"$(Esc $sheets[$i].Name)\" sheetId=\"$($i+1)\" r:id=\"rId$($i+1)\"/>"})</sheets></workbook>"
$entries['xl/_rels/workbook.xml.rels']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">$(for($i=0;$i -lt $sheets.Count;$i++){"<Relationship Id=\"rId$($i+1)\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet$($i+1).xml\"/>"})<Relationship Id=\"rId$($sheets.Count+1)\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/><Relationship Id=\"rId$($sheets.Count+2)\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings\" Target=\"sharedStrings.xml\"/></Relationships>"
$entries['xl/styles.xml']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><fonts count=\"1\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font></fonts><fills count=\"2\"><fill><patternFill patternType=\"none\"/></fill><fill><patternFill patternType=\"gray125\"/></fill></fills><borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs><cellXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/></cellXfs><cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles></styleSheet>"
$entries['xl/sharedStrings.xml']="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><sst xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" count=\"$($shared.Values.Count)\" uniqueCount=\"$($shared.Values.Count)\">$(($shared.Values|ForEach-Object{"<si><t xml:space=\"preserve\">$(Esc $_)</t></si>"}) -join '')</sst>"
for($i=0;$i -lt $sheets.Count;$i++){$entries["xl/worksheets/sheet$($i+1).xml"]=Sheet-Xml $sheets[$i].Headers $sheets[$i].Rows $shared}
foreach($name in $entries.Keys){$entry=$zip.CreateEntry($name);$writer=[System.IO.StreamWriter]::new($entry.Open());$writer.Write($entries[$name]);$writer.Dispose()}}finally{$zip.Dispose()}}
function Rows($csv){Import-Csv -LiteralPath $csv}
$columnsArticles=Rows (Join-Path $Workbooks 'columns-database-latest.articles.csv')
$columnsBlocks=Rows (Join-Path $Workbooks 'columns-database-latest.article-blocks.csv')
$eliteArticles=Rows (Join-Path $Workbooks 'elite-database-latest.articles.csv')
$eliteBlocks=Rows (Join-Path $Workbooks 'elite-database-latest.article-blocks.csv')
$foundersProfiles=Rows (Join-Path $Workbooks 'founders-team-latest.profiles.csv')
$foundersBlocks=Rows (Join-Path $Workbooks 'founders-team-latest.profile-blocks.csv')
$advisorsProfiles=Rows (Join-Path $Workbooks 'advisors-team-latest.profiles.csv')
$advisorsBlocks=Rows (Join-Path $Workbooks 'advisors-team-latest.profile-blocks.csv')
$articleGuide=@(
 [pscustomobject][ordered]@{項目='你之後要改哪裡';寫法='只改 articles 和 article_blocks 這兩張工作表';說明='不要改 source-snapshots 與 legacy'},
 [pscustomobject][ordered]@{項目='粗體';寫法='在 article_blocks 的 樣式 寫 bold';說明='文字放在 文字內容'},
 [pscustomobject][ordered]@{項目='字體顏色';寫法='在 article_blocks 的 顏色 寫 #191970';說明='十六進位色碼'},
 [pscustomobject][ordered]@{項目='換行';寫法='同一格直接換行';說明='段內換行可直接在 Excel 儲存格內 Enter'},
 [pscustomobject][ordered]@{項目='YouTube';寫法='區塊類型寫 youtube，附加資料填 YouTube 網址';說明='文字內容填影片說明'}
 )
$articleExample=@(
 [pscustomobject][ordered]@{文章ID='sample-001';順序='1';區塊類型='heading';文字內容='這是標題';樣式='bold';顏色='#191970';附加資料='';備註='深藍粗體標題'},
 [pscustomobject][ordered]@{文章ID='sample-001';順序='2';區塊類型='paragraph';文字內容="第一段第一行`n第一段第二行";樣式='';顏色='';附加資料='';備註='同格換行'},
 [pscustomobject][ordered]@{文章ID='sample-001';順序='3';區塊類型='youtube';文字內容='2025 AMC 講座回放';樣式='';顏色='';附加資料='https://www.youtube.com/watch?v=example';備註='嵌入影片'}
 )
$profileGuide=@(
 [pscustomobject][ordered]@{項目='你之後要改哪裡';寫法='只改 profiles 和 profile_blocks';說明='人物一列，介紹多列'},
 [pscustomobject][ordered]@{項目='粗體';寫法='在 profile_blocks 的 樣式 寫 bold';說明='常用於職稱段標'},
 [pscustomobject][ordered]@{項目='換行';寫法='同一格直接換行';說明='可用於完整介紹'}
 )
$indexRows=@(
 [pscustomobject][ordered]@{區塊='文章專欄';請修改這個檔案='01-文章專欄-請修改這份.xlsx';工作表='articles, article_blocks';備註='新增文章時兩張表都要補'},
 [pscustomobject][ordered]@{區塊='獵豹菁英';請修改這個檔案='02-獵豹菁英-請修改這份.xlsx';工作表='articles, article_blocks';備註='新增文章時兩張表都要補'},
 [pscustomobject][ordered]@{區塊='創辦與經營團隊';請修改這個檔案='03-創辦與經營團隊-請修改這份.xlsx';工作表='profiles, profile_blocks';備註='新增人物時兩張表都要補'},
 [pscustomobject][ordered]@{區塊='師資顧問團隊';請修改這個檔案='04-師資顧問團隊-請修改這份.xlsx';工作表='profiles, profile_blocks';備註='新增人物時兩張表都要補'}
)
Write-Xlsx (Join-Path $OfficeDir '00-請從這裡開始-維護索引.xlsx') @(
 @{Name='維護索引';Headers=@('區塊','請修改這個檔案','工作表','備註');Rows=$indexRows},
 @{Name='規則';Headers=@('規則','內容');Rows=@([pscustomobject][ordered]@{規則='只維護這個資料夾';內容='migration-data\\latest\\office-files'},[pscustomobject][ordered]@{規則='不要改的資料夾';內容='current, archive, legacy, source-snapshots'},[pscustomobject][ordered]@{規則='若要改文章內容';內容='改 article_blocks'},[pscustomobject][ordered]@{規則='若要改文章標題、日期、摘要、封面';內容='改 articles'})}
)
Write-Xlsx (Join-Path $OfficeDir '01-文章專欄-請修改這份.xlsx') @(
 @{Name='articles';Headers=@($columnsArticles[0].PSObject.Properties.Name);Rows=$columnsArticles},
 @{Name='article_blocks';Headers=@($columnsBlocks[0].PSObject.Properties.Name);Rows=$columnsBlocks},
 @{Name='使用說明';Headers=@($articleGuide[0].PSObject.Properties.Name);Rows=$articleGuide},
 @{Name='寫法示例';Headers=@($articleExample[0].PSObject.Properties.Name);Rows=$articleExample}
)
Write-Xlsx (Join-Path $OfficeDir '02-獵豹菁英-請修改這份.xlsx') @(
 @{Name='articles';Headers=@($eliteArticles[0].PSObject.Properties.Name);Rows=$eliteArticles},
 @{Name='article_blocks';Headers=@($eliteBlocks[0].PSObject.Properties.Name);Rows=$eliteBlocks},
 @{Name='使用說明';Headers=@($articleGuide[0].PSObject.Properties.Name);Rows=$articleGuide},
 @{Name='寫法示例';Headers=@($articleExample[0].PSObject.Properties.Name);Rows=$articleExample}
)
Write-Xlsx (Join-Path $OfficeDir '03-創辦與經營團隊-請修改這份.xlsx') @(
 @{Name='profiles';Headers=@($foundersProfiles[0].PSObject.Properties.Name);Rows=$foundersProfiles},
 @{Name='profile_blocks';Headers=@($foundersBlocks[0].PSObject.Properties.Name);Rows=$foundersBlocks},
 @{Name='使用說明';Headers=@($profileGuide[0].PSObject.Properties.Name);Rows=$profileGuide}
)
Write-Xlsx (Join-Path $OfficeDir '04-師資顧問團隊-請修改這份.xlsx') @(
 @{Name='profiles';Headers=@($advisorsProfiles[0].PSObject.Properties.Name);Rows=$advisorsProfiles},
 @{Name='profile_blocks';Headers=@($advisorsBlocks[0].PSObject.Properties.Name);Rows=$advisorsBlocks},
 @{Name='使用說明';Headers=@($profileGuide[0].PSObject.Properties.Name);Rows=$profileGuide}
)
@"
請之後只修改這個資料夾：
E:\20260323_LiyunWG_Cheetah_website\migration-data\latest\office-files

依區塊修改：
- 文章專欄：01-文章專欄-請修改這份.xlsx
- 獵豹菁英：02-獵豹菁英-請修改這份.xlsx
- 創辦與經營團隊：03-創辦與經營團隊-請修改這份.xlsx
- 師資顧問團隊：04-師資顧問團隊-請修改這份.xlsx

先看：00-請從這裡開始-維護索引.xlsx
"@ | Set-Content -LiteralPath (Join-Path $OfficeDir '00-請先看這裡.txt') -Encoding UTF8
