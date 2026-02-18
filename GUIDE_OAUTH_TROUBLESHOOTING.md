# Supabase 소셜 로그인(OAuth) 문제 해결 가이드

## 오류: `redirect_uri_mismatch` (400 오류)
이 오류는 **Google Cloud Console**에 등록된 "승인된 리디렉션 URI"와 실제 요청을 보내는 URI가 일치하지 않을 때 발생합니다.

### ✅ 해결 방법

#### 1. Google Cloud Console 설정 수정
1.  **Google Cloud Console** > **API 및 서비스** > **사용자 인증 정보** 로 이동합니다.
2.  이전에 생성한 **"OAuth 2.0 클라이언트 ID"** 이름을 클릭하여 수정 화면으로 들어갑니다.
3.  **"승인된 리디렉션 URI"** 항목에 **반드시 아래 주소를 추가**해주세요:

    ```text
    https://gsdeynpvzdhniztehozi.supabase.co/auth/v1/callback
    ```

    > **중요**: `http://localhost:3000`을 여기에 넣으시면 안 됩니다. Supabase를 거쳐서 로그인하기 때문입니다.

4.  **저장** 버튼을 누릅니다. (반영에 1~5분 정도 걸릴 수 있습니다)

#### 2. Supabase URL Configuration 확인
1.  **Supabase Dashboard** > **Authentication** > **URL Configuration** 으로 이동합니다.
2.  **Site URL**이 다음 중 하나로 설정되어 있는지 확인하세요:
    *   `http://localhost:3000` (로컬 개발용)
    *   또는 배포된 도메인 주소
3.  **Redirect URLs** 목록에 다음 주소가 포함되어 있는지 확인하세요:
    *   `http://localhost:3000/*`
    *   `http://localhost:3000`

### 🔄 다시 시도
설정을 변경한 후, 약 1분 정도 기다렸다가 웹사이트에서 다시 **Google 로그인** 버튼을 눌러보세요.
