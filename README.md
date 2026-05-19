# Drive Gallery

개인 사진/파일 갤러리 사이트입니다. Spring Boot 백엔드와 React/Vite 프론트엔드로 구성되어 있으며, 사진 업로드, 폴더 관리, 공유 링크, 휴지통, 중복 사진 관리, 태그 편집, 관리자 기능을 제공합니다.

## Project Structure

```text
D:\code\drive
├─ drive\          # Spring Boot backend
├─ drive-front\    # React + Vite frontend
├─ external-8000-setup.txt
└─ psql.txt
```

## Tech Stack

- Backend: Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA
- Database: PostgreSQL
- Auth: JWT
- Frontend: React 19, Vite 8
- Tunnel: Cloudflare Tunnel

## Main Features

- 회원가입 및 로그인
- JWT 기반 인증
- 사진 업로드 및 썸네일/원본 보기
- 폴더 생성, 삭제, 이름 변경, 정렬
- 폴더 공유 링크 생성 및 공유 페이지
- 폴더 ZIP 다운로드
- 휴지통, 복원, 영구 삭제
- 태그 추가/삭제
- 중복 사진 조회 및 삭제
- 관리자용 사진/폴더 관리

## Backend Setup

백엔드 위치:

```powershell
cd D:\code\drive\drive
```

실행:

```powershell
.\gradlew.bat bootRun
```

테스트:

```powershell
.\gradlew.bat test
```

기본 백엔드 주소:

```text
http://localhost:8080
```

## Backend Configuration

설정 파일:

```text
drive/src/main/resources/application.properties
```

주요 설정:

```properties
app.storage.local.base-paths=local1=D:/code/drive/drive/uploads
app.admin.username=admin
app.admin.password=admin1234

spring.datasource.url=jdbc:postgresql://localhost:5432/drive_db
spring.datasource.username=postgres
spring.datasource.password=12341234

jwt.expiration=1800000
```

`jwt.expiration=1800000`은 30분입니다. 프론트에 토큰은 남아 있어도 로그인 후 30분이 지나면 API 인증은 만료됩니다.

## Database

PostgreSQL에 아래 데이터베이스가 필요합니다.

```text
drive_db
```

현재 설정 기준 접속 정보:

```text
host: localhost
port: 5432
database: drive_db
user: postgres
password: 12341234
```

Hibernate 설정은 `spring.jpa.hibernate.ddl-auto=update`이므로 애플리케이션 실행 시 필요한 테이블을 갱신합니다.

## Frontend Setup

프론트엔드 위치:

```powershell
cd D:\code\drive\drive-front
```

의존성 설치:

```powershell
npm install
```

개발 서버 실행:

```powershell
npm run dev
```

기본 Vite 설정은 `5173` 포트를 사용합니다.

```text
http://localhost:5173
```

8000번 포트로 실행하려면:

```powershell
npm run dev -- --host 0.0.0.0 --port 8000
```

## Frontend Environment

환경 파일:

```text
drive-front/.env
```

현재 값:

```env
VITE_API_BASE_URL=
```

비어 있으면 Vite 프록시를 통해 `/api` 요청이 `http://localhost:8080`으로 전달됩니다. 배포 주소를 직접 지정해야 할 때만 `VITE_API_BASE_URL`에 백엔드 주소를 넣습니다.

## External Access On Port 8000

8000번 포트로 외부 접속을 열 때는 다음 흐름을 사용합니다.

1. 프론트를 8000번으로 실행합니다.

```powershell
cd D:\code\drive\drive-front
npm run dev -- --host 0.0.0.0 --port 8000
```

2. Cloudflare Tunnel 설정을 확인합니다.

```text
C:\Users\Admin\.cloudflared\config.yml
```

필요한 ingress:

```yaml
ingress:
  - hostname: vinylunderground.art
    service: http://localhost:8000
  - hostname: www.vinylunderground.art
    service: http://localhost:8000
  - service: http_status:404
```

3. 터널을 재시작합니다.

자세한 절차는 루트의 `external-8000-setup.txt`를 참고합니다.

## Useful Checks

8000번 프론트 확인:

```powershell
netstat -ano | Select-String ':8000'
Invoke-WebRequest -UseBasicParsing -Uri http://localhost:8000
```

Cloudflare Tunnel 확인:

```powershell
Get-Process cloudflared
Get-Content D:\code\drive\cloudflared.err.log -Tail 40
```

백엔드 확인:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri http://localhost:8080
```

## Build

프론트 빌드:

```powershell
cd D:\code\drive\drive-front
npm run build
```

백엔드 빌드:

```powershell
cd D:\code\drive\drive
.\gradlew.bat build
```

## Notes

- 업로드 파일은 현재 `D:/code/drive/drive/uploads` 아래에 저장됩니다.
- 기본 관리자 계정은 `admin / admin1234`입니다.
- 운영 환경에서는 `jwt.secret`, DB 비밀번호, 관리자 비밀번호를 반드시 변경해야 합니다.
- 프론트 화면에는 정렬용 파일명 같은 내부 파일명을 노출하지 않도록 주의합니다.
