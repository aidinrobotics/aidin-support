# 에이딘로보틱스 고객지원센터

제품 매뉴얼 · 설치·연동 가이드 · 자료실 · 자주 묻는 질문 · A/S 신청을 한곳에 모은 사이트입니다.
**내용은 이 저장소가 아니라 `aidin-docs`(국문) · `aidin-docs-en`(영문)에서 가져옵니다.**

## 내용 수정 방법 (연구원)

지금과 똑같습니다.

1. 각 제품 매뉴얼 저장소(예: `AFT200-D80-C-Manual-Kor`)의 `README.md`를 수정
2. 기존 `sync-manuals` 작업이 10분마다 `aidin-docs`로 모음
3. 이 저장소의 `deploy-support-center` 작업이 15분마다 사이트에 반영 (PDF도 자동으로 다시 만듦)

급할 때는 이 저장소 **Actions → deploy-support-center → Run workflow** 를 누르면 바로 반영됩니다.
매뉴얼 페이지 하단 **페이지 편집** 링크를 누르면 해당 원본 파일 편집 화면으로 바로 이동합니다.

## 자동 변환 규칙

- GitBook 목차(`SUMMARY.md`)를 그대로 메뉴로 사용
- `{% hint %}` → 안내 상자, `{% embed %}` YouTube → 영상, HubSpot → 신청서
- 모션 제어기(ARC6)는 국문·영문 모두 제외
- 매뉴얼의 `개정 이력` / `Revision History` 단락은 고객 사이트에서 제외

## 처음 설정 (관리자 1회)

1. 이 폴더 내용을 `aidinrobotics/aidin-support` 저장소로 올리기
2. 읽기 전용 토큰 만들기: GitHub → Settings → Developer settings → Fine-grained tokens
   - Resource owner: `aidinrobotics`, Repository: `aidin-docs`, `aidin-docs-en`
   - Permissions: Contents **Read-only**
3. 저장소 **Settings → Secrets and variables → Actions**
   - Secret `DOCS_READ_TOKEN` = 위 토큰
   - (도메인 연결 시) Variable `SITE_URL` = `https://support.aidinrobotics.co.kr`, `CUSTOM_DOMAIN` = `support.aidinrobotics.co.kr`
4. **Settings → Pages → Source: GitHub Actions**
5. Actions 탭에서 `deploy-support-center` 실행

## 내 컴퓨터에서 미리 보기 (개발자)

```bash
git clone https://github.com/aidinrobotics/aidin-docs .src/ko
git clone https://github.com/aidinrobotics/aidin-docs-en .src/en
npm install
npm run import
npm start
```
