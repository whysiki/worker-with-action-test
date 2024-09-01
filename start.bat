


@REM Set a Local webhook URL

python webhook.py "https://tgbot.whysiki.fun"


@REM start wrangler dev --remote

start cmd /k wrangler dev --remote


@REM Expose the Local worker to the Internet

@REM start cmd /k "cloudflared tunnel --config \"./cloudflare_d/config.yml\" run"

start powershell -NoExit -Command "cloudflared tunnel --config './cloudflare_d/config.yml' run"


@REM Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel --config './cloudflare_d/config.yml' run"



@REM python webhook.py https://tgbot-whysiki.oooplhhhg.workers.dev