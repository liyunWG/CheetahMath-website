$Root='E:\20260323_LiyunWG_Cheetah_website'
$Mig=Join-Path $Root 'migration-data'
$Latest=Join-Path $Mig 'latest'
$Legacy=Join-Path $Mig 'legacy'
$Template=Join-Path $Mig 'template'
$ColsCsv=Join-Path $Mig 'current\columns-batch-01-migrated\content-migration-columns-batch-01-migrated.csv'
$EliteHtml=Join-Path $Mig 'current\cheetah-elite-batch-01-review-v2\content-migration-cheetah-elite-batch-01-review-v2.files\sheet001.htm'
$AboutCsv=Join-Path $Mig 'current\about-cheetah-batch-01-template\content-migration-about-cheetah-batch-01-template.csv'
function Ensure($p){if(!(Test-Path $p)){New-Item -ItemType Directory -Path $p|Out-Null}}
function Esc([string]$s){if($null -eq $s){return ''};return ($s -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;' -replace '"','&quot;')}
function Norm([string]$s){if($null -eq $s){return ''};return (($s -replace "`r",'' -replace '[ \t]+`n',"`n" -replace "`n{3,}","`n`n").Trim())}
function Summary([string]$s){$t=(("$s") -replace '\s+',' ').Trim();if($t.Length -gt 120){return $t.Substring(0,120).Trim()+'…'};return $t}
function LegacyId([string]$u){if("$u" -match '/(\d+)/?$'){return $Matches[1]};''}
function Parse-HtmlTable([string]$html){$rows=@();$trs=[regex]::Matches($html,'<tr\b[\s\S]*?</tr>','IgnoreCase');foreach($tr in $trs){$cells=@();$tds=[regex]::Matches($tr.Value,'<(td|th)\b[\s\S]*?</\1>','IgnoreCase');foreach($td in $tds){$v=$td.Value -replace '^<(td|th)\b[^>]*>','' -replace '</(td|th)>$','';$v=$v -replace '<br\s*/?>',"`n" -replace '<[^>]+>','' -replace '&nbsp;',' ' -replace '&amp;','&' -replace '&quot;','"' -replace '&lt;','<' -replace '&gt;','>'; $cells+=((Norm $v))}; if(($cells|Where-Object{$_}).Count){$rows+=,@($cells)}}; $heads=$rows[0]; $out=@(); for($i=1;$i -lt $rows.Count;$i++){ $o=[ordered]@{}; for($j=0;$j -lt $heads.Count;$j++){ $o[$heads[$j]] = if($j -lt $rows[$i].Count){$rows[$i][$j]}else{''} }; $out+=[pscustomobject]$o }; return $out }
function ArticleBlocks($id,[string]$body){$parts=(Norm $body) -split "`n`n"|Where-Object{$_ -and $_.Trim()};$n=0;foreach($p in $parts){$n++;$u='';if($p -match 'https?://(?:www\.)?(?:youtube\.com|youtu\.be)/\S+'){$u=$Matches[0]};[pscustomobject][ordered]@{文章ID=$id;順序="$n";區塊類型=($(if($u){'youtube'}else{'paragraph'}));文字內容=$(if($u){($p -replace [regex]::Escape($u),'').Trim()}else{$p});樣式='';顏色='';附加資料=$u;備註=''}}}
function Parse-Profiles($prefix,$section,$url,[string]$body){$lines=(Norm $body).Split("`n")|ForEach-Object{$_.Trim()}|Where-Object{$_};$out=@();$i=0;while($i -lt ($lines.Count-1)){if($lines[$i+1] -notmatch '老師'){ $i++; continue };$role=$lines[$i];$name=$lines[$i+1];$j=$i+2;$bio=@();while($j -lt $lines.Count){if(($j+1) -lt $lines.Count -and $lines[$j+1] -match '老師' -and $lines[$j] -notmatch '老師'){break};$bio+=$lines[$j];$j++};$id='{0}-{1:d2}' -f $prefix,($out.Count+1);$bioText=Norm ($bio -join "`n");$exp=(($bio|Where-Object{$_ -match '^●'}) -join "`n");$full=(($bio|Where-Object{$_ -notmatch '^●'}) -join "`n");$eng='';if($name -match '[（(]([^）)]+)[）)]'){$eng=$Matches[1]};$out+=[pscustomobject][ordered]@{人物ID=$id;區塊=$section;slug=$id;姓名=($name -replace '[（(].*?[）)]','').Trim();英文名=$eng;職稱=$role;排序="$($out.Count+1)";照片檔名='';摘要=(Summary $(if($full){$full}else{$exp}));完整介紹=$full;專長標籤='';學經歷=$exp;來源網址=$url;對應新頁面='about.html';是否顯示='顯示';備註=''};$i=$j};$out}
function ProfileBlocks($profiles){$all=@();foreach($p in $profiles){$n=0;if($p.職稱){$n++;$all+=[pscustomobject][ordered]@{人物ID=$p.人物ID;順序="$n";區塊類型='heading';標題='職稱';內容=$p.職稱;樣式='bold';備註=''}};foreach($part in ((Norm $p.完整介紹) -split "`n`n"|Where-Object{$_ -and $_.Trim()})){$n++;$all+=[pscustomobject][ordered]@{人物ID=$p.人物ID;順序="$n";區塊類型='paragraph';標題='';內容=$part;樣式='';備註=''}};foreach($part in ((Norm $p.學經歷) -split "`n`n"|Where-Object{$_ -and $_.Trim()})){$n++;$all+=[pscustomobject][ordered]@{人物ID=$p.人物ID;順序="$n";區塊類型='bullet';標題='學經歷';內容=($part -replace '^●\s*','');樣式='';備註=''}}};$all}
function CsvOut($rows,$path){$rows|Export-Csv -LiteralPath $path -NoTypeInformation -Encoding utf8}
function XmlWorkbook($sheets,$path){$ns='urn:schemas-microsoft-com:office:spreadsheet';$sb=[System.Text.StringBuilder]::new();[void]$sb.Append("<?xml version=`"1.0`"?>`n");[void]$sb.Append('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">');foreach($s in $sheets){[void]$sb.Append("<Worksheet ss:Name=`"$(Esc $s.Name)`"><Table>");$rows=$s.Rows;if($rows.Count -eq 0){$rows=@([pscustomobject]@{Empty=''})};$heads=@($rows[0].PSObject.Properties.Name);[void]$sb.Append('<Row>');foreach($h in $heads){[void]$sb.Append("<Cell><Data ss:Type=`"String`">$(Esc $h)</Data></Cell>")};[void]$sb.Append('</Row>');foreach($r in $rows){[void]$sb.Append('<Row>');foreach($h in $heads){$v=""+$r.$h;[void]$sb.Append("<Cell><Data ss:Type=`"String`">$(Esc $v)</Data></Cell>")};[void]$sb.Append('</Row>')};[void]$sb.Append('</Table></Worksheet>')};[void]$sb.Append('</Workbook>');Set-Content -LiteralPath $path -Value $sb.ToString() -Encoding UTF8}
$dirs=@($Latest,$Legacy,$Template,(Join-Path $Latest 'workbooks'),(Join-Path $Template 'workbooks'),(Join-Path $Latest 'source-snapshots'),(Join-Path $Legacy 'source-snapshots'),(Join-Path $Template 'source-snapshots'));$dirs|ForEach-Object{Ensure $_}
Copy-Item -LiteralPath (Join-Path $Mig 'current\columns-batch-01-migrated') -Destination (Join-Path $Latest 'source-snapshots') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $Mig 'current\cheetah-elite-batch-01-review-v2') -Destination (Join-Path $Latest 'source-snapshots') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $Mig 'current\about-cheetah-batch-01-template') -Destination (Join-Path $Latest 'source-snapshots') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $Mig 'archive\cheetah-elite-batch-01-legacy') -Destination (Join-Path $Legacy 'source-snapshots') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $Mig 'current\columns-batch-01-template') -Destination (Join-Path $Template 'source-snapshots') -Recurse -Force
Copy-Item -LiteralPath (Join-Path $Mig 'current\about-cheetah-batch-01-template') -Destination (Join-Path $Template 'source-snapshots') -Recurse -Force
$cols=Import-Csv -LiteralPath $ColsCsv
$map=@{'AMC系列'='amc-series';'關於獵豹'='about-cheetah';'獵豹視角'='cheetah-perspective';'獵豹談教育'='education-talk';'獵豹談科普'='science-talk';'獵豹私塾'='cheetah-salon'}
$colArticles=@();$colBlocks=@();$i=0;foreach($r in $cols){$i++;$id=LegacyId $r.舊網址;if(!$id){$id=('columns-{0:d4}' -f $i)}else{$id="columns-$id"};$body=Norm $r.內文原稿;$slugBase=if($map.ContainsKey($r.子項目)){$map[$r.子項目]}else{'article'};$slug=if($id -match 'columns-(.+)$'){"$slugBase-$($Matches[1])"}else{$slugBase};$colArticles+=[pscustomobject][ordered]@{文章ID=$id;區塊='文章專欄';slug=$slug;標題=$r.標題;副標='';日期=$r.日期;文章類型=$r.類型;主分類=$r.分類;子分類=$r.子項目;標籤=$r.標籤;摘要=$(if($r.摘要){$r.摘要}else{Summary $body});封面圖片=$r.封面圖檔名;封面圖片Alt=$r.標題;來源網址=$(if($r.來源網址){$r.來源網址}else{$r.舊網址});舊網址=$r.舊網址;對應新頁面='columns.html';是否保留=$(if($r.是否保留){$r.是否保留}else{'保留'});排序="$i";內容格式='blocks';備註=$r.備註};$colBlocks+=@(ArticleBlocks $id $body)}
$eliteRows=Parse-HtmlTable (Get-Content -LiteralPath $EliteHtml -Raw)
$eliteArticles=@();$eliteBlocks=@();$i=0;foreach($r in $eliteRows){$i++;$id=$(if($r.新slug建議){$r.新slug建議}else{'elite-{0:d4}' -f $i});$body=Norm $r.內文原稿;$eliteArticles+=[pscustomobject][ordered]@{文章ID=$id;區塊='獵豹菁英';slug=$(if($r.新slug建議){$r.新slug建議}else{$id});標題=$r.標題;副標='';日期=$r.日期;文章類型=$r.類型;主分類=$r.分類;子分類=$r.類型;標籤=((@($r.類型,$r.分類,($r.日期 -replace '^(.{4}).*$','$1'))|Where-Object{$_}) -join ', ');摘要=$(if($r.摘要AI生成){$r.摘要AI生成}elseif($r.摘要摘錄){$r.摘要摘錄}else{Summary $body});封面圖片=$r.圖片檔名;封面圖片Alt=$r.標題;來源網址=$(if($r.圖片網址){$r.圖片網址}else{$r.舊網址});舊網址=$r.舊網址;對應新頁面=$(if($r.對應新頁面){$r.對應新頁面}else{'students.html'});是否保留=$(if($r.是否保留){$r.是否保留}else{'保留'});排序="$i";內容格式='blocks';備註=$r.備註};$eliteBlocks+=@(ArticleBlocks $id $body)}
$about=Import-Csv -LiteralPath $AboutCsv
$fRow=$about|Where-Object{$_.頁面名稱 -eq '創辦與經營團隊'}|Select-Object -First 1
$aRow=$about|Where-Object{$_.頁面名稱 -eq '師資顧問團隊'}|Select-Object -First 1
$fProfiles=Parse-Profiles 'founders' '創辦與經營團隊' $fRow.來源網址 $fRow.內文原稿
$aProfiles=Parse-Profiles 'advisors' '師資顧問團隊' $aRow.來源網址 $aRow.內文原稿
$fBlocks=ProfileBlocks $fProfiles
$aBlocks=ProfileBlocks $aProfiles
$articleLook=@([pscustomobject][ordered]@{類型='說明';值='articles';說明='每篇文章一列'},[pscustomobject][ordered]@{類型='說明';值='article_blocks';說明='同文章可有多個內容區塊'},[pscustomobject][ordered]@{類型='區塊類型';值='heading';說明='段標'},[pscustomobject][ordered]@{類型='區塊類型';值='paragraph';說明='一般段落'},[pscustomobject][ordered]@{類型='區塊類型';值='youtube';說明='附加資料填 YouTube 網址'},[pscustomobject][ordered]@{類型='樣式';值='bold';說明='粗體'},[pscustomobject][ordered]@{類型='顏色';值='#191970';說明='十六進位色碼'})
$profileLook=@([pscustomobject][ordered]@{類型='說明';值='profiles';說明='每位人物一列'},[pscustomobject][ordered]@{類型='說明';值='profile_blocks';說明='同人物可有多段介紹'},[pscustomobject][ordered]@{類型='區塊類型';值='heading';說明='段標'},[pscustomobject][ordered]@{類型='區塊類型';值='paragraph';說明='一般介紹'},[pscustomobject][ordered]@{類型='區塊類型';值='bullet';說明='條列學經歷'})
$wb=Join-Path $Latest 'workbooks';$tb=Join-Path $Template 'workbooks'
CsvOut $colArticles (Join-Path $wb 'columns-database-latest.articles.csv');CsvOut $colBlocks (Join-Path $wb 'columns-database-latest.article-blocks.csv');XmlWorkbook @(@{Name='articles';Rows=$colArticles},@{Name='article_blocks';Rows=$colBlocks},@{Name='lookups';Rows=$articleLook}) (Join-Path $wb 'columns-database-latest.xml')
CsvOut $eliteArticles (Join-Path $wb 'elite-database-latest.articles.csv');CsvOut $eliteBlocks (Join-Path $wb 'elite-database-latest.article-blocks.csv');XmlWorkbook @(@{Name='articles';Rows=$eliteArticles},@{Name='article_blocks';Rows=$eliteBlocks},@{Name='lookups';Rows=$articleLook}) (Join-Path $wb 'elite-database-latest.xml')
CsvOut $fProfiles (Join-Path $wb 'founders-team-latest.profiles.csv');CsvOut $fBlocks (Join-Path $wb 'founders-team-latest.profile-blocks.csv');XmlWorkbook @(@{Name='profiles';Rows=$fProfiles},@{Name='profile_blocks';Rows=$fBlocks},@{Name='lookups';Rows=$profileLook}) (Join-Path $wb 'founders-team-latest.xml')
CsvOut $aProfiles (Join-Path $wb 'advisors-team-latest.profiles.csv');CsvOut $aBlocks (Join-Path $wb 'advisors-team-latest.profile-blocks.csv');XmlWorkbook @(@{Name='profiles';Rows=$aProfiles},@{Name='profile_blocks';Rows=$aBlocks},@{Name='lookups';Rows=$profileLook}) (Join-Path $wb 'advisors-team-latest.xml')
$tColArt=@([pscustomobject][ordered]@{文章ID='columns-001';區塊='文章專欄';slug='columns-001';標題='示例標題';副標='';日期='2026-03-29';文章類型='文章';主分類='文章專欄';子分類='';標籤='文章專欄, 示例';摘要='請填摘要';封面圖片='example-cover.jpg';封面圖片Alt='示例標題';來源網址='';舊網址='';對應新頁面='columns.html';是否保留='保留';排序='1';內容格式='blocks';備註=''})
$tEliteArt=@([pscustomobject][ordered]@{文章ID='elite-001';區塊='獵豹菁英';slug='elite-001';標題='示例標題';副標='';日期='2026-03-29';文章類型='文章';主分類='獵豹菁英';子分類='';標籤='獵豹菁英, 示例';摘要='請填摘要';封面圖片='example-cover.jpg';封面圖片Alt='示例標題';來源網址='';舊網址='';對應新頁面='students.html';是否保留='保留';排序='1';內容格式='blocks';備註=''})
$tArtBlk=@([pscustomobject][ordered]@{文章ID='sample-001';順序='1';區塊類型='heading';文字內容='示例段標';樣式='bold';顏色='#191970';附加資料='';備註=''},[pscustomobject][ordered]@{文章ID='sample-001';順序='2';區塊類型='paragraph';文字內容='請填寫文章段落';樣式='';顏色='';附加資料='';備註=''},[pscustomobject][ordered]@{文章ID='sample-001';順序='3';區塊類型='youtube';文字內容='影片說明';樣式='';顏色='';附加資料='https://www.youtube.com/watch?v=example';備註=''})
$tProf=@([pscustomobject][ordered]@{人物ID='sample-01';區塊='示例區塊';slug='sample-01';姓名='示例老師';英文名='';職稱='示例職稱';排序='1';照片檔名='example.jpg';摘要='請填摘要';完整介紹='請填完整介紹';專長標籤='競賽, 資優';學經歷='示例學經歷';來源網址='';對應新頁面='about.html';是否顯示='顯示';備註=''})
$tProfBlk=@([pscustomobject][ordered]@{人物ID='sample-01';順序='1';區塊類型='heading';標題='職稱';內容='示例職稱';樣式='bold';備註=''},[pscustomobject][ordered]@{人物ID='sample-01';順序='2';區塊類型='paragraph';標題='';內容='請填完整介紹';樣式='';備註=''})
CsvOut $tColArt (Join-Path $tb 'columns-database-template.articles.csv');CsvOut $tArtBlk (Join-Path $tb 'columns-database-template.article-blocks.csv');XmlWorkbook @(@{Name='articles';Rows=$tColArt},@{Name='article_blocks';Rows=$tArtBlk},@{Name='lookups';Rows=$articleLook}) (Join-Path $tb 'columns-database-template.xml')
CsvOut $tEliteArt (Join-Path $tb 'elite-database-template.articles.csv');CsvOut $tArtBlk (Join-Path $tb 'elite-database-template.article-blocks.csv');XmlWorkbook @(@{Name='articles';Rows=$tEliteArt},@{Name='article_blocks';Rows=$tArtBlk},@{Name='lookups';Rows=$articleLook}) (Join-Path $tb 'elite-database-template.xml')
CsvOut $tProf (Join-Path $tb 'founders-team-template.profiles.csv');CsvOut $tProfBlk (Join-Path $tb 'founders-team-template.profile-blocks.csv');XmlWorkbook @(@{Name='profiles';Rows=$tProf},@{Name='profile_blocks';Rows=$tProfBlk},@{Name='lookups';Rows=$profileLook}) (Join-Path $tb 'founders-team-template.xml')
CsvOut $tProf (Join-Path $tb 'advisors-team-template.profiles.csv');CsvOut $tProfBlk (Join-Path $tb 'advisors-team-template.profile-blocks.csv');XmlWorkbook @(@{Name='profiles';Rows=$tProf},@{Name='profile_blocks';Rows=$tProfBlk},@{Name='lookups';Rows=$profileLook}) (Join-Path $tb 'advisors-team-template.xml')
@"
# migration-data 整理說明

- latest: 目前正式維護版本
- legacy: 歷史舊版來源
- template: 之後新增區塊可直接複製的模板

正式主檔：
- latest/workbooks/columns-database-latest.xml
- latest/workbooks/elite-database-latest.xml
- latest/workbooks/founders-team-latest.xml
- latest/workbooks/advisors-team-latest.xml

模板：
- template/workbooks/columns-database-template.xml
- template/workbooks/elite-database-template.xml
- template/workbooks/founders-team-template.xml
- template/workbooks/advisors-team-template.xml

整理統計：
- 文章專欄: $($colArticles.Count) 篇 / $($colBlocks.Count) 區塊
- 獵豹菁英: $($eliteArticles.Count) 篇 / $($eliteBlocks.Count) 區塊
- 創辦與經營團隊: $($fProfiles.Count) 位 / $($fBlocks.Count) 區塊
- 師資顧問團隊: $($aProfiles.Count) 位 / $($aBlocks.Count) 區塊
"@ | Set-Content -LiteralPath (Join-Path $Mig 'README.md') -Encoding UTF8
Write-Output 'migration-data reorganized'
