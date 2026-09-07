/**
 * TASK-012/TASK-014/TASK-015 — wspólne i18n + cookie consent dla bike-pilot
 * (REQ-019/REQ-021/REQ-022). Bez zależności zewnętrznych.
 */

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_COOKIE_NAME = "bp_lang";
export const CONSENT_COOKIE_NAME = "bp_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const SUPPORTED_LANGUAGES = [
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "cs", label: "Čeština", dir: "ltr" },
  { code: "da", label: "Dansk", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "nb", label: "Norsk bokmål", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "pl", label: "Polski", dir: "ltr" },
  { code: "pt-PT", label: "Português (Portugal)", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "sv", label: "Svenska", dir: "ltr" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
  { code: "uk", label: "Українська", dir: "ltr" },
  { code: "zh-Hans", label: "简体中文", dir: "ltr" },
];

const EXACT_LOOKUP = new Map(
  SUPPORTED_LANGUAGES.map((language) => [language.code.toLowerCase(), language.code])
);
const PREFIX_LOOKUP = new Map(
  SUPPORTED_LANGUAGES.map((language) => [language.code.split("-")[0].toLowerCase(), language.code])
);

const UI_TRANSLATIONS = {
  ar: {
    languageLabel: "اللغة",
    formalKicker: "المستندات الرسمية",
    formalSummary: "اختر اللغة المفضلة لديك لقراءة أحدث محتوى رسمي لتطبيق Bike Pilot.",
    loading: "جارٍ تحميل المحتوى…",
    errorTitle: "تعذر تحميل هذا المستند.",
    errorHint: "يرجى تحديث الصفحة أو المحاولة مرة أخرى بعد قليل.",
    homeLabel: "الصفحة الرئيسية",
    navHome: "الرئيسية",
    navPrivacy: "سياسة الخصوصية",
    navTerms: "شروط الاستخدام",
    navSupport: "الدعم",
    versionLabel: "الإصدار",
    footerNote: "Bike Pilot — مستندات ودعم رسمي.",
    consentTitle: "ملفات تعريف الارتباط الخاصة باللغة",
    consentMessage:
      "نستخدم ملف تعريف ارتباط واحدًا فقط لتذكر اللغة التي تختارها لهذه الصفحات. لن يتم حفظ هذا التفضيل قبل موافقتك.",
    consentAccept: "موافق"
  },
  cs: {
    languageLabel: "Jazyk",
    formalKicker: "Oficiální dokumenty",
    formalSummary: "Vyberte preferovaný jazyk pro čtení nejnovějšího obsahu Bike Pilot.",
    loading: "Načítání obsahu…",
    errorTitle: "Tento dokument se nepodařilo načíst.",
    errorHint: "Obnovte stránku nebo to zkuste znovu později.",
    homeLabel: "Domů",
    navHome: "Domů",
    navPrivacy: "Zásady ochrany osobních údajů",
    navTerms: "Podmínky používání",
    navSupport: "Podpora",
    versionLabel: "Verze",
    footerNote: "Bike Pilot — oficiální dokumenty a podpora.",
    consentTitle: "Jazykové cookies",
    consentMessage:
      "Používáme pouze jeden soubor cookie k zapamatování jazyka zvoleného pro tyto stránky. Tato preference se neuloží bez vašeho souhlasu.",
    consentAccept: "Rozumím"
  },
  da: {
    languageLabel: "Sprog",
    formalKicker: "Officielle dokumenter",
    formalSummary: "Vælg dit foretrukne sprog for at læse det nyeste officielle Bike Pilot-indhold.",
    loading: "Indlæser indhold…",
    errorTitle: "Dokumentet kunne ikke indlæses.",
    errorHint: "Opdatér siden, eller prøv igen senere.",
    homeLabel: "Forside",
    navHome: "Forside",
    navPrivacy: "Privatlivspolitik",
    navTerms: "Brugsvilkår",
    navSupport: "Support",
    versionLabel: "Version",
    footerNote: "Bike Pilot — officielle dokumenter og support.",
    consentTitle: "Sprog-cookies",
    consentMessage:
      "Vi bruger kun én cookie til at huske det sprog, du vælger til disse sider. Denne præference gemmes ikke, før du accepterer.",
    consentAccept: "Accepter"
  },
  de: {
    languageLabel: "Sprache",
    formalKicker: "Offizielle Dokumente",
    formalSummary: "Wählen Sie Ihre bevorzugte Sprache, um die aktuellen offiziellen Bike-Pilot-Inhalte zu lesen.",
    loading: "Inhalte werden geladen…",
    errorTitle: "Dieses Dokument konnte nicht geladen werden.",
    errorHint: "Bitte aktualisieren Sie die Seite oder versuchen Sie es später erneut.",
    homeLabel: "Startseite",
    navHome: "Start",
    navPrivacy: "Datenschutzerklärung",
    navTerms: "Nutzungsbedingungen",
    navSupport: "Support",
    versionLabel: "Version",
    footerNote: "Bike Pilot — offizielle Dokumente und Support.",
    consentTitle: "Sprach-Cookies",
    consentMessage:
      "Wir verwenden nur ein Cookie, um die Sprache zu speichern, die Sie für diese Seiten auswählen. Diese Einstellung wird erst nach Ihrer Zustimmung gespeichert.",
    consentAccept: "Zustimmen"
  },
  en: {
    languageLabel: "Language",
    formalKicker: "Official documents",
    formalSummary: "Choose your preferred language to read the latest official Bike Pilot content.",
    loading: "Loading content…",
    errorTitle: "This document could not be loaded.",
    errorHint: "Please refresh the page or try again in a moment.",
    homeLabel: "Home",
    navHome: "Home",
    navPrivacy: "Privacy Policy",
    navTerms: "Terms of Use",
    navSupport: "Support",
    versionLabel: "Version",
    footerNote: "Bike Pilot — official documents and support.",
    consentTitle: "Language cookies",
    consentMessage:
      "We use one cookie only to remember the language you choose for these pages. That preference is not stored before you accept.",
    consentAccept: "Accept"
  },
  es: {
    languageLabel: "Idioma",
    formalKicker: "Documentos oficiales",
    formalSummary: "Elige tu idioma preferido para leer el contenido oficial más reciente de Bike Pilot.",
    loading: "Cargando contenido…",
    errorTitle: "No se pudo cargar este documento.",
    errorHint: "Actualiza la página o inténtalo de nuevo en un momento.",
    homeLabel: "Inicio",
    navHome: "Inicio",
    navPrivacy: "Política de privacidad",
    navTerms: "Términos de uso",
    navSupport: "Soporte",
    versionLabel: "Versión",
    footerNote: "Bike Pilot — documentos oficiales y soporte.",
    consentTitle: "Cookies de idioma",
    consentMessage:
      "Usamos una sola cookie para recordar el idioma que eliges para estas páginas. Esa preferencia no se guarda antes de que la aceptes.",
    consentAccept: "Aceptar"
  },
  fr: {
    languageLabel: "Langue",
    formalKicker: "Documents officiels",
    formalSummary: "Choisissez votre langue préférée pour lire le contenu officiel le plus récent de Bike Pilot.",
    loading: "Chargement du contenu…",
    errorTitle: "Impossible de charger ce document.",
    errorHint: "Actualisez la page ou réessayez dans un instant.",
    homeLabel: "Accueil",
    navHome: "Accueil",
    navPrivacy: "Politique de confidentialité",
    navTerms: "Conditions d’utilisation",
    navSupport: "Assistance",
    versionLabel: "Version",
    footerNote: "Bike Pilot — documents officiels et assistance.",
    consentTitle: "Cookies de langue",
    consentMessage:
      "Nous utilisons un seul cookie pour mémoriser la langue choisie pour ces pages. Cette préférence n’est pas enregistrée avant votre accord.",
    consentAccept: "Accepter"
  },
  it: {
    languageLabel: "Lingua",
    formalKicker: "Documenti ufficiali",
    formalSummary: "Scegli la lingua che preferisci per leggere i contenuti ufficiali più recenti di Bike Pilot.",
    loading: "Caricamento dei contenuti…",
    errorTitle: "Impossibile caricare questo documento.",
    errorHint: "Aggiorna la pagina o riprova tra poco.",
    homeLabel: "Home",
    navHome: "Home",
    navPrivacy: "Informativa sulla privacy",
    navTerms: "Termini di utilizzo",
    navSupport: "Supporto",
    versionLabel: "Versione",
    footerNote: "Bike Pilot — documenti ufficiali e supporto.",
    consentTitle: "Cookie lingua",
    consentMessage:
      "Usiamo un solo cookie per ricordare la lingua scelta per queste pagine. Questa preferenza non viene salvata prima del tuo consenso.",
    consentAccept: "Accetta"
  },
  ja: {
    languageLabel: "言語",
    formalKicker: "公式ドキュメント",
    formalSummary: "最新の Bike Pilot 公式コンテンツを読むための言語を選択してください。",
    loading: "コンテンツを読み込み中…",
    errorTitle: "このドキュメントを読み込めませんでした。",
    errorHint: "ページを再読み込みするか、しばらくしてからもう一度お試しください。",
    homeLabel: "ホーム",
    navHome: "ホーム",
    navPrivacy: "プライバシーポリシー",
    navTerms: "利用規約",
    navSupport: "サポート",
    versionLabel: "バージョン",
    footerNote: "Bike Pilot — 公式ドキュメントとサポート。",
    consentTitle: "言語 Cookie",
    consentMessage:
      "これらのページで選択した言語を記憶するために、1 つの Cookie のみを使用します。承認されるまでこの設定は保存されません。",
    consentAccept: "同意する"
  },
  ko: {
    languageLabel: "언어",
    formalKicker: "공식 문서",
    formalSummary: "최신 Bike Pilot 공식 콘텐츠를 읽을 선호 언어를 선택하세요.",
    loading: "콘텐츠를 불러오는 중…",
    errorTitle: "이 문서를 불러올 수 없습니다.",
    errorHint: "페이지를 새로 고치거나 잠시 후 다시 시도해 주세요.",
    homeLabel: "홈",
    navHome: "홈",
    navPrivacy: "개인정보 처리방침",
    navTerms: "이용약관",
    navSupport: "지원",
    versionLabel: "버전",
    footerNote: "Bike Pilot — 공식 문서 및 지원.",
    consentTitle: "언어 쿠키",
    consentMessage:
      "이 페이지에서 선택한 언어를 기억하기 위해 쿠키 하나만 사용합니다. 동의 전에는 이 설정이 저장되지 않습니다.",
    consentAccept: "동의"
  },
  nb: {
    languageLabel: "Språk",
    formalKicker: "Offisielle dokumenter",
    formalSummary: "Velg ønsket språk for å lese det nyeste offisielle Bike Pilot-innholdet.",
    loading: "Laster inn innhold…",
    errorTitle: "Dette dokumentet kunne ikke lastes inn.",
    errorHint: "Oppdater siden eller prøv igjen om litt.",
    homeLabel: "Hjem",
    navHome: "Hjem",
    navPrivacy: "Personvernerklæring",
    navTerms: "Bruksvilkår",
    navSupport: "Brukerstøtte",
    versionLabel: "Versjon",
    footerNote: "Bike Pilot — offisielle dokumenter og support.",
    consentTitle: "Språk-cookies",
    consentMessage:
      "Vi bruker bare én cookie for å huske språket du velger for disse sidene. Denne preferansen lagres ikke før du godtar.",
    consentAccept: "Godta"
  },
  nl: {
    languageLabel: "Taal",
    formalKicker: "Officiële documenten",
    formalSummary: "Kies je voorkeurstaal om de nieuwste officiële Bike Pilot-inhoud te lezen.",
    loading: "Inhoud laden…",
    errorTitle: "Dit document kon niet worden geladen.",
    errorHint: "Vernieuw de pagina of probeer het zo opnieuw.",
    homeLabel: "Start",
    navHome: "Start",
    navPrivacy: "Privacybeleid",
    navTerms: "Gebruiksvoorwaarden",
    navSupport: "Ondersteuning",
    versionLabel: "Versie",
    footerNote: "Bike Pilot — officiële documenten en support.",
    consentTitle: "Taalcookies",
    consentMessage:
      "We gebruiken slechts één cookie om de taal te onthouden die je voor deze pagina’s kiest. Deze voorkeur wordt pas opgeslagen nadat je akkoord bent gegaan.",
    consentAccept: "Accepteren"
  },
  pl: {
    languageLabel: "Język",
    formalKicker: "Dokumenty oficjalne",
    formalSummary: "Wybierz preferowany język, aby czytać najnowsze oficjalne treści Bike Pilot.",
    loading: "Ładowanie treści…",
    errorTitle: "Nie udało się załadować tego dokumentu.",
    errorHint: "Odśwież stronę lub spróbuj ponownie za chwilę.",
    homeLabel: "Strona główna",
    navHome: "Start",
    navPrivacy: "Polityka prywatności",
    navTerms: "Warunki korzystania",
    navSupport: "Wsparcie",
    versionLabel: "Wersja",
    footerNote: "Bike Pilot — oficjalne dokumenty i wsparcie.",
    consentTitle: "Pliki cookie języka",
    consentMessage:
      "Używamy tylko jednego pliku cookie, aby zapamiętać język wybrany dla tych stron. To ustawienie nie jest zapisywane przed Twoją zgodą.",
    consentAccept: "Akceptuję"
  },
  "pt-PT": {
    languageLabel: "Idioma",
    formalKicker: "Documentos oficiais",
    formalSummary: "Escolha o seu idioma preferido para ler o conteúdo oficial mais recente do Bike Pilot.",
    loading: "A carregar conteúdo…",
    errorTitle: "Não foi possível carregar este documento.",
    errorHint: "Atualize a página ou tente novamente dentro de instantes.",
    homeLabel: "Início",
    navHome: "Início",
    navPrivacy: "Política de Privacidade",
    navTerms: "Termos de Utilização",
    navSupport: "Suporte",
    versionLabel: "Versão",
    footerNote: "Bike Pilot — documentos oficiais e suporte.",
    consentTitle: "Cookies de idioma",
    consentMessage:
      "Utilizamos apenas um cookie para memorizar o idioma que escolher para estas páginas. Essa preferência não é guardada antes do seu consentimento.",
    consentAccept: "Aceitar"
  },
  ru: {
    languageLabel: "Язык",
    formalKicker: "Официальные документы",
    formalSummary: "Выберите предпочитаемый язык, чтобы читать актуальные официальные материалы Bike Pilot.",
    loading: "Загрузка содержимого…",
    errorTitle: "Не удалось загрузить этот документ.",
    errorHint: "Обновите страницу или повторите попытку позже.",
    homeLabel: "Главная",
    navHome: "Главная",
    navPrivacy: "Политика конфиденциальности",
    navTerms: "Условия использования",
    navSupport: "Поддержка",
    versionLabel: "Версия",
    footerNote: "Bike Pilot — официальные документы и поддержка.",
    consentTitle: "Языковые cookie",
    consentMessage:
      "Мы используем только один cookie-файл, чтобы запомнить выбранный вами язык для этих страниц. Это предпочтение не сохраняется до вашего согласия.",
    consentAccept: "Принять"
  },
  sv: {
    languageLabel: "Språk",
    formalKicker: "Officiella dokument",
    formalSummary: "Välj önskat språk för att läsa det senaste officiella innehållet från Bike Pilot.",
    loading: "Laddar innehåll…",
    errorTitle: "Det gick inte att läsa in dokumentet.",
    errorHint: "Uppdatera sidan eller försök igen om en stund.",
    homeLabel: "Startsida",
    navHome: "Start",
    navPrivacy: "Integritetspolicy",
    navTerms: "Användarvillkor",
    navSupport: "Support",
    versionLabel: "Version",
    footerNote: "Bike Pilot — officiella dokument och support.",
    consentTitle: "Språkcookies",
    consentMessage:
      "Vi använder endast en cookie för att komma ihåg vilket språk du väljer för dessa sidor. Denna inställning sparas inte innan du godkänner.",
    consentAccept: "Godkänn"
  },
  tr: {
    languageLabel: "Dil",
    formalKicker: "Resmî belgeler",
    formalSummary: "En güncel Bike Pilot resmî içeriğini okumak için tercih ettiğiniz dili seçin.",
    loading: "İçerik yükleniyor…",
    errorTitle: "Bu belge yüklenemedi.",
    errorHint: "Lütfen sayfayı yenileyin veya biraz sonra tekrar deneyin.",
    homeLabel: "Ana sayfa",
    navHome: "Ana sayfa",
    navPrivacy: "Gizlilik Politikası",
    navTerms: "Kullanım Koşulları",
    navSupport: "Destek",
    versionLabel: "Sürüm",
    footerNote: "Bike Pilot — resmî belgeler ve destek.",
    consentTitle: "Dil çerezleri",
    consentMessage:
      "Bu sayfalar için seçtiğiniz dili hatırlamak üzere yalnızca bir çerez kullanıyoruz. Bu tercih, siz onay vermeden önce kaydedilmez.",
    consentAccept: "Kabul et"
  },
  uk: {
    languageLabel: "Мова",
    formalKicker: "Офіційні документи",
    formalSummary: "Оберіть бажану мову, щоб читати найновіший офіційний вміст Bike Pilot.",
    loading: "Завантаження вмісту…",
    errorTitle: "Не вдалося завантажити цей документ.",
    errorHint: "Оновіть сторінку або спробуйте ще раз трохи пізніше.",
    homeLabel: "Головна",
    navHome: "Головна",
    navPrivacy: "Політика конфіденційності",
    navTerms: "Умови користування",
    navSupport: "Підтримка",
    versionLabel: "Версія",
    footerNote: "Bike Pilot — офіційні документи та підтримка.",
    consentTitle: "Мовні cookie",
    consentMessage:
      "Ми використовуємо лише один cookie-файл, щоб запам’ятати мову, яку ви обираєте для цих сторінок. Це налаштування не зберігається до вашої згоди.",
    consentAccept: "Погоджуюся"
  },
  "zh-Hans": {
    languageLabel: "语言",
    formalKicker: "官方文档",
    formalSummary: "选择你偏好的语言，以阅读最新的 Bike Pilot 官方内容。",
    loading: "正在加载内容…",
    errorTitle: "无法加载此文档。",
    errorHint: "请刷新页面，或稍后再试。",
    homeLabel: "首页",
    navHome: "首页",
    navPrivacy: "隐私政策",
    navTerms: "使用条款",
    navSupport: "支持",
    versionLabel: "版本",
    footerNote: "Bike Pilot — 官方文档与支持。",
    consentTitle: "语言 Cookie",
    consentMessage:
      "我们仅使用一个 Cookie 来记住你为这些页面选择的语言。在你同意之前，此偏好不会被保存。",
    consentAccept: "同意"
  }
};

export function normalizeLanguageTag(value) {
  return String(value || "")
    .trim()
    .replace(/_/g, "-");
}

export function resolveSupportedLanguage(value) {
  const normalized = normalizeLanguageTag(value);
  if (!normalized) {
    return null;
  }

  const lowered = normalized.toLowerCase();
  if (EXACT_LOOKUP.has(lowered)) {
    return EXACT_LOOKUP.get(lowered);
  }

  const prefix = lowered.split("-")[0];
  if (PREFIX_LOOKUP.has(prefix)) {
    return PREFIX_LOOKUP.get(prefix);
  }

  return null;
}

export function getLanguageMeta(language) {
  const resolved = resolveSupportedLanguage(language) || DEFAULT_LANGUAGE;
  return SUPPORTED_LANGUAGES.find((entry) => entry.code === resolved) || SUPPORTED_LANGUAGES[4];
}

export function getUiStrings(language) {
  const resolved = resolveSupportedLanguage(language) || DEFAULT_LANGUAGE;
  return UI_TRANSLATIONS[resolved] || UI_TRANSLATIONS[DEFAULT_LANGUAGE];
}

export function getCookie(name, cookieSource) {
  const source =
    typeof cookieSource === "string"
      ? cookieSource
      : typeof document !== "undefined"
        ? document.cookie
        : "";
  const cookies = source ? source.split(/;\s*/) : [];

  for (const part of cookies) {
    if (!part) continue;
    const separatorIndex = part.indexOf("=");
    const key = separatorIndex === -1 ? part : part.slice(0, separatorIndex);
    if (key === name) {
      const rawValue = separatorIndex === -1 ? "" : part.slice(separatorIndex + 1);
      return decodeURIComponent(rawValue);
    }
  }

  return null;
}

export function setCookie(name, value, options = {}, doc = document) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Max-Age=${options.maxAge ?? COOKIE_MAX_AGE}`);
  parts.push(`Path=${options.path ?? "/"}`);
  parts.push(`SameSite=${options.sameSite ?? "Lax"}`);
  if (options.secure) {
    parts.push("Secure");
  }
  doc.cookie = parts.join("; ");
}

export function hasConsent(doc = document) {
  return getCookie(CONSENT_COOKIE_NAME, doc.cookie) === "1";
}

export function grantConsent(doc = document) {
  setCookie(CONSENT_COOKIE_NAME, "1", undefined, doc);
}

export function getLanguageCookie(doc = document) {
  return resolveSupportedLanguage(getCookie(LANGUAGE_COOKIE_NAME, doc.cookie));
}

export function setLanguageCookie(language, doc = document) {
  const resolved = resolveSupportedLanguage(language);
  if (!resolved || !hasConsent(doc)) {
    return false;
  }
  setCookie(LANGUAGE_COOKIE_NAME, resolved, undefined, doc);
  return true;
}

export function detectNavigatorLanguage(nav = navigator) {
  const candidates = Array.isArray(nav?.languages) && nav.languages.length
    ? nav.languages
    : [nav?.language].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = resolveSupportedLanguage(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return DEFAULT_LANGUAGE;
}

export function detectInitialLanguage({ doc = document, nav = navigator } = {}) {
  return getLanguageCookie(doc) || detectNavigatorLanguage(nav) || DEFAULT_LANGUAGE;
}

export function setDocumentLanguage(doc, language) {
  const meta = getLanguageMeta(language);
  doc.documentElement.lang = meta.code;
  doc.documentElement.dir = meta.dir;
}

export function populateLanguageSelect(select, activeLanguage) {
  if (!select) {
    return;
  }

  if (!select.options.length) {
    const optionsMarkup = SUPPORTED_LANGUAGES.map(
      (language) => `<option value="${language.code}">${language.label}</option>`
    ).join("");
    select.innerHTML = optionsMarkup;
  }

  select.value = resolveSupportedLanguage(activeLanguage) || DEFAULT_LANGUAGE;
}

export function updateSharedLabels(doc, language) {
  const ui = getUiStrings(language);
  doc.querySelectorAll("[data-language-label]").forEach((element) => {
    element.textContent = ui.languageLabel;
  });
  doc.querySelectorAll("[data-home-label]").forEach((element) => {
    element.textContent = ui.homeLabel;
  });
  doc.querySelectorAll("[data-formal-kicker]").forEach((element) => {
    element.textContent = ui.formalKicker;
  });
  doc.querySelectorAll("[data-formal-summary]").forEach((element) => {
    element.textContent = ui.formalSummary;
  });
  doc.querySelectorAll("[data-footer-note]").forEach((element) => {
    element.textContent = ui.footerNote;
  });
  doc.querySelectorAll("[data-nav-home]").forEach((element) => {
    element.textContent = ui.navHome;
  });
  doc.querySelectorAll("[data-nav-privacy]").forEach((element) => {
    element.textContent = ui.navPrivacy;
  });
  doc.querySelectorAll("[data-nav-terms]").forEach((element) => {
    element.textContent = ui.navTerms;
  });
  doc.querySelectorAll("[data-nav-support]").forEach((element) => {
    element.textContent = ui.navSupport;
  });
}

export function renderConsentBanner({ doc = document, language = DEFAULT_LANGUAGE, onAccept } = {}) {
  const root = doc.querySelector("[data-consent-root]");
  if (!root) {
    return;
  }

  if (hasConsent(doc)) {
    root.hidden = true;
    root.innerHTML = "";
    return;
  }

  const ui = getUiStrings(language);
  root.hidden = false;
  root.innerHTML = `
    <section class="bp-consent" aria-labelledby="bp-consent-title" aria-live="polite">
      <div class="bp-consent__copy">
        <p class="bp-consent__eyebrow">Bike Pilot</p>
        <h2 id="bp-consent-title">${ui.consentTitle}</h2>
        <p>${ui.consentMessage}</p>
      </div>
      <button class="bp-consent__button" type="button" data-consent-accept>${ui.consentAccept}</button>
    </section>
  `;

  root.querySelector("[data-consent-accept]")?.addEventListener("click", () => {
    grantConsent(doc);
    root.hidden = true;
    root.innerHTML = "";
    onAccept?.();
  });
}
