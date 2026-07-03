# طريقة تطبيق التعديلات على مشروعك

هذا الملف فيه بس الملفات اللي اتعدلت (مش المشروع كامل، عشان الحجم). انسخهم فوق نفس المسار بالظبط في مشروعك (فورك mohamedghanem-dev/opencode):

| الملف في الـ patch | يتحط مكان |
|---|---|
| `packages/opencode/src/session/prompt/anthropic.txt` | نفس المسار |
| `packages/opencode/src/session/prompt/default.txt` | نفس المسار |
| `packages/desktop/electron-builder.config.ts` | نفس المسار |
| `packages/desktop/icons/dev/icon.ico` + `icon.png` | نفس المسار |
| `packages/desktop/icons/prod/icon.ico` + `icon.png` | نفس المسار |
| `packages/app/index.html` | نفس المسار |
| `packages/app/src/desktop-menu.ts` | نفس المسار |
| `packages/ui/src/v2/styles/theme.css` | نفس المسار (استبدال كامل) |
| `packages/app/src/components/prompt-input.tsx` | نفس المسار (استبدال كامل) |
| `packages/app/src/components/prompt-input/drag-overlay.tsx` | نفس المسار (استبدال كامل) |
| `.github/workflows/build-windows.yml` | نفس المسار (ملف جديد) |

## اللي اتعمل بالظبط
1. **anthropic.txt / default.txt**: الهوية بقت "Nitro Code" بدل "OpenCode"، وشيلنا لينكات الدعم/التوثيق بتاعت المشروع الأصلي (opencode.ai, discord, github issues) عشان متوجهش المستخدم لمكان غلط.
2. **electron-builder.config.ts**: `productName` بقى "Nitro Code"، الـ `appId` اتغير لـ `com.nitrocode.desktop`، الـ protocol scheme بقى `nitrocode`، وشيلنا الـ `publish` بتاع GitHub الأصلي (كان بينشر تلقائي على ريبو anomalyco).
3. **الأيقونات**: استبدلنا `icon.ico` (ويندوز) و `icon.png` (لينكس) في قنوات dev وprod بالأيقونة اللي بعتها (NC بالبرق).
   - **ملحوظة**: `icon.icns` (macOS) *ما اتغيرش* لأنه محتاج أدوات macOS مش متاحة عندي، ومش أولوية لأنك بتستهدف ويندوز.
4. **الألوان (theme.css)**: كل الأماكن اللي كانت بتستخدم اللون الأزرق (`--v2-blue-*`) كـ "accent" (لون العلامة الأساسي: هايلايت، لينكات، أيقونات مفعّلة، حدود التركيز) اتحولت للأحمر (`--v2-red-*`) الموجود أصلاً جاهز في `colors.css` — بدون ما نخترع لون جديد. اتعدل في الوضعين الفاتح والغامق مع الحفاظ على درجات التباين الصحيحة.
5. **زر الإرسال (prompt-input.tsx)**: كان بيستخدم لون محايد (أسود/أبيض)، دلوقتي بيستخدم `--v2-red-500` (أحمر خفيف مش فاقع زي ما طلبت) مع أيقونة بيضاء عشان تفضل واضحة. فيه نسختين من الزر في الملف (وضع عادي ووضع shell) واتعدلوا الاتنين.
   - ملحوظة: مفيش أي تعديل على اللون العام لكل الأزرار "primary" في التطبيق (ده كان هيأثر على أزرار تانية كتير مش بس زر الإرسال) — التعديل مركّز بس على زر الإرسال.

## البناء
لازم الترتيب ده بالظبط (الأيقونة بتتنسخ في خطوة الـ build نفسها، مش الـ package):
```bash
cd packages/desktop
bun install
OPENCODE_CHANNEL=prod bun run build
OPENCODE_CHANNEL=prod bun run package:win
```
ده هيطلع `.exe` باسم "Nitro Code" وبالأيقونة الجديدة في `packages/desktop/dist`.

**ملحوظة مهمة**: `bun run build` عنده `prebuild` hook بيتشغل تلقائي وبيعمل حاجتين: (1) بينسخ الأيقونات من `icons/{channel}` لمجلد `resources/icons` (اللي electron-builder فعلياً بيقرأ منه)، و(2) بيبني سيرفر الـ CLI بتاع opencode نفسه من `packages/opencode` (`bun script/build-node.ts`). يعني السيرفر هيتبني تلقائي من نفس الكود، مفيش حاجة زيادة تعملها.

## بديل: بناء تلقائي عبر GitHub Actions (workflow)
بما إنك بتشتغل من Termux ومش هتقدر تعمل build فعلي لملف .exe (محتاج ويندوز أو macOS/Linux بمقومات build)، الملف `.github/workflows/build-windows.yml` بيعمل الشغل كله على سيرفرات GitHub نفسها مجاناً:

1. بعد ما ترفع الملفات دي على الفورك بتاعك، روح تاب **Actions** في صفحة الريبو على GitHub
2. هتلاقي workflow اسمه **build-windows** — دوس **Run workflow** (زرار يدوي)، أو ببساطة أي `push` على `main` هيشغّله تلقائي
3. لما يخلص (بياخد كام دقيقة)، هتلاقي في نفس صفحة الـ run تحت **Artifacts** ملف اسمه `nitro-code-windows` — دوس عليه ينزلّك الـ `.exe` جاهز على أي جهاز ويندوز، من غير ما تحتاج تبني حاجة بنفسك محلياً

ده أسهل حل ليك دلوقتي بما إنك على الموبايل.

6. **شكل الـ Drag & Drop (drag-overlay.tsx)**: كان شكله عبارة عن بانل مسطح بلون رمادي وأيقونة رمادية، وحدود التنبيه وقت السحب كانت بلون بنفسجي غريب (`icon-info-active`) مالوش علاقة بالبراند. اتغير لـ:
   - حدود الصندوق وقت السحب بقت باللون الأحمر (accent) بدل البنفسجي
   - الأوفرلاي بقى فيه دائرة (badge) شفافة بلون أحمر خفيف حوالين الأيقونة + خلفية زجاجية (backdrop blur) بدل اللون الرمادي المصمت — شكل أقرب لستايل Claude
   - النص بقى بلون أوضح (text-base بدل text-weak)

## لسه هتحتاج تعمله بعد كده
- **شاشة الترحيب (زي "Happy Friday" بتاعت Claude)**: دي مش موجودة في OpenCode أصلاً — ميزة جديدة بالكامل لازم تتبنى من الصفر، مش مجرد إعادة تلوين.
- **الرمز البرق الأحمر بدل النجمة**: لسه محتاج نلاقي/نبني الكومبوننت المناسب (لو ضمن شاشة الترحيب الجديدة).
- مراجعة أي نصوص "OpenCode" تانية موجودة في أماكن أعمق (زي رسايل onboarding) لو حابب تلاقيها كلها.
