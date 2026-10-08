$dst = 'c:\Users\MARISH KUMAR R\OneDrive\Documents\Resume Builder\frontend\public\illustrations'
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$src = 'C:\Users\MARISH KUMAR R\.gemini\antigravity\brain\fdd0cdd5-6d53-45f2-94fa-99f3ccf2163c'
Copy-Item "$src\hero_3d_illustration_1786219307836.png" "$dst\hero.png"
Copy-Item "$src\hero_processing_orb_1786219319670.png" "$dst\processing_orb.png"
Copy-Item "$src\step_icon_jd_1786219332561.png" "$dst\step_jd.png"
Copy-Item "$src\step_icon_dictionary_1786219343191.png" "$dst\step_dictionary.png"
Copy-Item "$src\step_icon_score_1786219351871.png" "$dst\step_score.png"
Copy-Item "$src\step_icon_ranking_1786219363273.png" "$dst\step_ranking.png"
Copy-Item "$src\empty_state_upload_1786219373943.png" "$dst\empty_upload.png"
Copy-Item "$src\empty_state_results_1786219386951.png" "$dst\empty_results.png"
Write-Host "All illustrations copied successfully"
