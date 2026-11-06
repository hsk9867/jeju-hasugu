# 제주 하수구 제왕 배포 (Cloudflare Workers + D1)

- 워커: `jeju-hasugu` (worker.js) — 정적 파일 + 관리자 덮어쓰기 + 방문 통계
- DB: D1 `jeju-hasugu-db` (settings / media / hits)
- 관리자: `/admin` (비밀번호 = 시크릿 `ADMIN_PASSWORD`)
- 주소: https://jeju-hasugu.hsk9867.workers.dev (도메인 연결 전)
- GitHub Pages(hsk9867.github.io/jeju-hasugu)는 그대로 남아 있지만, 관리자 수정·방문 통계는 **워커 주소에서만** 동작합니다.

## 처음 한 번
    npx wrangler d1 migrations apply jeju-hasugu-db --remote
    npx wrangler secret put ADMIN_PASSWORD      # 별도 터미널에서 (Claude Code 안에서 하면 빈 값이 들어감)
    npx wrangler deploy

## 도메인 연결
1. Cloudflare 대시보드 → Add a domain → 도메인 (Free)
2. 도메인 업체에서 네임서버를 Cloudflare 가 알려준 2개로 변경
3. Cloudflare 에서 Active 되면 wrangler.jsonc 의 routes 주석을 풀고 `npx wrangler deploy`
4. worker.js 맨 위 SELF_HOSTS 에 도메인 추가 (자기 사이트 안 이동이 유입경로로 잡히지 않게)

## 수정 후 반영
코드·영상·사진 파일을 바꾸면 `npx wrangler deploy`. 문구·사진·목록은 관리자에서 바꾸면 바로 반영(최대 30초).
관리자에서 덮어쓴 값이 HTML 보다 우선하므로, HTML 을 직접 고쳤는데 안 바뀌면 관리자에서 해당 항목 "기본값"을 누를 것.
편집 가능하게 하려면 HTML 요소에 `data-cms="키"` (+ `data-cms-fmt="rich|lines|checks|chips|img|link"`) 를 붙이면 관리자에 자동으로 나타남.
라벨은 admin.html 의 LABELS / labelFor, 그룹은 GROUPS / KEY_GROUP.

## 영상 추가
관리자에서는 영상 파일을 올릴 수 없음(D1 용량 한도). 새 영상은
    ffmpeg -i 원본.mp4 -t 12 -an -r 30 -vf "scale=960:444:force_original_aspect_ratio=increase,crop=960:444,format=yuv420p" -c:v libx264 -preset slow -crf 26 -movflags +faststart video/clipN.mp4
    ffmpeg -ss 1 -i video/clipN.mp4 -frames:v 1 -q:v 4 img/clipN-poster.jpg
로 만들어 index.html #clips 에 figure 를 추가하고 deploy. (관리자에서 영상 목록을 수정해 둔 상태면 "처음 목록으로" 를 눌러야 새 영상이 보임)

## 로컬 테스트
    cd "C:/Users/홍아름/Desktop/홍스랩 업무자료/hongslab/tools"
    SITE="C:/Users/홍아름/jeju-hasugu" PORT=8792 ADMIN_PASSWORD=test1234 node serve.mjs
