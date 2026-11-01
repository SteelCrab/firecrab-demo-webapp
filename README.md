# firecrab-demo-webapp

학생 질문 게시판이다. Firecrab 시연용 앱이다.
이름과 질문을 올리면 들어온 순서로 보여 준다. 로그인이 없다. 링크만 열면 참여한다.

![학생 질문 게시판 화면](docs/screenshot.png)

## 아키텍처

![학생 질문 게시판 아키텍처](docs/architecture.png)

1. 학생과 심사위원은 `*.firecrab.dev` 고정 운영 주소로 접속한다. Firecrab Tunnel이 Cloudflare Quick Tunnel을 거쳐 Firecrab 관리 호스트의 Nginx로 연결한다. Nginx는 게시판 MicroVM으로 요청을 보낸다. 게시판은 PostgreSQL에 질문을 저장한다.
2. AI Sandbox에서 코드를 고치고 테스트와 미리보기를 거친다. 반영한 코드로 Docker 이미지를 만들어 OCI 이미지 저장소에 올린다. Firecrab 콘솔에서 **Deploy update**로 새 버전을 배포한다.

원본은 `docs/architecture.svg`와 `docs/architecture.html`이다. 아이콘은 AWS General Resource Icons를 사용했다.

## 구성

- `server.js`: 시작점. `DATABASE_URL`과 `PORT`를 읽는다.
- `app.js`: HTTP 처리. `/`, `/healthz`, `/api/questions`
- `lib/db.js`: PostgreSQL 저장. 시작할 때 `questions` 표를 만든다.
- `lib/questions.js`: 입력 검사
- `public/index.html`: 화면. CSS와 JS를 한 파일에 넣는다. 3초마다 새로 읽는다. 탭을 벗어나면 멈춘다.
- `test/`: 입력 검사 테스트와 API 테스트
- `docs/`: 아키텍처 그림과 화면 스크린샷

외부 패키지는 `pg` 하나다. HTTP 서버는 `node:http`를 쓴다.

## 실행

```sh
docker compose up --build
```

http://localhost:3000 에서 연다.

로컬에서 직접 실행하려면 PostgreSQL 주소를 넣는다.

```sh
npm ci
DATABASE_URL=postgres://board:board@localhost:5432/board npm start
```

## 테스트

```sh
npm test
```

`DATABASE_URL`이 없으면 API 테스트는 건너뛴다. 있으면 `questions` 표를 비우고 테스트한다. 운영 DB 주소로 실행하지 않는다.

## API

| 방법 | 경로 | 내용 |
| --- | --- | --- |
| GET | `/api/questions` | 질문 목록. `id` 오름차순 |
| POST | `/api/questions` | `{ "name": "...", "question": "..." }`. 이름 20자, 질문 200자 이내 |
| GET | `/healthz` | 상태 확인 |

## 이미지

```sh
docker build -t firecrab-demo-webapp:0.1.0 .
```

환경 변수 `DATABASE_URL`이 필요하다. 포트는 3000이다.
