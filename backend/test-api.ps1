$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8081/api"
$report = "API_TEST_REPORT.md"

"## API Test Execution Report" | Out-File $report -Encoding utf8
"`n### 1. Register & Login Users" | Out-File $report -Append

$adminBody = @{ name="Admin"; email="admin@test.com"; password="password123"; role="ADMIN" } | ConvertTo-Json
$adminReq = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $adminBody -ErrorAction SilentlyContinue
if (-not $adminReq) {
    $adminReq = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{ email="admin@test.com"; password="password123" } | ConvertTo-Json)
}
$adminToken = $adminReq.token
"✅ **Admin User Token obtained**: `$($adminToken.Substring(0, 15))...`" | Out-File $report -Append

$userBody = @{ name="Normal User"; email="user@test.com"; password="password123"; role="USER" } | ConvertTo-Json
$userReq = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $userBody -ErrorAction SilentlyContinue
if (-not $userReq) {
    $userReq = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{ email="user@test.com"; password="password123" } | ConvertTo-Json)
}
$userToken = $userReq.token
"✅ **Normal User Token obtained**: `$($userToken.Substring(0, 15))...`" | Out-File $report -Append

"`n### 2. Create Resource (Admin)" | Out-File $report -Append
$resPayload = @{ name="AI Lab Room"; type="LAB"; capacity=15; location="Block C"; isAvailable=$true } | ConvertTo-Json
$resResp = Invoke-RestMethod -Uri "$baseUrl/resources" -Method Post -Headers @{Authorization="Bearer $adminToken"} -ContentType "application/json" -Body $resPayload
"✅ **Resource created successfully:**" | Out-File $report -Append
'```json' | Out-File $report -Append
$resResp | ConvertTo-Json -Depth 3 | Out-File $report -Append
'```' | Out-File $report -Append

"`n### 3. Create Booking (Normal User)" | Out-File $report -Append
$sTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:00:00")
$eTime = (Get-Date).AddDays(1).AddHours(2).ToString("yyyy-MM-ddTHH:00:00")
$bookPayload = @{ resourceId=$resResp.id; purpose="Group Assignment"; startTime=$sTime; endTime=$eTime; attendeeCount=5 } | ConvertTo-Json
$bookResp = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Headers @{Authorization="Bearer $userToken"} -ContentType "application/json" -Body $bookPayload
"✅ **Booking request submitted:**" | Out-File $report -Append
'```json' | Out-File $report -Append
$bookResp | ConvertTo-Json -Depth 3 | Out-File $report -Append
'```' | Out-File $report -Append

"`n### 4. Admin Approves Booking" | Out-File $report -Append
$apprPayload = @{ note="Approved for assignment" } | ConvertTo-Json
$apprResp = Invoke-RestMethod -Uri "$baseUrl/bookings/$($bookResp.id)/approve" -Method Put -Headers @{Authorization="Bearer $adminToken"} -ContentType "application/json" -Body $apprPayload
"✅ **Booking status updated to APPROVED:**" | Out-File $report -Append
'```json' | Out-File $report -Append
$apprResp | ConvertTo-Json -Depth 3 | Out-File $report -Append
'```' | Out-File $report -Append

Write-Host "Done validating."
