import type {Locale} from "@/i18n/locales";

export interface AccountCopy {
  title: Record<"login" | "signup" | "forgot" | "reset", string[]>;
  home: string;
  navigation: string;
  login: string;
  signup: string;
  email: string;
  password: string;
  createPassword: string;
  newPassword: string;
  passwordHint: string;
  showPassword: string;
  hidePassword: string;
  forgotPassword: string;
  continue: string;
  createAccount: string;
  sendResetLink: string;
  savePassword: string;
  working: string;
  or: string;
  google: string;
  apple: string;
  alreadyMember: string;
  backToLogin: string;
  resetIntro: string;
  invalidEmail: string;
  invalidPassword: string;
  requiredPassword: string;
  loginError: string;
  signupError: string;
  requestError: string;
  rateLimit: string;
  verificationTitle: string;
  verificationMessage: string;
  resend: string;
  resent: string;
  resetSentTitle: string;
  resetSent: string;
  resetSuccessTitle: string;
  resetSuccess: string;
  resetUnavailable: string;
  invalidReset: string;
  requestNewLink: string;
  contact: string;
  terms: string;
  privacy: string;
  cookies: string;
  legal: string;
}
export const accountCopy: Record<Locale, AccountCopy> = {
  en: {
    title: {
      login: ["A story", "continues."],
      signup: ["A story begins", "with you."],
      forgot: ["A new way", "back in."],
      reset: ["Begin again.", "Securely."],
    },
    home: "Tree of Unity — home",
    navigation: "Account navigation",
    login: "Log in",
    signup: "Sign up",
    email: "Email address",
    password: "Password",
    createPassword: "Create a password",
    newPassword: "New password",
    passwordHint:
      "Use 15–128 characters. A long, unique passphrase works well.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    forgotPassword: "Forgot password?",
    continue: "Continue",
    createAccount: "Create account",
    sendResetLink: "Send reset link",
    savePassword: "Save new password",
    working: "Please wait…",
    or: "or",
    google: "Continue with Google",
    apple: "Continue with Apple",
    alreadyMember: "Already have an account?",
    backToLogin: "Back to log in",
    resetIntro:
      "Enter your email and we’ll send you a link to choose a new password.",
    invalidEmail: "Enter a valid email address.",
    invalidPassword: "Use a password between 15 and 128 characters.",
    requiredPassword: "Enter your password.",
    loginError: "We couldn’t log you in. Check your details and try again.",
    signupError:
      "We couldn’t create the account. Try again, or log in if you already have one.",
    requestError:
      "We couldn’t complete your request. Please try again shortly.",
    rateLimit: "Too many attempts. Please wait a moment and try again.",
    verificationTitle: "Check your email.",
    verificationMessage:
      "If registration can proceed, you’ll receive an email with a link to verify your address. Check your spam folder too.",
    resend: "Send another verification email",
    resent: "If your account needs verification, a new email is on its way.",
    resetSentTitle: "Check your email.",
    resetSent:
      "If an account matches that address, you’ll receive a password reset link. Check your spam folder too.",
    resetSuccessTitle: "Your password is updated.",
    resetSuccess: "Log in with your new password to continue.",
    resetUnavailable:
      "Password recovery is not available yet. Please contact us for help accessing your account.",
    invalidReset:
      "This reset link is invalid or has expired. Request a new link to continue.",
    requestNewLink: "Request a new link",
    contact: "Contact us",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    legal: "Legal information",
  },
  es: {
    title: {
      login: ["Una historia", "continúa."],
      signup: ["Una historia", "empieza contigo."],
      forgot: ["Un camino", "de regreso."],
      reset: ["Empieza de nuevo.", "Con seguridad."],
    },
    home: "Tree of Unity — inicio",
    navigation: "Navegación de la cuenta",
    login: "Iniciar sesión",
    signup: "Registrarse",
    email: "Correo electrónico",
    password: "Contraseña",
    createPassword: "Crea una contraseña",
    newPassword: "Nueva contraseña",
    passwordHint:
      "Usa entre 15 y 128 caracteres. Una frase larga y única funciona bien.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    forgotPassword: "¿Olvidaste la contraseña?",
    continue: "Continuar",
    createAccount: "Crear cuenta",
    sendResetLink: "Enviar enlace",
    savePassword: "Guardar contraseña",
    working: "Un momento…",
    or: "o",
    google: "Continuar con Google",
    apple: "Continuar con Apple",
    alreadyMember: "¿Ya tienes una cuenta?",
    backToLogin: "Volver al inicio de sesión",
    resetIntro:
      "Introduce tu correo y te enviaremos un enlace para elegir una nueva contraseña.",
    invalidEmail: "Introduce una dirección de correo válida.",
    invalidPassword: "Usa una contraseña de entre 15 y 128 caracteres.",
    requiredPassword: "Introduce tu contraseña.",
    loginError:
      "No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.",
    signupError:
      "No pudimos crear la cuenta. Inténtalo de nuevo o inicia sesión si ya tienes una.",
    requestError:
      "No pudimos completar la solicitud. Inténtalo de nuevo en unos momentos.",
    rateLimit:
      "Demasiados intentos. Espera un momento antes de volver a intentarlo.",
    verificationTitle: "Revisa tu correo.",
    verificationMessage:
      "Si el registro puede continuar, recibirás un enlace para verificar tu dirección. Revisa también la carpeta de spam.",
    resend: "Enviar otro correo de verificación",
    resent: "Si tu cuenta necesita verificación, recibirás un nuevo correo.",
    resetSentTitle: "Revisa tu correo.",
    resetSent:
      "Si existe una cuenta con esa dirección, recibirás un enlace para restablecer la contraseña. Revisa también la carpeta de spam.",
    resetSuccessTitle: "Contraseña actualizada.",
    resetSuccess: "Inicia sesión con tu nueva contraseña para continuar.",
    resetUnavailable:
      "La recuperación de contraseñas aún no está disponible. Contáctanos para recibir ayuda con el acceso a tu cuenta.",
    invalidReset:
      "El enlace no es válido o ha caducado. Solicita uno nuevo para continuar.",
    requestNewLink: "Solicitar un nuevo enlace",
    contact: "Contáctanos",
    terms: "Condiciones de uso",
    privacy: "Política de privacidad",
    cookies: "Política de cookies",
    legal: "Información legal",
  },
  "zh-Hans": {
    title: {
      login: ["故事", "仍在继续。"],
      signup: ["故事", "由你开启。"],
      forgot: ["重新找回", "通往账户的路。"],
      reset: ["重新开始。", "安全如初。"],
    },
    home: "Tree of Unity — 首页",
    navigation: "账户导航",
    login: "登录",
    signup: "注册",
    email: "电子邮箱",
    password: "密码",
    createPassword: "设置密码",
    newPassword: "新密码",
    passwordHint: "请使用 15–128 个字符。建议使用较长且独特的密码短语。",
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    forgotPassword: "忘记密码？",
    continue: "继续",
    createAccount: "创建账户",
    sendResetLink: "发送重置链接",
    savePassword: "保存新密码",
    working: "请稍候…",
    or: "或",
    google: "使用 Google 继续",
    apple: "使用 Apple 继续",
    alreadyMember: "已有账户？",
    backToLogin: "返回登录",
    resetIntro: "输入邮箱地址，我们会发送链接，供您设置新密码。",
    invalidEmail: "请输入有效的邮箱地址。",
    invalidPassword: "请使用 15 至 128 个字符的密码。",
    requiredPassword: "请输入密码。",
    loginError: "无法登录。请检查信息后重试。",
    signupError: "无法创建账户。请重试；如果已有账户，请登录。",
    requestError: "无法完成请求。请稍后重试。",
    rateLimit: "尝试次数过多。请稍等片刻后重试。",
    verificationTitle: "请查收邮件。",
    verificationMessage:
      "如果可以继续注册，您将收到验证邮箱地址的链接。也请检查垃圾邮件文件夹。",
    resend: "重新发送验证邮件",
    resent: "如果您的账户需要验证，新邮件将会发送。",
    resetSentTitle: "请查收邮件。",
    resetSent:
      "如果存在与该邮箱匹配的账户，您将收到密码重置链接。也请检查垃圾邮件文件夹。",
    resetSuccessTitle: "密码已更新。",
    resetSuccess: "使用新密码登录以继续。",
    resetUnavailable: "密码找回功能暂未开放。请联系我们，获取账户访问帮助。",
    invalidReset: "此重置链接无效或已过期。请申请新链接以继续。",
    requestNewLink: "申请新链接",
    contact: "联系我们",
    terms: "使用条款",
    privacy: "隐私政策",
    cookies: "Cookie 政策",
    legal: "法律信息",
  },
  "zh-Hant": {
    title: {
      login: ["故事", "仍在繼續。"],
      signup: ["故事", "由你開啟。"],
      forgot: ["重新找回", "通往帳戶的路。"],
      reset: ["重新開始。", "安全如初。"],
    },
    home: "Tree of Unity — 首頁",
    navigation: "帳戶導覽",
    login: "登入",
    signup: "註冊",
    email: "電子郵件",
    password: "密碼",
    createPassword: "設定密碼",
    newPassword: "新密碼",
    passwordHint: "請使用 15–128 個字元。建議使用較長且獨特的密碼片語。",
    showPassword: "顯示密碼",
    hidePassword: "隱藏密碼",
    forgotPassword: "忘記密碼？",
    continue: "繼續",
    createAccount: "建立帳戶",
    sendResetLink: "傳送重設連結",
    savePassword: "儲存新密碼",
    working: "請稍候…",
    or: "或",
    google: "使用 Google 繼續",
    apple: "使用 Apple 繼續",
    alreadyMember: "已有帳戶？",
    backToLogin: "返回登入",
    resetIntro: "輸入電子郵件地址，我們會傳送連結，供您設定新密碼。",
    invalidEmail: "請輸入有效的電子郵件地址。",
    invalidPassword: "請使用 15 至 128 個字元的密碼。",
    requiredPassword: "請輸入密碼。",
    loginError: "無法登入。請檢查資料後重試。",
    signupError: "無法建立帳戶。請重試；如果已有帳戶，請登入。",
    requestError: "無法完成請求。請稍後重試。",
    rateLimit: "嘗試次數過多。請稍等片刻後重試。",
    verificationTitle: "請查收郵件。",
    verificationMessage:
      "如果可以繼續註冊，您將收到驗證電子郵件地址的連結。也請檢查垃圾郵件資料夾。",
    resend: "重新傳送驗證郵件",
    resent: "如果您的帳戶需要驗證，新郵件將會寄出。",
    resetSentTitle: "請查收郵件。",
    resetSent:
      "如果有與該地址相符的帳戶，您將收到密碼重設連結。也請檢查垃圾郵件資料夾。",
    resetSuccessTitle: "密碼已更新。",
    resetSuccess: "使用新密碼登入以繼續。",
    resetUnavailable: "密碼復原功能尚未開放。請聯絡我們，取得帳戶存取協助。",
    invalidReset: "此重設連結無效或已過期。請申請新連結以繼續。",
    requestNewLink: "申請新連結",
    contact: "聯絡我們",
    terms: "使用條款",
    privacy: "隱私權政策",
    cookies: "Cookie 政策",
    legal: "法律資訊",
  },
  fr: {
    title: {
      login: ["L’histoire", "continue."],
      signup: ["L’histoire commence", "avec vous."],
      forgot: ["Un nouveau chemin", "pour revenir."],
      reset: ["Recommencez.", "En toute sécurité."],
    },
    home: "Tree of Unity — accueil",
    navigation: "Navigation du compte",
    login: "Se connecter",
    signup: "S’inscrire",
    email: "Adresse e-mail",
    password: "Mot de passe",
    createPassword: "Créer un mot de passe",
    newPassword: "Nouveau mot de passe",
    passwordHint:
      "Utilisez 15 à 128 caractères. Une phrase longue et unique convient bien.",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    continue: "Continuer",
    createAccount: "Créer un compte",
    sendResetLink: "Envoyer le lien de réinitialisation",
    savePassword: "Enregistrer le nouveau mot de passe",
    working: "Veuillez patienter…",
    or: "ou",
    google: "Continuer avec Google",
    apple: "Continuer avec Apple",
    alreadyMember: "Vous avez déjà un compte ?",
    backToLogin: "Retour à la connexion",
    resetIntro:
      "Saisissez votre e-mail pour recevoir un lien permettant de choisir un nouveau mot de passe.",
    invalidEmail: "Saisissez une adresse e-mail valide.",
    invalidPassword: "Utilisez un mot de passe de 15 à 128 caractères.",
    requiredPassword: "Saisissez votre mot de passe.",
    loginError: "Connexion impossible. Vérifiez vos informations et réessayez.",
    signupError:
      "Impossible de créer le compte. Réessayez ou connectez-vous si vous en avez déjà un.",
    requestError:
      "Impossible de traiter votre demande. Réessayez dans un instant.",
    rateLimit: "Trop de tentatives. Patientez un instant avant de réessayer.",
    verificationTitle: "Consultez vos e-mails.",
    verificationMessage:
      "Si l’inscription peut se poursuivre, vous recevrez un lien pour vérifier votre adresse. Vérifiez aussi vos courriers indésirables.",
    resend: "Renvoyer l’e-mail de vérification",
    resent:
      "Si votre compte doit être vérifié, un nouvel e-mail est en cours d’envoi.",
    resetSentTitle: "Consultez vos e-mails.",
    resetSent:
      "Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation. Vérifiez aussi vos courriers indésirables.",
    resetSuccessTitle: "Votre mot de passe a été mis à jour.",
    resetSuccess:
      "Connectez-vous avec votre nouveau mot de passe pour continuer.",
    resetUnavailable:
      "La récupération du mot de passe n’est pas encore disponible. Contactez-nous pour accéder à votre compte.",
    invalidReset:
      "Ce lien est invalide ou a expiré. Demandez un nouveau lien pour continuer.",
    requestNewLink: "Demander un nouveau lien",
    contact: "Nous contacter",
    terms: "Conditions d’utilisation",
    privacy: "Politique de confidentialité",
    cookies: "Politique relative aux cookies",
    legal: "Informations juridiques",
  },
  de: {
    title: {
      login: ["Eine Geschichte", "geht weiter."],
      signup: ["Eine Geschichte", "beginnt mit Ihnen."],
      forgot: ["Ein neuer Weg", "zurück."],
      reset: ["Neu beginnen.", "Mit Sicherheit."],
    },
    home: "Tree of Unity — Startseite",
    navigation: "Kontonavigation",
    login: "Anmelden",
    signup: "Registrieren",
    email: "E-Mail-Adresse",
    password: "Passwort",
    createPassword: "Passwort erstellen",
    newPassword: "Neues Passwort",
    passwordHint:
      "Verwenden Sie 15–128 Zeichen. Eine lange, einzigartige Passphrase eignet sich gut.",
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort verbergen",
    forgotPassword: "Passwort vergessen?",
    continue: "Weiter",
    createAccount: "Konto erstellen",
    sendResetLink: "Link zum Zurücksetzen senden",
    savePassword: "Neues Passwort speichern",
    working: "Bitte warten…",
    or: "oder",
    google: "Mit Google fortfahren",
    apple: "Mit Apple fortfahren",
    alreadyMember: "Sie haben bereits ein Konto?",
    backToLogin: "Zurück zur Anmeldung",
    resetIntro:
      "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, mit dem Sie ein neues Passwort wählen können.",
    invalidEmail: "Geben Sie eine gültige E-Mail-Adresse ein.",
    invalidPassword: "Verwenden Sie ein Passwort mit 15 bis 128 Zeichen.",
    requiredPassword: "Geben Sie Ihr Passwort ein.",
    loginError:
      "Anmeldung nicht möglich. Prüfen Sie Ihre Angaben und versuchen Sie es erneut.",
    signupError:
      "Das Konto konnte nicht erstellt werden. Versuchen Sie es erneut oder melden Sie sich an, falls Sie bereits eines haben.",
    requestError:
      "Ihre Anfrage konnte nicht bearbeitet werden. Versuchen Sie es in Kürze erneut.",
    rateLimit:
      "Zu viele Versuche. Warten Sie einen Moment und versuchen Sie es erneut.",
    verificationTitle: "Prüfen Sie Ihre E-Mails.",
    verificationMessage:
      "Wenn die Registrierung fortgesetzt werden kann, erhalten Sie eine E-Mail mit einem Bestätigungslink. Prüfen Sie auch Ihren Spamordner.",
    resend: "Bestätigungs-E-Mail erneut senden",
    resent:
      "Falls Ihr Konto bestätigt werden muss, ist eine neue E-Mail unterwegs.",
    resetSentTitle: "Prüfen Sie Ihre E-Mails.",
    resetSent:
      "Falls ein Konto zu dieser Adresse existiert, erhalten Sie einen Link zum Zurücksetzen des Passworts. Prüfen Sie auch Ihren Spamordner.",
    resetSuccessTitle: "Ihr Passwort wurde aktualisiert.",
    resetSuccess:
      "Melden Sie sich mit Ihrem neuen Passwort an, um fortzufahren.",
    resetUnavailable:
      "Die Passwortwiederherstellung ist noch nicht verfügbar. Kontaktieren Sie uns, wenn Sie Hilfe beim Kontozugang benötigen.",
    invalidReset:
      "Dieser Link ist ungültig oder abgelaufen. Fordern Sie einen neuen Link an.",
    requestNewLink: "Neuen Link anfordern",
    contact: "Kontakt",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzerklärung",
    cookies: "Cookie-Richtlinie",
    legal: "Rechtliche Informationen",
  },
  ar: {
    title: {
      login: ["حكاية", "تتواصل."],
      signup: ["حكاية تبدأ", "معك."],
      forgot: ["طريق جديد", "للعودة."],
      reset: ["ابدأ من جديد.", "بأمان."],
    },
    home: "Tree of Unity — الرئيسية",
    navigation: "التنقل في الحساب",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    createPassword: "أنشئ كلمة مرور",
    newPassword: "كلمة المرور الجديدة",
    passwordHint:
      "استخدم من 15 إلى 128 حرفًا. يُفضّل اختيار عبارة مرور طويلة وفريدة.",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    continue: "متابعة",
    createAccount: "إنشاء حساب",
    sendResetLink: "إرسال رابط إعادة التعيين",
    savePassword: "حفظ كلمة المرور الجديدة",
    working: "يرجى الانتظار…",
    or: "أو",
    google: "المتابعة باستخدام Google",
    apple: "المتابعة باستخدام Apple",
    alreadyMember: "لديك حساب بالفعل؟",
    backToLogin: "العودة إلى تسجيل الدخول",
    resetIntro:
      "أدخل بريدك الإلكتروني وسنرسل إليك رابطًا لاختيار كلمة مرور جديدة.",
    invalidEmail: "أدخل عنوان بريد إلكتروني صالحًا.",
    invalidPassword: "استخدم كلمة مرور تتكون من 15 إلى 128 حرفًا.",
    requiredPassword: "أدخل كلمة المرور.",
    loginError: "تعذّر تسجيل الدخول. تحقّق من بياناتك وحاول مجددًا.",
    signupError:
      "تعذّر إنشاء الحساب. حاول مجددًا أو سجّل الدخول إذا كان لديك حساب بالفعل.",
    requestError: "تعذّر إكمال طلبك. يرجى المحاولة بعد قليل.",
    rateLimit: "محاولات كثيرة جدًا. انتظر قليلًا ثم حاول مجددًا.",
    verificationTitle: "تحقّق من بريدك الإلكتروني.",
    verificationMessage:
      "إذا أمكن متابعة التسجيل، فستتلقى رسالة تحتوي على رابط لتأكيد عنوانك. تحقّق أيضًا من مجلد الرسائل غير المرغوب فيها.",
    resend: "إرسال رسالة تأكيد أخرى",
    resent: "إذا كان حسابك يحتاج إلى تأكيد، فستصلك رسالة جديدة.",
    resetSentTitle: "تحقّق من بريدك الإلكتروني.",
    resetSent:
      "إذا كان هناك حساب مرتبط بهذا العنوان، فستتلقى رابطًا لإعادة تعيين كلمة المرور. تحقّق أيضًا من مجلد الرسائل غير المرغوب فيها.",
    resetSuccessTitle: "تم تحديث كلمة المرور.",
    resetSuccess: "سجّل الدخول بكلمة المرور الجديدة للمتابعة.",
    resetUnavailable:
      "استعادة كلمة المرور غير متاحة بعد. تواصل معنا للحصول على مساعدة في الوصول إلى حسابك.",
    invalidReset:
      "رابط إعادة التعيين غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا للمتابعة.",
    requestNewLink: "طلب رابط جديد",
    contact: "تواصل معنا",
    terms: "شروط الاستخدام",
    privacy: "سياسة الخصوصية",
    cookies: "سياسة ملفات تعريف الارتباط",
    legal: "المعلومات القانونية",
  },
  ja: {
    title: {
      login: ["物語は", "続いていく。"],
      signup: ["物語は", "あなたから始まる。"],
      forgot: ["もう一度、", "つながるために。"],
      reset: ["新たな始まりを。", "安全に。"],
    },
    home: "Tree of Unity — ホーム",
    navigation: "アカウントナビゲーション",
    login: "ログイン",
    signup: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    createPassword: "パスワードを作成",
    newPassword: "新しいパスワード",
    passwordHint:
      "15〜128文字を使用してください。長く、他で使っていないパスフレーズをおすすめします。",
    showPassword: "パスワードを表示",
    hidePassword: "パスワードを隠す",
    forgotPassword: "パスワードをお忘れですか？",
    continue: "続ける",
    createAccount: "アカウントを作成",
    sendResetLink: "再設定リンクを送信",
    savePassword: "新しいパスワードを保存",
    working: "お待ちください…",
    or: "または",
    google: "Google で続ける",
    apple: "Apple で続ける",
    alreadyMember: "すでにアカウントをお持ちですか？",
    backToLogin: "ログインに戻る",
    resetIntro:
      "メールアドレスを入力すると、新しいパスワードを設定するためのリンクをお送りします。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    invalidPassword: "15〜128文字のパスワードを使用してください。",
    requiredPassword: "パスワードを入力してください。",
    loginError:
      "ログインできませんでした。入力内容を確認して、もう一度お試しください。",
    signupError:
      "アカウントを作成できませんでした。もう一度お試しください。すでにお持ちの場合はログインしてください。",
    requestError:
      "リクエストを完了できませんでした。しばらくしてからもう一度お試しください。",
    rateLimit: "試行回数が多すぎます。少し待ってからもう一度お試しください。",
    verificationTitle: "メールをご確認ください。",
    verificationMessage:
      "登録を続行できる場合は、アドレス確認用のリンクをメールでお送りします。迷惑メールフォルダーもご確認ください。",
    resend: "確認メールを再送信",
    resent: "アカウントの確認が必要な場合は、新しいメールをお送りします。",
    resetSentTitle: "メールをご確認ください。",
    resetSent:
      "そのアドレスに該当するアカウントがある場合は、パスワード再設定リンクをお送りします。迷惑メールフォルダーもご確認ください。",
    resetSuccessTitle: "パスワードを更新しました。",
    resetSuccess: "新しいパスワードでログインして続行してください。",
    resetUnavailable:
      "パスワードの復元はまだ利用できません。アカウントへのアクセスについてお問い合わせください。",
    invalidReset:
      "この再設定リンクは無効か、有効期限が切れています。新しいリンクをリクエストしてください。",
    requestNewLink: "新しいリンクをリクエスト",
    contact: "お問い合わせ",
    terms: "利用規約",
    privacy: "プライバシーポリシー",
    cookies: "Cookie ポリシー",
    legal: "法的情報",
  },
  "pt-BR": {
    title: {
      login: ["Uma história", "continua."],
      signup: ["Uma história começa", "com você."],
      forgot: ["Um novo caminho", "de volta."],
      reset: ["Recomece.", "Com segurança."],
    },
    home: "Tree of Unity — início",
    navigation: "Navegação da conta",
    login: "Entrar",
    signup: "Cadastrar-se",
    email: "Endereço de e-mail",
    password: "Senha",
    createPassword: "Crie uma senha",
    newPassword: "Nova senha",
    passwordHint:
      "Use de 15 a 128 caracteres. Uma frase longa e exclusiva é uma boa opção.",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    forgotPassword: "Esqueceu a senha?",
    continue: "Continuar",
    createAccount: "Criar conta",
    sendResetLink: "Enviar link de redefinição",
    savePassword: "Salvar nova senha",
    working: "Aguarde…",
    or: "ou",
    google: "Continuar com Google",
    apple: "Continuar com Apple",
    alreadyMember: "Já tem uma conta?",
    backToLogin: "Voltar para o login",
    resetIntro:
      "Digite seu e-mail e enviaremos um link para escolher uma nova senha.",
    invalidEmail: "Digite um endereço de e-mail válido.",
    invalidPassword: "Use uma senha de 15 a 128 caracteres.",
    requiredPassword: "Digite sua senha.",
    loginError:
      "Não foi possível entrar. Confira seus dados e tente novamente.",
    signupError:
      "Não foi possível criar a conta. Tente novamente ou entre se já tiver uma.",
    requestError:
      "Não foi possível concluir sua solicitação. Tente novamente em instantes.",
    rateLimit: "Muitas tentativas. Aguarde um momento e tente novamente.",
    verificationTitle: "Confira seu e-mail.",
    verificationMessage:
      "Se o cadastro puder continuar, você receberá um e-mail com um link para verificar seu endereço. Confira também a pasta de spam.",
    resend: "Enviar outro e-mail de verificação",
    resent:
      "Se sua conta precisar de verificação, um novo e-mail será enviado.",
    resetSentTitle: "Confira seu e-mail.",
    resetSent:
      "Se houver uma conta com esse endereço, você receberá um link para redefinir a senha. Confira também a pasta de spam.",
    resetSuccessTitle: "Sua senha foi atualizada.",
    resetSuccess: "Entre com sua nova senha para continuar.",
    resetUnavailable:
      "A recuperação de senha ainda não está disponível. Entre em contato para obter ajuda com o acesso à sua conta.",
    invalidReset:
      "Este link é inválido ou expirou. Solicite um novo link para continuar.",
    requestNewLink: "Solicitar novo link",
    contact: "Fale conosco",
    terms: "Termos de uso",
    privacy: "Política de privacidade",
    cookies: "Política de cookies",
    legal: "Informações legais",
  },
  ko: {
    title: {
      login: ["이야기는", "계속됩니다."],
      signup: ["당신과 함께", "이야기가 시작됩니다."],
      forgot: ["다시 돌아오는", "새로운 길."],
      reset: ["다시 시작하세요.", "안전하게."],
    },
    home: "Tree of Unity — 홈",
    navigation: "계정 탐색",
    login: "로그인",
    signup: "회원가입",
    email: "이메일 주소",
    password: "비밀번호",
    createPassword: "비밀번호 만들기",
    newPassword: "새 비밀번호",
    passwordHint: "15~128자를 사용하세요. 길고 고유한 암호 문구를 권장합니다.",
    showPassword: "비밀번호 표시",
    hidePassword: "비밀번호 숨기기",
    forgotPassword: "비밀번호를 잊으셨나요?",
    continue: "계속",
    createAccount: "계정 만들기",
    sendResetLink: "재설정 링크 보내기",
    savePassword: "새 비밀번호 저장",
    working: "잠시 기다려 주세요…",
    or: "또는",
    google: "Google로 계속",
    apple: "Apple로 계속",
    alreadyMember: "이미 계정이 있으신가요?",
    backToLogin: "로그인으로 돌아가기",
    resetIntro:
      "이메일을 입력하시면 새 비밀번호를 설정할 수 있는 링크를 보내드립니다.",
    invalidEmail: "올바른 이메일 주소를 입력하세요.",
    invalidPassword: "15~128자의 비밀번호를 사용하세요.",
    requiredPassword: "비밀번호를 입력하세요.",
    loginError: "로그인할 수 없습니다. 정보를 확인하고 다시 시도해 주세요.",
    signupError:
      "계정을 만들 수 없습니다. 다시 시도하거나 이미 계정이 있다면 로그인하세요.",
    requestError: "요청을 완료할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    rateLimit: "시도 횟수가 너무 많습니다. 잠시 기다린 후 다시 시도해 주세요.",
    verificationTitle: "이메일을 확인하세요.",
    verificationMessage:
      "가입을 진행할 수 있다면 주소 확인 링크가 담긴 이메일을 받게 됩니다. 스팸 폴더도 확인하세요.",
    resend: "확인 이메일 다시 보내기",
    resent: "계정 확인이 필요한 경우 새 이메일이 발송됩니다.",
    resetSentTitle: "이메일을 확인하세요.",
    resetSent:
      "해당 주소의 계정이 있다면 비밀번호 재설정 링크를 받게 됩니다. 스팸 폴더도 확인하세요.",
    resetSuccessTitle: "비밀번호가 변경되었습니다.",
    resetSuccess: "새 비밀번호로 로그인하여 계속하세요.",
    resetUnavailable:
      "비밀번호 복구는 아직 이용할 수 없습니다. 계정 접근에 도움이 필요하면 문의해 주세요.",
    invalidReset:
      "재설정 링크가 유효하지 않거나 만료되었습니다. 새 링크를 요청하세요.",
    requestNewLink: "새 링크 요청",
    contact: "문의하기",
    terms: "이용 약관",
    privacy: "개인정보 처리방침",
    cookies: "쿠키 정책",
    legal: "법적 정보",
  },
  it: {
    title: {
      login: ["Una storia", "continua."],
      signup: ["Una storia inizia", "con te."],
      forgot: ["Una nuova strada", "per tornare."],
      reset: ["Ricomincia.", "In sicurezza."],
    },
    home: "Tree of Unity — home",
    navigation: "Navigazione dell’account",
    login: "Accedi",
    signup: "Registrati",
    email: "Indirizzo e-mail",
    password: "Password",
    createPassword: "Crea una password",
    newPassword: "Nuova password",
    passwordHint:
      "Usa da 15 a 128 caratteri. Una frase lunga e unica è una buona scelta.",
    showPassword: "Mostra password",
    hidePassword: "Nascondi password",
    forgotPassword: "Hai dimenticato la password?",
    continue: "Continua",
    createAccount: "Crea account",
    sendResetLink: "Invia il link di reimpostazione",
    savePassword: "Salva la nuova password",
    working: "Attendi…",
    or: "oppure",
    google: "Continua con Google",
    apple: "Continua con Apple",
    alreadyMember: "Hai già un account?",
    backToLogin: "Torna all’accesso",
    resetIntro:
      "Inserisci la tua e-mail e ti invieremo un link per scegliere una nuova password.",
    invalidEmail: "Inserisci un indirizzo e-mail valido.",
    invalidPassword: "Usa una password da 15 a 128 caratteri.",
    requiredPassword: "Inserisci la tua password.",
    loginError: "Impossibile accedere. Controlla i dati e riprova.",
    signupError:
      "Impossibile creare l’account. Riprova o accedi se ne hai già uno.",
    requestError: "Impossibile completare la richiesta. Riprova tra poco.",
    rateLimit: "Troppi tentativi. Attendi un momento e riprova.",
    verificationTitle: "Controlla la tua e-mail.",
    verificationMessage:
      "Se la registrazione può proseguire, riceverai un’e-mail con un link per verificare il tuo indirizzo. Controlla anche lo spam.",
    resend: "Invia un’altra e-mail di verifica",
    resent:
      "Se il tuo account richiede la verifica, è in arrivo una nuova e-mail.",
    resetSentTitle: "Controlla la tua e-mail.",
    resetSent:
      "Se esiste un account con questo indirizzo, riceverai un link per reimpostare la password. Controlla anche lo spam.",
    resetSuccessTitle: "La tua password è stata aggiornata.",
    resetSuccess: "Accedi con la nuova password per continuare.",
    resetUnavailable:
      "Il recupero della password non è ancora disponibile. Contattaci per ricevere assistenza nell’accesso al tuo account.",
    invalidReset:
      "Questo link non è valido o è scaduto. Richiedi un nuovo link per continuare.",
    requestNewLink: "Richiedi un nuovo link",
    contact: "Contattaci",
    terms: "Condizioni d’uso",
    privacy: "Informativa sulla privacy",
    cookies: "Informativa sui cookie",
    legal: "Informazioni legali",
  },
};
export interface AccountSummaryCopy {
  title: string;
  signedIn: string;
  logout: string;
  explore: string;
  error: string;
}
export const accountSummaryCopy: Record<Locale, AccountSummaryCopy> = {
  en: {
    title: "A story continues.",
    signedIn: "You are signed in",
    logout: "Log out",
    explore: "Continue exploring",
    error: "Unable to log out. Please try again.",
  },
  es: {
    title: "La historia continúa.",
    signedIn: "Has iniciado sesión",
    logout: "Cerrar sesión",
    explore: "Seguir explorando",
    error: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
  },
  "zh-Hans": {
    title: "故事仍在继续。",
    signedIn: "您已登录",
    logout: "退出登录",
    explore: "继续探索",
    error: "无法退出登录。请重试。",
  },
  "zh-Hant": {
    title: "故事仍在繼續。",
    signedIn: "您已登入",
    logout: "登出",
    explore: "繼續探索",
    error: "無法登出。請重試。",
  },
  fr: {
    title: "L’histoire continue.",
    signedIn: "Vous êtes connecté",
    logout: "Se déconnecter",
    explore: "Continuer à explorer",
    error: "Déconnexion impossible. Veuillez réessayer.",
  },
  de: {
    title: "Eine Geschichte geht weiter.",
    signedIn: "Sie sind angemeldet",
    logout: "Abmelden",
    explore: "Weiter entdecken",
    error: "Abmeldung nicht möglich. Bitte versuchen Sie es erneut.",
  },
  ar: {
    title: "الحكاية تتواصل.",
    signedIn: "أنت مسجّل الدخول",
    logout: "تسجيل الخروج",
    explore: "واصل الاستكشاف",
    error: "تعذّر تسجيل الخروج. يرجى المحاولة مجددًا.",
  },
  ja: {
    title: "物語は続いていく。",
    signedIn: "ログインしています",
    logout: "ログアウト",
    explore: "探索を続ける",
    error: "ログアウトできませんでした。もう一度お試しください。",
  },
  "pt-BR": {
    title: "Uma história continua.",
    signedIn: "Você está conectado",
    logout: "Sair",
    explore: "Continuar explorando",
    error: "Não foi possível sair. Tente novamente.",
  },
  ko: {
    title: "이야기는 계속됩니다.",
    signedIn: "로그인되었습니다",
    logout: "로그아웃",
    explore: "계속 탐험하기",
    error: "로그아웃할 수 없습니다. 다시 시도해 주세요.",
  },
  it: {
    title: "Una storia continua.",
    signedIn: "Hai effettuato l’accesso",
    logout: "Esci",
    explore: "Continua a esplorare",
    error: "Impossibile uscire. Riprova.",
  },
};
