$ErrorActionPreference = "Stop"
Set-Location "$env:USERPROFILE\auction-platform"
npm pkg set private=true
npm pkg set workspaces[]="apps/*"
npm pkg set workspaces[]="packages/*"
New-Item -ItemType Directory -Force -Path "apps","packages" | Out-Null
npx --yes create-next-app@latest "apps/web" --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git
npx --yes create-next-app@latest "apps/admin" --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git
npx --yes @nestjs/cli new "apps/api" --package-manager npm --skip-git --strict
