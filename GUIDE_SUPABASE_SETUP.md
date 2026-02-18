# Supabase 소셜 로그인(OAuth) 설정 가이드

현재 `Unsupported provider: provider is not enabled` 오류가 발생하는 이유는 Supabase 프로젝트에서 Google/GitHub 로그인이 활성화되지 않았기 때문입니다.

아래 절차를 따라 설정을 완료해주세요.

## 1. Google 로그인 설정

1.  **Google Cloud Console** 접속 (https://console.cloud.google.com/)
2.  새 프로젝트 생성 또는 기존 프로젝트 선택
3.  **API 및 서비스 > OAuth 동의 화면** 설정
    *   `User Type`: 외부(External) 선택
    *   앱 이름, 이메일 등 필수 정보 입력
4.  **사용자 인증 정보(Credentials) > 사용자 인증 정보 만들기 > OAuth 클라이언트 ID**
    *   `애플리케이션 유형`: 웹 애플리케이션
    *   `승인된 리디렉션 URI`: Supabase 대시보드 > Authentication > URL Configuration > **Site URL** (예: `https://<your-project>.supabase.co/auth/v1/callback`)
        *   *팁: 로컬 개발 환경(`http://localhost:3000`)도 추가해주세요.*
5.  생성된 **Client ID**와 **Client Secret** 복사
6.  **Supabase 대시보드** 접속 > Project 선택
7.  **Authentication > Providers > Google** 선택
8.  **Google enabled** 활성화
9.  복사한 Client ID, Client Secret 입력 후 저장

## 2. GitHub 로그인 설정

1.  **GitHub Settings > Developer settings > OAuth Apps** 접속
2.  **New OAuth App** 클릭
3.  정보 입력:
    *   `Application name`: NoVague (또는 원하는 이름)
    *   `Homepage URL`: `http://localhost:3000` (배포 시 변경)
    *   `Authorization callback URL`: Supabase 대시보드에 있는 **Redirect URL** (예: `https://<your-project>.supabase.co/auth/v1/callback`)
4.  **Register application** 클릭
5.  **Client ID** 복사 및 **Generate a new client secret** 생성 후 복사
6.  **Supabase 대시보드** > **Authentication > Providers > GitHub** 선택
7.  **GitHub enabled** 활성화
8.  Client ID, Client Secret 입력 후 저장

## 3. 설정 완료 후

설정이 완료되면 앱을 새로고침하고 다시 로그인을 시도해주세요.
