@echo off
echo Starting page reorganization...

REM Create directories
mkdir src\pages\core
mkdir src\pages\jobs
mkdir src\pages\inventory
mkdir src\pages\sales
mkdir src\pages\warranty
mkdir src\pages\finance
mkdir src\pages\customers
mkdir src\pages\users

echo Directories created.

REM Move core files
move src\pages\Index.tsx src\pages\core\
move src\pages\Login.tsx src\pages\core\
move src\pages\NotFound.tsx src\pages\core\
move src\pages\Settings.tsx src\pages\core\

echo Core files moved.

REM Move jobs files
move src\pages\Jobs.tsx src\pages\jobs\
move src\pages\NewJob.tsx src\pages\jobs\

echo Jobs files moved.

REM Move inventory files
move src\pages\Parts.tsx src\pages\inventory\
move src\pages\PO.tsx src\pages\inventory\

echo Inventory files moved.

REM Move sales files
move src\pages\POSSale.tsx src\pages\sales\
move src\pages\SalesHistory.tsx src\pages\sales\
move src\pages\SaleDetail.tsx src\pages\sales\
move src\pages\Quotes.tsx src\pages\sales\
move src\pages\QuoteForm.tsx src\pages\sales\
move src\pages\PublicQuote.tsx src\pages\sales\
move src\pages\Pricing.tsx src\pages\sales\

echo Sales files moved.

REM Move warranty files
move src\pages\Warranty.tsx src\pages\warranty\
move src\pages\WarrantyNew.tsx src\pages\warranty\
move src\pages\PublicWarranty.tsx src\pages\warranty\
move src\pages\Claims.tsx src\pages\warranty\
move src\pages\ClaimEdit.tsx src\pages\warranty\
move src\pages\ClaimEditForm.tsx src\pages\warranty\

echo Warranty files moved.

REM Move finance files
move src\pages\Cashbook.tsx src\pages\finance\
move src\pages\CloseDay.tsx src\pages\finance\
move src\pages\Reports.tsx src\pages\finance\

echo Finance files moved.

REM Move customer files
move src\pages\CustomerHistory.tsx src\pages\customers\

echo Customer files moved.

REM Move user files
move src\pages\Users.tsx src\pages\users\

echo User files moved.

REM Move Dashboard to core (it's the main dashboard)
move src\pages\Dashboard.tsx src\pages\core\

echo Dashboard moved to core.

echo Page reorganization completed!
pause
