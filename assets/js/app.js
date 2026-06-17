/* ════════════════════════════════════════════════════════════════
 * 친구야 놀자! — 클라이언트 인터랙션
 * 폰트 스케일 토글 / 모달 / 카테고리 필터 / 모바일 메뉴 / 스크롤 reveal
 * ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // 1) 글자 크기 토글 (시니어 친화)
  // ──────────────────────────────────────────────
  const SCALE_KEY = 'cy_font_scale';
  const fontButtons = document.querySelectorAll('.font-toggle button');
  const savedScale = localStorage.getItem(SCALE_KEY) || '1';
  applyScale(savedScale);

  fontButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const scale = btn.dataset.scale;
      applyScale(scale);
      localStorage.setItem(SCALE_KEY, scale);
    });
  });

  function applyScale(scale) {
    document.documentElement.style.setProperty('--scale', scale);
    fontButtons.forEach((b) => {
      b.classList.toggle('is-active', b.dataset.scale === scale);
    });
  }

  // ──────────────────────────────────────────────
  // 2) 모바일 메뉴
  // ──────────────────────────────────────────────
  const $hamburger = document.getElementById('hamburger-btn');
  const $mobileMenu = document.getElementById('mobile-menu');
  const $mobileOverlay = document.getElementById('mobile-overlay');
  const $mobileClose = document.getElementById('mobile-close-btn');

  function openMobile() {
    $mobileMenu.classList.add('is-open');
    $mobileOverlay.classList.add('is-open');
  }
  function closeMobile() {
    $mobileMenu.classList.remove('is-open');
    $mobileOverlay.classList.remove('is-open');
  }

  $hamburger?.addEventListener('click', openMobile);
  $mobileClose?.addEventListener('click', closeMobile);
  $mobileOverlay?.addEventListener('click', closeMobile);
  $mobileMenu?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', closeMobile)
  );

  // ──────────────────────────────────────────────
  // 3) 토스트
  // ──────────────────────────────────────────────
  const $toast = document.getElementById('toast');
  let toastTimer;
  function toast(msg) {
    if (!$toast) return;
    clearTimeout(toastTimer);
    $toast.textContent = msg;
    $toast.classList.add('is-shown');
    toastTimer = setTimeout(() => $toast.classList.remove('is-shown'), 2400);
  }

  // ──────────────────────────────────────────────
  // 4) 모달 시스템
  // ──────────────────────────────────────────────
  const $overlay = document.getElementById('modal-overlay');
  const $card = document.getElementById('modal-card');

  function openModal(html, onMount) {
    $card.innerHTML = html;
    $overlay.classList.add('is-open');
    $overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    $card.querySelectorAll('[data-close]').forEach((b) =>
      b.addEventListener('click', closeModal)
    );

    if (typeof onMount === 'function') onMount($card);

    setTimeout(() => {
      const focusEl = $card.querySelector('input,button:not([data-close])');
      if (focusEl) focusEl.focus();
    }, 50);
  }
  function closeModal() {
    $overlay.classList.remove('is-open');
    $overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    $card.innerHTML = '';
  }

  $overlay.addEventListener('click', (e) => {
    if (e.target === $overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $overlay.classList.contains('is-open')) closeModal();
  });

  // ── 모달 트리거 ──
  document.querySelectorAll('[data-modal]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const which = el.dataset.modal;
      if (which === 'login') openLoginModal();
      else if (which === 'signup') openSignupModal();
      else if (which === 'host') openHostModal();
    });
  });

  // ── 모달 템플릿 ──
  const closeBtn = '<button class="modal-close" data-close aria-label="닫기">✕</button>';

  function openLoginModal() {
    openModal(
      closeBtn +
      '<h3>다시 만나서 반가워요 👋</h3>' +
      '<p class="modal-sub">아지트로 들어가시려면 로그인이 필요합니다.</p>' +
      '<form id="cy-login">' +
        '<div class="field-group"><label>이메일</label>' +
          '<input class="field" type="email" name="email" required placeholder="you@example.com"></div>' +
        '<div class="field-group"><label>비밀번호</label>' +
          '<input class="field" type="password" name="password" required minlength="4" placeholder="••••••••"></div>' +
        '<button type="submit" class="btn-primary" style="width:100%;margin-top:8px;">로그인</button>' +
      '</form>' +
      '<p style="text-align:center;margin-top:18px;font-size:0.85rem;color:var(--c-soil-soft);">처음이신가요? <a href="#" data-go-signup style="color:var(--c-sunset-deep);font-weight:600;">가입하기</a></p>',
      (root) => {
        root.querySelector('#cy-login').addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const email = (fd.get('email') || '').toString();
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('이메일 형식이 올바르지 않아요.');
          closeModal();
          toast(email + ' 으로 로그인되었습니다 (데모)');
        });
        root.querySelector('[data-go-signup]')?.addEventListener('click', (e) => {
          e.preventDefault();
          closeModal();
          setTimeout(openSignupModal, 80);
        });
      }
    );
  }

  function openSignupModal() {
    openModal(
      closeBtn +
      '<h3>아지트의 친구가 되어주세요 🍂</h3>' +
      '<p class="modal-sub">가입 후 본인인증으로 안전한 만남을 시작합니다.</p>' +
      '<form id="cy-signup">' +
        '<div class="field-group"><label>이름</label>' +
          '<input class="field" type="text" name="name" required></div>' +
        '<div class="field-group"><label>이메일</label>' +
          '<input class="field" type="email" name="email" required placeholder="you@example.com"></div>' +
        '<div class="field-group"><label>휴대폰</label>' +
          '<input class="field" type="tel" name="phone" required placeholder="010-0000-0000"></div>' +
        '<div class="field-group"><label>연령 트랙</label>' +
          '<select class="field" name="track" required>' +
            '<option value="">선택해 주세요</option>' +
            '<option value="young">미혼남녀 룸 (20~30대)</option>' +
            '<option value="4050">4050 룸</option>' +
            '<option value="senior">시니어 룸 (60대 이상)</option>' +
          '</select></div>' +
        '<label style="display:flex;gap:8px;align-items:flex-start;font-size:0.82rem;color:var(--c-soil-soft);margin:14px 0;">' +
          '<input type="checkbox" required style="margin-top:3px;"> <span><strong style="color:var(--c-soil)">[필수]</strong> 이용약관·개인정보 처리방침에 동의합니다.</span></label>' +
        '<button type="submit" class="btn-primary" style="width:100%;">PASS 본인인증으로 진행</button>' +
      '</form>',
      (root) => {
        root.querySelector('#cy-signup').addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const name = (fd.get('name') || '').toString().trim();
          const track = fd.get('track');
          if (!name) return toast('이름을 입력해 주세요.');
          if (!track) return toast('연령 트랙을 선택해 주세요.');
          closeModal();
          toast(name + ' 님, 가입이 완료됐어요. 본인인증 페이지로 이동합니다.');
        });
      }
    );
  }

  function openHostModal() {
    openModal(
      closeBtn +
      '<h3>아지트지기로 시작하기 🏕</h3>' +
      '<p class="modal-sub">당신의 경험으로 사람을 모으는 4단계 — 5분이면 충분합니다.</p>' +
      '<div class="host-steps">' +
        '<div class="host-step"><span class="num">1</span><div class="body"><strong>회원가입 + 본인인증</strong><span>실명·휴대폰 인증으로 신원을 보장합니다.</span></div></div>' +
        '<div class="host-step"><span class="num">2</span><div class="body"><strong>호스트 신청서 제출</strong><span>활동 분야·자기소개·정산 계좌 등록 (사업자 아니어도 가능).</span></div></div>' +
        '<div class="host-step"><span class="num">3</span><div class="body"><strong>운영진 자격 검증</strong><span>영업일 기준 1~2일 내 검토 → 승인 시 호스트 자격 부여.</span></div></div>' +
        '<div class="host-step"><span class="num">4</span><div class="body"><strong>모임 개설 → 정산</strong><span>모임 종료 + 24h 분쟁 대기 후 D+3 영업일 자동 입금.</span></div></div>' +
      '</div>' +
      '<div style="background:var(--c-mist);border-radius:14px;padding:14px 16px;font-size:0.85rem;color:var(--c-soil-soft);margin-bottom:18px;line-height:1.7;">' +
        '<strong style="color:var(--c-sunset-deep);">💡 평판 차등 수수료</strong><br>' +
        '시작은 12% / 우수 호스트 9% / <strong>안심 동행 마크 보유 시 6%</strong>' +
      '</div>' +
      '<button class="btn-primary" data-go-signup style="width:100%;">지금 호스트 신청하기</button>',
      (root) => {
        root.querySelector('[data-go-signup]')?.addEventListener('click', () => {
          closeModal();
          setTimeout(openSignupModal, 80);
        });
      }
    );
  }

  // ──────────────────────────────────────────────
  // 5) 카테고리 필터 (놀이마켓)
  // ──────────────────────────────────────────────
  const catCards = document.querySelectorAll('.cat-card');
  const eventCards = document.querySelectorAll('#event-grid .event-card');

  catCards.forEach((cat) => {
    cat.addEventListener('click', (e) => {
      e.preventDefault();
      const target = cat.dataset.cat;
      catCards.forEach((c) => c.style.borderColor = c.dataset.cat === target ? 'var(--c-sunset)' : 'transparent');
      eventCards.forEach((card) => {
        const cats = (card.dataset.cat || '').split(/\s+/);
        const visible = target === 'all' || cats.includes(target);
        card.style.display = visible ? '' : 'none';
      });
      // 결과 영역으로 스크롤
      const grid = document.getElementById('event-grid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ──────────────────────────────────────────────
  // 6) 스크롤 reveal
  // ──────────────────────────────────────────────
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // ──────────────────────────────────────────────
  // 7) 부드러운 앵커 스크롤
  // ──────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ──────────────────────────────────────────────
  // 8) 시니어 친화 음성 안내 (간단한 TTS 데모)
  //    — 시니어 트랙 가입자에 대한 미리보기
  // ──────────────────────────────────────────────
  // 글자 크기를 1.3 (큰 크기) 로 처음 바꿀 때 한 번 안내
  let voicePromptedKey = 'cy_voice_prompt_v1';
  fontButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.scale === '1.3' && !localStorage.getItem(voicePromptedKey)) {
        localStorage.setItem(voicePromptedKey, '1');
        toast('큰 글자 모드 — 시니어 트랙에서는 음성 안내가 자동 활성화됩니다.');
      }
    });
  });
})();
