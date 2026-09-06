import os
import sys
import base64
from pathlib import Path
import subprocess

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path("/Users/terecal/pilot-project/sample-pkt-project")
OUTPUT_DOCS = ROOT / "output/documents"
OUTPUT_PDF = ROOT / "output/pdf"
OUTPUT_DOCS.mkdir(parents=True, exist_ok=True)
OUTPUT_PDF.mkdir(parents=True, exist_ok=True)

HTML_PATH = OUTPUT_DOCS / "tikitaka-project-intro-guide.html"
DOCX_PATH = OUTPUT_DOCS / "tikitaka-project-intro-guide.docx"
PDF_PATH = OUTPUT_PDF / "tikitaka-project-intro-guide.pdf"

MASCOT_PATH = ROOT / "tikitaka-note/pkt-study-fullstack/public/tikitaka-mascot.png"

# Color Palette matching original guide
NAVY = "102A43"
BLUE = "2368B5"
LIGHT_BLUE = "EAF2FB"
RED = "D84A4A"
LIGHT_RED = "FCEEEE"
INK = "182026"
MUTED = "5C6874"
LIGHT = "F3F6F9"
LINE = "D9E2EC"
GREEN = "2B8A3E"
LIGHT_GREEN = "EBFBEE"

def generate_html():
    mascot_b64 = ""
    if MASCOT_PATH.exists():
        with open(MASCOT_PATH, "rb") as f:
            mascot_b64 = f"data:image/png;base64,{base64.b64encode(f.read()).decode('utf-8')}"

    html_content = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>티키타카 개발 노트 프로젝트 소개 및 실전 사용 가이드</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  @page {{
    size: A4 portrait;
    margin: 0;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
    color: #{INK};
    background-color: #E2E8F0;
    line-height: 1.45;
    font-size: 13px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  /* Page container for screen viewing */
  .page {{
    width: 210mm;
    height: 297mm;
    margin: 15px auto;
    background: #ffffff;
    padding: 17mm 18mm 15mm 18mm;
    position: relative;
    box-shadow: 0 4px 15px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }}

  @media print {{
    body {{
      background: none;
    }}
    .page {{
      margin: 0;
      width: 210mm;
      height: 297mm;
      box-shadow: none;
      page-break-after: always;
      break-after: page;
    }}
  }}

  /* Running Header & Footer */
  .doc-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #{LINE};
    padding-bottom: 5px;
    margin-bottom: 12px;
    font-size: 11px;
    font-weight: 600;
    color: #{MUTED};
    letter-spacing: -0.2px;
  }}
  .doc-header .badge {{
    background: #{LIGHT_BLUE};
    color: #{BLUE};
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
  }}

  .doc-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #{LINE};
    padding-top: 7px;
    margin-top: 8px;
    font-size: 10.5px;
    color: #{MUTED};
  }}
  .doc-footer .page-num {{
    font-weight: 600;
    color: #{NAVY};
  }}

  .content-area {{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }}

  /* Typography */
  h1.main-title {{
    font-size: 21px;
    font-weight: 800;
    color: #{NAVY};
    line-height: 1.25;
    letter-spacing: -0.5px;
    margin-bottom: 3px;
  }}
  .sub-title {{
    font-size: 12.5px;
    font-weight: 600;
    color: #{BLUE};
    margin-bottom: 10px;
  }}

  h2.section-title {{
    font-size: 14px;
    font-weight: 700;
    color: #{NAVY};
    border-left: 3.5px solid #{BLUE};
    padding-left: 8px;
    margin-top: 9px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    letter-spacing: -0.3px;
  }}
  h2.section-title .step-num {{
    display: inline-block;
    background: #{NAVY};
    color: #ffffff;
    font-size: 10.5px;
    border-radius: 3px;
    padding: 1px 5px;
    margin-right: 6px;
  }}

  h3.sub-section-title {{
    font-size: 12px;
    font-weight: 700;
    color: #{NAVY};
    margin-top: 4px;
    margin-bottom: 3px;
  }}

  p {{
    margin-bottom: 5px;
    text-align: justify;
    word-break: keep-all;
    font-size: 12px;
  }}

  /* Callout box */
  .callout {{
    background-color: #{LIGHT};
    border-left: 4px solid #{BLUE};
    border-radius: 4px;
    padding: 7px 11px;
    margin: 6px 0;
    font-size: 11.5px;
    line-height: 1.45;
  }}
  .callout.primary {{
    background-color: #{LIGHT_BLUE};
    border-left-color: #{BLUE};
  }}
  .callout.accent {{
    background-color: #{LIGHT_RED};
    border-left-color: #{RED};
  }}
  .callout-title {{
    font-weight: 700;
    color: #{NAVY};
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .callout.accent .callout-title {{
    color: #{RED};
  }}

  /* Tables */
  table.custom-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 8px 0;
    font-size: 11.2px;
  }}
  table.custom-table th, table.custom-table td {{
    border: 1px solid #{LINE};
    padding: 4px 7px;
    vertical-align: middle;
  }}
  table.custom-table th {{
    background-color: #{LIGHT_BLUE};
    color: #{NAVY};
    font-weight: 700;
    text-align: left;
    white-space: nowrap;
  }}
  table.custom-table tr:nth-child(even) td {{
    background-color: #FAFCFE;
  }}
  .tech-tag {{
    display: inline-block;
    background: #E2E8F0;
    color: #{NAVY};
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.8px;
    font-weight: 600;
    padding: 1px 4px;
    border-radius: 3px;
  }}

  /* Code box */
  .code-box {{
    background-color: #1A202C;
    color: #E2E8F0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    padding: 6px 10px;
    border-radius: 4px;
    margin: 4px 0 6px 0;
    line-height: 1.4;
  }}
  .code-box .comment {{
    color: #A0AEC0;
  }}
  .code-box .cmd {{
    color: #63B3ED;
    font-weight: 600;
  }}

  /* Cards / Grid */
  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 5px 0;
  }}
  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin: 5px 0;
  }}
  .card {{
    border: 1px solid #{LINE};
    border-radius: 4px;
    padding: 6px 8px;
    background: #ffffff;
  }}
  .card-header {{
    font-size: 11.5px;
    font-weight: 700;
    color: #{NAVY};
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 4px;
  }}
  .card-body {{
    font-size: 10.5px;
    color: #{INK};
    line-height: 1.38;
  }}

  /* Step loop */
  .loop-flow {{
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    gap: 5px;
    margin: 7px 0;
  }}
  .loop-step {{
    flex: 1;
    background: #{LIGHT};
    border: 1px solid #{LINE};
    border-top: 3px solid #{BLUE};
    border-radius: 4px;
    padding: 5px 6px;
    text-align: center;
  }}
  .loop-step.active {{
    background: #{LIGHT_BLUE};
    border-top-color: #{NAVY};
  }}
  .loop-step .step-title {{
    font-size: 11px;
    font-weight: 700;
    color: #{NAVY};
    margin-bottom: 2px;
  }}
  .loop-step .step-desc {{
    font-size: 9.5px;
    color: #{MUTED};
    line-height: 1.3;
  }}

  ul.bullet-list {{
    margin-left: 15px;
    margin-bottom: 5px;
    font-size: 11.5px;
  }}
  ul.bullet-list li {{
    margin-bottom: 2px;
    line-height: 1.38;
  }}
  ul.bullet-list li strong {{
    color: #{NAVY};
  }}

  .link-pill {{
    display: inline-block;
    color: #{BLUE};
    text-decoration: none;
    font-weight: 600;
    font-size: 10.8px;
  }}
  .link-pill:hover {{
    text-decoration: underline;
  }}

  .mascot-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }}
</style>
</head>
<body>

<!-- ================= PAGE 1 ================= -->
<div class="page" id="page1">
  <div class="doc-header">
    <span>티키타카 개발 노트 (Tikitaka Note)  |  실전 프로젝트 소개 및 사용 가이드</span>
    <span class="badge">FIELD GUIDE v0.1.58</span>
  </div>

  <div class="content-area">
    <div class="mascot-header">
      <div>
        <div style="font-size: 10px; font-weight: 700; color: #{RED}; letter-spacing: 0.5px; margin-bottom: 2px;">LOCAL-FIRST AI AGENT KNOWLEDGE WORKSPACE</div>
        <h1 class="main-title">티키타카 개발 노트 프로젝트 가이드</h1>
        <div class="sub-title">공부하고, 만들고, 확인하고, 다시 쓰는 개발 노트 — 학습 50 : 툴링 50</div>
      </div>
      {"<img src='" + mascot_b64 + "' style='width: 52px; height: auto;' alt='Mascot' />" if mascot_b64 else ""}
    </div>

    <div class="callout primary">
      <div class="callout-title">
        <span>💡 핵심 철학: 강한 개발자 + 강한 Agent = 더 강한 팀</span>
      </div>
      AI가 코드를 빠르게 작성해도 최종 설계와 검증 판단은 사람이 합니다. 티키타카 노트는 개발자가 학습한 원리와 Agent의 구현 역량을 결합하여 지속 가능한 팀의 지식 자산으로 전환하는 <strong>로컬 우선(Local-First) 학습·개발 데스크톱 환경</strong>입니다.
    </div>

    <h2 class="section-title"><span class="step-num">01</span> 프로젝트 한눈에 보기 (Overview)</h2>
    <p>
      티키타카 노트는 일반적인 단순 메모 앱과 달리 개발자가 기술을 <strong>배우고(Study)</strong>, Agent와 함께 <strong>만들고(Build)</strong>, 결과를 <strong>확인하고(Verify)</strong>, 배운 점을 <strong>적고(Document)</strong>, 다음 작업에서 <strong>다시 꺼내 쓰는(Reuse)</strong> 5단계 순환 흐름을 개발 라이프사이클에 정착시키는 오픈소스 프로젝트입니다.
    </p>

    <div class="grid-3">
      <div class="card">
        <div class="card-header">🎯 누구를 위한 도구인가</div>
        <div class="card-body">
          • AI 코딩 도구를 쓰지만 코드 원리를 깊이 이해하고 싶은 개발자<br>
          • MES/풀스택 아키텍처를 실전 예제로 학습하려는 엔지니어<br>
          • 실패와 의사결정(ADR)을 팀 자산으로 축적하려는 팀
        </div>
      </div>
      <div class="card">
        <div class="card-header">⚡ 무엇이 다른가</div>
        <div class="card-body">
          • 작성하고 끝나는 문서가 아닌 다음 작업의 Agent Context로 재활용<br>
          • 화면 코드와 SQLite 로컬 시드 데이터가 결합된 독립형 환경<br>
          • 인터넷이 없어도 동작하는 로컬 우선(Local-first) 아키텍처
        </div>
      </div>
      <div class="card">
        <div class="card-header">🏆 추구하는 핵심 가치</div>
        <div class="card-body">
          • <strong>작은 배치(Small Batch)</strong> 단위의 안전하고 빠른 구현<br>
          • 성공 코드뿐 아니라 <strong>실패한 시도</strong>의 지식 자산화<br>
          • 사람의 이해력과 Agent의 도구 생산성이 공존하는 균형
        </div>
      </div>
    </div>

    <h2 class="section-title"><span class="step-num">02</span> 시스템 아키텍처 & 기술 스택</h2>
    <table class="custom-table">
      <thead>
        <tr>
          <th style="width: 22%;">영역 (Component)</th>
          <th style="width: 28%;">주요 기술 스택</th>
          <th style="width: 50%;">역할 및 핵심 특징</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>데스크톱 클라이언트</strong></td>
          <td><span class="tech-tag">Tauri v2</span> <span class="tech-tag">Next.js 16</span></td>
          <td>경량 Rust 런타임 기반 데스크톱 앱. 빠른 반응성 및 로컬 파일/시스템 제어</td>
        </tr>
        <tr>
          <td><strong>로컬 데이터베이스</strong></td>
          <td><span class="tech-tag">SQLite</span> <span class="tech-tag">better-sqlite3</span></td>
          <td>사용자 로컬 디바이스에 독립 저장. 시드(Seed) 동기화 및 1클릭 백업/복원</td>
        </tr>
        <tr>
          <td><strong>리치 에디터 & 뷰어</strong></td>
          <td><span class="tech-tag">Lexical</span> <span class="tech-tag">TanStack Query</span></td>
          <td>코드 블록, 컴포넌트 실시간 프리뷰, Mermaid 다이어그램, KaTeX 수식 지원</td>
        </tr>
        <tr>
          <td><strong>MES 프로토타입 서버</strong></td>
          <td><span class="tech-tag">Spring Boot 3</span> <span class="tech-tag">Java 21</span></td>
          <td>MES 인증/인가(RBAC), LOT 추적 관리, 미션 카탈로그 RESTful API</td>
        </tr>
        <tr>
          <td><strong>프론트엔드 실습 모듈</strong></td>
          <td><span class="tech-tag">Zustand</span> <span class="tech-tag">Hook Form</span></td>
          <td>FSD 레이어 기반의 상태 관리, 폼 검증, API 통신 집중 실습 패키지</td>
        </tr>
      </tbody>
    </table>

    <h2 class="section-title"><span class="step-num">03</span> 데스크톱 앱 빠른 시작 (Quick Start)</h2>
    <ul class="bullet-list">
      <li><strong>1. 설치 파일 다운로드:</strong> GitHub 공식 Releases (<a class="link-pill" href="https://github.com/dota-pilot1/pkt-study-fullstack/releases/latest" target="_blank">pkt-study-fullstack/releases/latest</a>)에서 OS에 맞는 파일(macOS <code>.dmg</code>, Windows <code>.exe</code>/<code>.msi</code>)을 내려받습니다.</li>
      <li><strong>2. 앱 실행 및 샘플 노트 열람:</strong> 앱 구동 시 패키징된 기준 학습 데이터(<code>pkt-study.db</code>)가 자동으로 연동되어 MES 및 풀스택 학습 노트를 즉시 열람·편집할 수 있습니다.</li>
      <li><strong>3. 로컬 데이터 보존 및 백업:</strong> 사용자가 작성한 모든 문서는 사용자 홈 디렉터리의 SQLite에 안전하게 보존되며, 앱 내 설정 메뉴에서 언제든 원클릭 백업이 가능합니다.</li>
    </ul>
  </div>

  <div class="doc-footer">
    <span>티키타카 개발 노트 프로젝트 가이드</span>
    <span class="page-num">Page 1 / 3</span>
    <span>dota-pilot1 / sample-pkt-project</span>
  </div>
</div>

<!-- ================= PAGE 2 ================= -->
<div class="page" id="page2">
  <div class="doc-header">
    <span>티키타카 개발 노트 (Tikitaka Note)  |  실전 프로젝트 소개 및 사용 가이드</span>
    <span class="badge">USAGE & ARCHITECTURE</span>
  </div>

  <div class="content-area">
    <h2 class="section-title" style="margin-top: 0;"><span class="step-num">04</span> 로컬 소스 코드 개발 환경 구동법</h2>
    <p>개발자 및 기여자가 로컬 저장소를 클론한 뒤 각 모듈을 독립적 또는 유기적으로 실행하는 방법입니다.</p>

    <div class="grid-2">
      <div>
        <h3 class="sub-section-title">💻 (1) 티키타카 데스크톱 앱 실행 (Tauri + Next.js)</h3>
        <div class="code-box">
          <span class="comment"># 메인 학습 노트 데스크톱 앱 구동</span><br>
          <span class="cmd">cd</span> tikitaka-note/pkt-study-fullstack<br>
          <span class="cmd">npm install</span><br>
          <span class="cmd">npm run tauri dev</span>  <span class="comment"># Next 4100 + Tauri 창 실행</span><br>
          <span class="comment"># 웹 브라우저 단독 디버깅 시: npm run dev</span>
        </div>
      </div>
      <div>
        <h3 class="sub-section-title">☕ (2) MES 백엔드 서버 구동 (Spring Boot 3)</h3>
        <div class="code-box">
          <span class="comment"># Java 21 및 PostgreSQL 기반 API 서버</span><br>
          <span class="cmd">cd</span> mes-prototype-server<br>
          <span class="cmd">cp</span> .env.example .env<br>
          <span class="cmd">./gradlew bootRun</span>  <span class="comment"># http://localhost:4101 구동</span><br>
          <span class="cmd">./gradlew test</span>     <span class="comment"># JUnit 단위/통합 테스트</span>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top: -2px;">
      <div>
        <h3 class="sub-section-title">🌐 (3) MES 프론트엔드 프로토타입</h3>
        <div class="code-box">
          <span class="comment"># Next.js 16 App Router + FSD 아키텍처</span><br>
          <span class="cmd">cd</span> mes-prototype-front<br>
          <span class="cmd">npm install</span> && <span class="cmd">npm run dev</span> <span class="comment"># http://localhost:4100</span><br>
          <span class="cmd">npm run lint</span> && <span class="cmd">npm run build</span> <span class="comment"># 빌드 검증</span>
        </div>
      </div>
      <div>
        <h3 class="sub-section-title">🧪 (4) 프론트엔드 단위 실습 랩 (Prac-Labs)</h3>
        <div class="code-box">
          <span class="comment"># 개별 라이브러리 집중 학습용 모듈</span><br>
          <span class="cmd">cd</span> prac-front/prac-zustand       <span class="comment"># 상태 관리 랩</span><br>
          <span class="cmd">cd</span> prac-front/prac-tanstack-query <span class="comment"># 서버 상태 패칭</span><br>
          <span class="cmd">npm install</span> && <span class="cmd">npm run dev</span>
        </div>
      </div>
    </div>

    <h2 class="section-title"><span class="step-num">05</span> 핵심 기능: 구조화된 지식 & 리치 에디터</h2>
    <div class="grid-3">
      <div class="card">
        <div class="card-header">📂 3계층 지식 분류 체계</div>
        <div class="card-body">
          • <strong>Space</strong>: 작업 공간 분리<br>
          • <strong>Category / Topic</strong>: Frontend, MES, Backend, DevOps 등 주제별 그룹화<br>
          • <strong>Document</strong>: 본문 문서(개념/TODO)와 하위 자식 문서(API 구현, Front 구현)의 계층적 분할
        </div>
      </div>
      <div class="card">
        <div class="card-header">✍️ 차세대 Lexical 에디터</div>
        <div class="card-body">
          • 마크다운 단축키 및 정밀 서식 지원<br>
          • 구문 강조(Syntax Highlighting) 코드 블록<br>
          • <strong>Mermaid</strong> 아키텍처 다이어그램 지원<br>
          • <strong>KaTeX</strong> 기반 수식 렌더링 지원<br>
          • 외부 이미지 및 첨부 파일 로컬 연동
        </div>
      </div>
      <div class="card">
        <div class="card-header">🧩 라이브 컴포넌트 프리뷰</div>
        <div class="card-body">
          • 문서 본문 내에서 React 버튼, 인풋, 모달 UI를 직접 렌더링하고 클릭 가능<br>
          • <strong>Ag-Grid</strong> 기반 LOT 목록 및 상세 Drawer 실시간 인터랙션<br>
          • 코드와 UI 결과를 한 화면에서 대조 학습
        </div>
      </div>
    </div>

    <h2 class="section-title"><span class="step-num">06</span> LLM Agent API 연동 및 자동 문서화</h2>
    <div class="callout">
      <div class="callout-title">
        <span>🤖 데스크톱 앱 내장 'API for LLM' 지원</span>
      </div>
      티키타카 노트는 데스크톱 앱 자체에 로컬 HTTP API 엔드포인트를 내장하고 있습니다. 외부 코딩 에이전트(Antigravity, Claude, Codex 등)는 이 API를 통해 현재 작업 중인 문서를 직접 조회하거나, 새롭게 구현된 코드와 검증 결과를 자동으로 노트에 기록할 수 있습니다.
    </div>

    <table class="custom-table">
      <thead>
        <tr>
          <th style="width: 25%;">API 기능</th>
          <th style="width: 35%;">호출 예시 / 메서드</th>
          <th style="width: 40%;">에이전트 협업 활용 시나리오</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>트리/주제 위치 조회</strong></td>
          <td><span class="tech-tag">GET /api/topics</span>, <span class="tech-tag">GET /api/tree</span></td>
          <td>현재 사용자가 작업 중인 위치(카테고리/토픽 ID)를 확인하여 엉뚱한 위치에 문서를 생성하지 않도록 방지</td>
        </tr>
        <tr>
          <td><strong>학습 노트 자동 생성</strong></td>
          <td><span class="tech-tag">POST /api/documents</span></td>
          <td>기능 구현 완료 후, 구현 내용, 코드 블록, 테스트 검증 결과를 본문/하위 문서로 자동 구조화하여 등록</td>
        </tr>
        <tr>
          <td><strong>규칙 및 과거 노트 검색</strong></td>
          <td><span class="tech-tag">GET /api/documents/{id}</span></td>
          <td>과거 유사 기능 구현 노트나 팀 컨벤션을 불러와 새로운 코드 생성 시 가이드라인으로 참조</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>티키타카 개발 노트 프로젝트 가이드</span>
    <span class="page-num">Page 2 / 3</span>
    <span>dota-pilot1 / sample-pkt-project</span>
  </div>
</div>

<!-- ================= PAGE 3 ================= -->
<div class="page" id="page3">
  <div class="doc-header">
    <span>티키타카 개발 노트 (Tikitaka Note)  |  실전 프로젝트 소개 및 사용 가이드</span>
    <span class="badge">AGENT ENGINEERING & WORKFLOW</span>
  </div>

  <div class="content-area">
    <h2 class="section-title" style="margin-top: 0;"><span class="step-num">07</span> 핵심 실행 루프: 5단계 엔지니어링 사이클</h2>
    <p>
      개발 효율과 학습 역량을 극대화하기 위해 티키타카 노트가 권장하는 실전 5단계 사이클입니다.
    </p>

    <div class="loop-flow">
      <div class="loop-step">
        <div class="step-title">① 배운다 (Study)</div>
        <div class="step-desc">기술 원리와 데이터 흐름(입력→처리→저장→출력)을 먼저 파악하고 완료 조건을 정의</div>
      </div>
      <div class="loop-step active">
        <div class="step-title">② 만든다 (Build)</div>
        <div class="step-desc">큰 기능을 한 번에 맡기지 않고 작은 단위(Small Batch)로 나누어 Agent와 단계별 구현</div>
      </div>
      <div class="loop-step">
        <div class="step-title">③ 확인한다 (Verify)</div>
        <div class="step-desc">생성된 코드를 맹신하지 않고 린트, 단위 테스트, 화면 동작을 개발자가 직접 검증</div>
      </div>
      <div class="loop-step active">
        <div class="step-title">④ 적는다 (Record)</div>
        <div class="step-desc">설계 이유, 해결한 난관, 실패했던 시도를 티키타카 노트에 구조화하여 기록</div>
      </div>
      <div class="loop-step">
        <div class="step-title">⑤ 다시 쓴다 (Reuse)</div>
        <div class="step-desc">작성된 노트를 다음 작업 시 Agent의 프롬프트 컨텍스트로 제공하여 일관성 유지</div>
      </div>
    </div>

    <h2 class="section-title"><span class="step-num">08</span> 실패를 줄이는 Agent 협업 3대 수칙</h2>
    <div class="grid-3">
      <div class="card" style="border-top: 3px solid #{RED};">
        <div class="card-header" style="color: #{RED};">수칙 1. 작은 배치 원칙</div>
        <div class="card-body">
          한 번의 프롬프트에 하나의 명확한 동작과 검증 조건만 부여합니다. 범위가 작을수록 개발자의 이해도가 유지되고 Agent의 환각(Hallucination)이 억제됩니다.
        </div>
      </div>
      <div class="card" style="border-top: 3px solid #{BLUE};">
        <div class="card-header" style="color: #{BLUE};">수칙 2. 실패한 시도 기록</div>
        <div class="card-body">
          성공한 코드뿐 아니라 "어떤 시도가 실패했고 왜 이 대안을 선택했는지"를 반드시 기록합니다. 미래의 나와 동료가 동일한 실수를 반복하지 않는 핵심 자산입니다.
        </div>
      </div>
      <div class="card" style="border-top: 3px solid #{GREEN};">
        <div class="card-header" style="color: #{GREEN};">수칙 3. 축적된 지식 주입</div>
        <div class="card-body">
          새 작업을 시작할 때 프로젝트 코딩 규칙, API 명세, 기존에 검증된 노트를 Agent에게 먼저 전달합니다. 팀의 아키텍처 원칙에 맞는 코드가 출력됩니다.
        </div>
      </div>
    </div>

    <h2 class="section-title"><span class="step-num">09</span> 데이터 관리 및 릴리즈 운영 원칙</h2>
    <table class="custom-table">
      <thead>
        <tr>
          <th style="width: 25%;">운영 항목</th>
          <th style="width: 40%;">관리 정책 및 원칙</th>
          <th style="width: 35%;">주의 사항 및 세부 지침</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>기준 시드(Seed) 동기화</strong></td>
          <td>Tauri 릴리즈 시 <code>.data/pkt-study.db</code>를 패키징에 포함하여 배포</td>
          <td>앱 버전 업데이트 시 사용자 기존 DB는 <code>.before-seed-sync</code> 백업 후 안전 교체</td>
        </tr>
        <tr>
          <td><strong>온보딩 테스트 환경</strong></td>
          <td><code>https://api.hibot-docu.com</code> (Spring Boot + Postgres)</td>
          <td>학습·테스트용 슬롯이므로 샘플 시더 가동 및 데이터 초기화가 상시 가능</td>
        </tr>
        <tr>
          <td><strong>API 버전 일치 검증</strong></td>
          <td>Swagger (<code>/v3/api-docs</code>) 계약 확인 후 프론트엔드 배포</td>
          <td>API 변경 시 백엔드를 선(先)배포하여 쿼리 무시/동작 불일치 사전 차단</td>
        </tr>
      </tbody>
    </table>

    <h2 class="section-title"><span class="step-num">10</span> 프로젝트 공식 리소스 및 저장소 안내</h2>
    <div class="callout primary" style="margin-bottom: 6px;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div><strong>📦 메인 저장소:</strong> <a class="link-pill" href="https://github.com/dota-pilot1/sample-pkt-project" target="_blank">github.com/dota-pilot1/sample-pkt-project</a></div>
        <div><strong>🚀 데스크톱 앱 릴리즈:</strong> <a class="link-pill" href="https://github.com/dota-pilot1/pkt-study-fullstack/releases" target="_blank">pkt-study-fullstack/releases</a></div>
        <div><strong>💬 이슈 및 피드백:</strong> <a class="link-pill" href="https://github.com/dota-pilot1/pkt-study-fullstack/issues" target="_blank">pkt-study-fullstack/issues</a></div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 8px; padding: 7px; background: #{LIGHT}; border-radius: 4px; border: 1px solid #{LINE};">
      <div style="font-size: 13.5px; font-weight: 800; color: #{NAVY};">학습 50 + 툴링 50 = 지속 가능한 소프트웨어 엔지니어링</div>
      <div style="font-size: 11px; color: #{MUTED}; margin-top: 2px;">
        사람이 공부하고, Agent와 만들고, 사람이 확인하고, 결과를 적는다. 그리고 다음 작업에서 다시 쓴다.
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <span>티키타카 개발 노트 프로젝트 가이드</span>
    <span class="page-num">Page 3 / 3</span>
    <span>dota-pilot1 / sample-pkt-project</span>
  </div>
</div>

</body>
</html>
"""
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated HTML: {HTML_PATH}")


def generate_docx():
    FONT = "Noto Sans KR"
    doc = Document()

    sec = doc.sections[0]
    sec.page_width = Inches(8.27)
    sec.page_height = Inches(11.69)
    sec.top_margin = Inches(0.65)
    sec.bottom_margin = Inches(0.65)
    sec.left_margin = Inches(0.7)
    sec.right_margin = Inches(0.7)
    sec.header_distance = Inches(0.35)
    sec.footer_distance = Inches(0.35)

    def set_run_font(run, size=10, bold=False, italic=False, color=INK):
        run.font.name = FONT
        r_pr = run._element.get_or_add_rPr()
        fonts = r_pr.rFonts
        if fonts is None:
            fonts = OxmlElement("w:rFonts")
            r_pr.insert(0, fonts)
        for key in ("ascii", "hAnsi", "eastAsia"):
            fonts.set(qn(f"w:{key}"), FONT)
        run.font.size = Pt(size)
        run.bold = bold
        run.italic = italic
        if color:
            run.font.color.rgb = RGBColor.from_string(color)

    def add_p(text="", size=10, bold=False, color=INK, before=0, after=4, align=WD_ALIGN_PARAGRAPH.LEFT, line_spacing=1.18):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(before)
        p.paragraph_format.space_after = Pt(after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            set_run_font(r, size=size, bold=bold, color=color)
        return p

    def add_heading_styled(text, level=1):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        if level == 1:
            set_run_font(r, size=13, bold=True, color=NAVY)
        else:
            set_run_font(r, size=11, bold=True, color=BLUE)
        return p

    def add_callout_box(title, body, fill="EAF2FB", accent=BLUE):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.rows[0].cells[0]
        tcPr = cell._tc.get_or_add_tcPr()
        w = OxmlElement("w:tcW")
        w.set(qn("w:w"), "9800")
        w.set(qn("w:type"), "dxa")
        tcPr.append(w)
        shd = OxmlElement("w:shd")
        shd.set(qn("w:fill"), fill)
        tcPr.append(shd)

        # left border only
        borders = OxmlElement("w:tcBorders")
        left = OxmlElement("w:left")
        left.set(qn("w:val"), "single")
        left.set(qn("w:sz"), "24")
        left.set(qn("w:color"), accent)
        borders.append(left)
        for side in ("top", "bottom", "right"):
            b = OxmlElement(f"w:{side}")
            b.set(qn("w:val"), "nil")
            borders.append(b)
        tcPr.append(borders)

        # margins
        mar = OxmlElement("w:tcMar")
        for side, val in (("top", 100), ("bottom", 100), ("left", 140), ("right", 140)):
            m = OxmlElement(f"w:{side}")
            m.set(qn("w:w"), str(val))
            m.set(qn("w:type"), "dxa")
            mar.append(m)
        tcPr.append(mar)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        r1 = p.add_run(title + "\n")
        set_run_font(r1, size=9.8, bold=True, color=NAVY)
        r2 = p.add_run(body)
        set_run_font(r2, size=9.5, bold=False, color=INK)

    # Header and Footer
    hp = sec.header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    hr1 = hp.add_run("티키타카 개발 노트  |  실전 프로젝트 소개 및 사용 가이드          v0.1.58")
    set_run_font(hr1, size=8.5, bold=True, color=MUTED)

    fp = sec.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    fr1 = fp.add_run("dota-pilot1 / sample-pkt-project   |   ")
    set_run_font(fr1, size=8.5, color=MUTED)
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), "PAGE")
    fp._p.append(fld)

    # ===== PAGE 1 =====
    add_p("LOCAL-FIRST AI AGENT KNOWLEDGE WORKSPACE", size=8.5, bold=True, color=RED, after=2)
    add_p("티키타카 개발 노트 프로젝트 가이드", size=19, bold=True, color=NAVY, after=2)
    add_p("공부하고, 만들고, 확인하고, 다시 쓰는 개발 노트 — 학습 50 : 툴링 50", size=11, bold=True, color=BLUE, after=6)

    add_callout_box("💡 핵심 철학: 강한 개발자 + 강한 Agent = 더 강한 팀",
                    "AI가 코드를 빠르게 생성해도 최종 설계와 검증 판단은 사람이 합니다. 티키타카 노트는 개발자가 학습한 원리와 Agent의 구현 역량을 결합하여 지속 가능한 팀 지식 자산으로 전환하는 로컬 우선(Local-First) 학습·개발 데스크톱 환경입니다.")

    add_heading_styled("01. 프로젝트 한눈에 보기 (Overview)", 1)
    add_p("티키타카 노트는 일반적인 단순 메모 앱과 달리 개발자가 기술을 배우고(Study), Agent와 함께 만들고(Build), 결과를 확인하고(Verify), 배운 점을 적고(Document), 다음 작업에서 다시 꺼내 쓰는(Reuse) 5단계 순환 흐름을 제공하는 통합 학습 플랫폼입니다.", size=9.8, after=5)

    add_p("• 주요 대상: AI 도구를 쓰면서도 코드 원리를 온전히 이해하고 검증하려는 개발자, MES/풀스택 실전 학습자", size=9.5, after=2)
    add_p("• 무엇이 다른가: 단순 기록에 그치지 않고, 다음 작업 시 Agent Context로 즉시 재투입되는 지식 순환 구조", size=9.5, after=2)
    add_p("• 핵심 가치: 작은 배치(Small Batch) 단위의 안전한 구현, 실패 경험 자산화, 로컬 데이터 완전 보존", size=9.5, after=6)

    add_heading_styled("02. 시스템 아키텍처 & 기술 스택 요약", 1)
    tbl1 = doc.add_table(rows=0, cols=3)
    tbl1.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl1.autofit = False
    headers = ["구분 (Component)", "기술 스택", "역할 및 핵심 특징"]
    widths = [2000, 2400, 5400]
    row = tbl1.add_row()
    for idx, name in enumerate(headers):
        cell = row.cells[idx]
        cell.text = name
        set_run_font(cell.paragraphs[0].runs[0], size=9, bold=True, color=NAVY)
        cell._tc.get_or_add_tcPr().append(OxmlElement("w:shd"))
        cell._tc.tcPr.find(qn("w:shd")).set(qn("w:fill"), LIGHT_BLUE)

    rows_data = [
        ("데스크톱 클라이언트", "Tauri v2 + Next.js 16", "경량 Rust 런타임 기반 네이티브 데스크톱 앱. 빠른 반응성 및 로컬 I/O"),
        ("로컬 데이터베이스", "SQLite (better-sqlite3)", "오프라인 완전 지원, 로컬 데이터 보존, 패키징 시드 동기화 및 백업/복원"),
        ("리치 에디터 & 뷰어", "Lexical + TanStack Query", "코드 블록 구문 강조, 실시간 컴포넌트 프리뷰, Mermaid/KaTeX 지원"),
        ("MES 프로토타입 서버", "Spring Boot 3 + Java 21", "MES 인증/인가(RBAC), LOT 추적 관리, 미션 카탈로그 RESTful API"),
        ("프론트엔드 실습 모듈", "Zustand, Hook Form, Axios", "FSD 아키텍처 기반의 상태 관리, 폼 검증, 비동기 통신 집중 실습 패키지"),
    ]
    for rdata in rows_data:
        r = tbl1.add_row()
        for idx, val in enumerate(rdata):
            c = r.cells[idx]
            c.text = val
            set_run_font(c.paragraphs[0].runs[0], size=8.8, bold=(idx == 0))

    add_heading_styled("03. 데스크톱 앱 빠른 시작 (Quick Start)", 1)
    add_p("1. 설치 파일 다운로드: GitHub 최신 릴리즈(dota-pilot1/pkt-study-fullstack/releases/latest)에서 OS별 설치 파일(.dmg, .exe, .msi)을 내려받습니다.", size=9.5, after=2)
    add_p("2. 앱 실행 및 탐색: 앱 실행 시 내장된 기준 SQLite 시드가 자동 로드되어 샘플 노트와 MES 예제를 즉시 열람할 수 있습니다.", size=9.5, after=2)
    add_p("3. 로컬 데이터 보존: 모든 문서는 사용자 PC 로컬 디스크에 저장되며, 앱 내 설정 메뉴에서 1클릭 백업 및 복원이 지원됩니다.", size=9.5, after=0)

    # ===== PAGE 2 =====
    doc.add_page_break()
    add_heading_styled("04. 로컬 소스 코드 개발 환경 구동법", 1)
    add_p("개발자가 저장소를 클론한 후 각 모듈을 독립적으로 구동하고 디버깅하는 절차입니다.", size=9.5, after=4)

    add_p("💻 (1) 티키타카 데스크톱 앱 구동 (Next.js + Tauri)", size=10, bold=True, color=NAVY, after=1)
    add_p("cd tikitaka-note/pkt-study-fullstack && npm install && npm run tauri dev", size=9, bold=True, color=BLUE, after=3)

    add_p("☕ (2) MES 백엔드 서버 구동 (Spring Boot 3 + Java 21)", size=10, bold=True, color=NAVY, after=1)
    add_p("cd mes-prototype-server && cp .env.example .env && ./gradlew bootRun (포트 4101)", size=9, bold=True, color=BLUE, after=3)

    add_p("🌐 (3) MES 프론트엔드 프로토타입 구동 (Next.js 16 App Router)", size=10, bold=True, color=NAVY, after=1)
    add_p("cd mes-prototype-front && npm install && npm run dev (포트 4100)", size=9, bold=True, color=BLUE, after=3)

    add_p("🧪 (4) 프론트엔드 단위 실습 랩 (Prac-Labs)", size=10, bold=True, color=NAVY, after=1)
    add_p("cd prac-front/prac-zustand (또는 prac-tanstack-query) && npm install && npm run dev", size=9, bold=True, color=BLUE, after=6)

    add_heading_styled("05. 핵심 기능: 구조화된 지식 & 리치 에디터", 1)
    add_p("• 3단계 계층 분류 (Space → Category → Topic → Document): 복잡한 개발 지식을 체계적으로 분류합니다. 하나의 큰 개발 태스크를 본문 문서로 두고, API 구현과 프론트엔드 구현을 하위 자식 문서로 분할하여 복잡도를 낮춥니다.", size=9.5, after=3)
    add_p("• 차세대 Lexical 리치 에디터: 마크다운 단축키, 코드 블록 구문 강조, 아키텍처를 표현하는 Mermaid 다이어그램, 수학 수식(KaTeX)을 자유롭게 조합하여 전문적인 개발 문서를 작성합니다.", size=9.5, after=3)
    add_p("• 라이브 컴포넌트 프리뷰: 문서 본문 내에서 실제 동작하는 React 버튼, 인풋, 모달 UI를 직접 렌더링하고 클릭할 수 있으며, Ag-Grid 기반 LOT 목록 및 상세 서랍(Drawer)을 실시간으로 조작하며 대조 학습합니다.", size=9.5, after=6)

    add_heading_styled("06. LLM Agent API 연동 및 자동 문서화", 1)
    add_callout_box("🤖 데스크톱 앱 내장 'API for LLM' 지원",
                    "티키타카 노트는 데스크톱 앱 자체에 로컬 HTTP API 엔드포인트를 제공합니다. 외부 AI 코딩 에이전트(Antigravity, Claude, Codex 등)는 이 API를 호출하여 현재 화면의 문서 트리를 조회하고, 새롭게 구현된 코드와 검증 결과를 자동으로 노트에 기록합니다.")

    add_p("• 트리/토픽 위치 확인: GET /api/topics, GET /api/tree 를 통해 현재 작업 중인 계층 위치를 확인하고 오작성을 방지합니다.", size=9.2, after=2)
    add_p("• 학습 노트 자동 생성: POST /api/documents 를 통해 구현 내역, 코드 블록, 테스트 결과를 본문 및 하위 문서로 자동 등록합니다.", size=9.2, after=2)
    add_p("• 과거 지식 재참조: GET /api/documents/{id} 를 통해 과거 유사 구현 노트나 팀 컨벤션을 불러와 새 작업에 주입합니다.", size=9.2, after=0)

    # ===== PAGE 3 =====
    doc.add_page_break()
    add_heading_styled("07. 핵심 실행 루프: 5단계 엔지니어링 사이클", 1)
    add_p("티키타카 노트가 제안하는 Agent Engineering의 핵심은 '공부하고, 만들고, 확인하고, 적고, 다시 쓰는' 5단계의 끊임없는 반복입니다.", size=9.5, after=4)

    add_p("① 배운다 (Study): 기술 원리와 데이터 흐름(입력→처리→저장→출력)을 먼저 파악하고 작업의 완료 조건을 명확히 정의합니다.", size=9.2, after=2)
    add_p("② 만든다 (Build): 큰 기능을 한 번에 맡기지 않고 검증 가능한 작은 단위(Small Batch)로 나누어 Agent와 단계별 구현합니다.", size=9.2, after=2)
    add_p("③ 확인한다 (Verify): 생성된 코드를 맹신하지 않고 린트, 빌드, 단위 테스트, 화면 동작을 개발자가 직접 검증합니다.", size=9.2, after=2)
    add_p("④ 적는다 (Record): 설계 이유, 해결한 난관, 실패했던 시도와 트레이드오프를 티키타카 노트에 구조화하여 기록합니다.", size=9.2, after=2)
    add_p("⑤ 다시 쓴다 (Reuse): 기록된 노트를 다음 작업 시 Agent의 프롬프트와 컨텍스트로 제공하여 일관성을 유지합니다.", size=9.2, after=6)

    add_heading_styled("08. 실패를 줄이는 Agent 협업 3대 수칙", 1)
    add_p("• 수칙 1. 작은 배치 원칙: 1회 요청에 하나의 명확한 동작과 완료 조건만 부여합니다. 범위가 작을수록 개발자의 이해도가 유지되고 Agent의 환각(Hallucination)이 억제됩니다.", size=9.2, after=2)
    add_p("• 수칙 2. 실패한 시도 기록: 성공한 코드뿐 아니라 '어떤 시도가 왜 실패했는지'를 반드시 남깁니다. 같은 실수를 방지하는 최고의 팀 자산입니다.", size=9.2, after=2)
    add_p("• 수칙 3. 축적된 지식 주입: 새 작업을 시작할 때 팀의 프로젝트 규칙, API 명세, 기존 레퍼런스 노트를 Agent에게 먼저 전달합니다.", size=9.2, after=6)

    add_heading_styled("09. 데이터 관리 및 릴리즈 운영 원칙", 1)
    add_p("• SQLite 기준 시드(Seed) 동기화: Tauri 릴리즈 시 .data/pkt-study.db를 패키징에 포함하며, 버전 변경 시 사용자 기존 DB는 .before-seed-sync 백업을 남긴 후 안전하게 교체합니다.", size=9.2, after=2)
    add_p("• 온보딩 테스트 환경: https://api.hibot-docu.com (Spring Boot + Postgres)은 온보딩·학습용 슬롯이므로 샘플 시더 가동 및 데이터 초기화가 상시 가능합니다.", size=9.2, after=2)
    add_p("• API 계약 선(先)배포 원칙: Swagger(/v3/api-docs)를 통해 백엔드 API 계약 변경을 먼저 배포·검증한 후 프론트엔드를 배포하여 파라미터 불일치를 방지합니다.", size=9.2, after=6)

    add_heading_styled("10. 프로젝트 공식 리소스 및 저장소 안내", 1)
    add_callout_box("🔗 공식 저장소 및 릴리즈 링크",
                    "• 소스 코드 저장소: https://github.com/dota-pilot1/sample-pkt-project\n"
                    "• 데스크톱 앱 릴리즈: https://github.com/dota-pilot1/pkt-study-fullstack/releases\n"
                    "• 기술 문의 및 이슈: https://github.com/dota-pilot1/pkt-study-fullstack/issues")

    add_p("학습 50 + 툴링 50 = 지속 가능한 소프트웨어 엔지니어링", size=12, bold=True, color=NAVY, align=WD_ALIGN_PARAGRAPH.CENTER, before=6, after=2)
    add_p("사람이 공부하고, Agent와 만들고, 사람이 확인하고, 결과를 적는다. 그리고 다음 작업에서 다시 쓴다.", size=9.5, color=MUTED, align=WD_ALIGN_PARAGRAPH.CENTER, after=0)

    doc.save(DOCX_PATH)
    print(f"Generated DOCX: {DOCX_PATH}")


def convert_html_to_pdf():
    chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if not Path(chrome_bin).exists():
        print("Chrome not found for HTML conversion.")
        return False
    cmd = [
        chrome_bin,
        "--headless=new",
        "--disable-gpu",
        f"--print-to-pdf={PDF_PATH}",
        "--no-pdf-header-footer",
        str(HTML_PATH)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and PDF_PATH.exists():
        print(f"Converted HTML to PDF: {PDF_PATH} ({PDF_PATH.stat().st_size} bytes)")
        return True
    else:
        print(f"Chrome PDF conversion error: {res.stderr}")
        return False


if __name__ == "__main__":
    generate_html()
    generate_docx()
    success = convert_html_to_pdf()
    if not success:
        soffice = "/Users/terecal/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/libreoffice-headless/libreoffice/LibreOfficeDev.app/Contents/MacOS/soffice"
        fonts_conf = ROOT / "tmp/document-build/fonts.conf"
        env = os.environ.copy()
        env["FONTCONFIG_FILE"] = str(fonts_conf)
        subprocess.run([soffice, "--headless", "--convert-to", "pdf", "--outdir", str(OUTPUT_PDF), str(DOCX_PATH)], env=env)
