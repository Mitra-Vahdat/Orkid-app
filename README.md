# ارکید  (سامانه تعاملی گفتاردرمانی ویژه کودکان طیف اتیسم)

ارکید سامانه‌ای تعاملی‌ و نوآورانه‌ست که روند برقراری ارتباط، تکلم و گفتار درمانی را برای کودکان طیف اتیسم درجه دو یا سه، والدین و مربی‌های مراکز و مدارس اتیسم تسهیل می‌کند. این سامانه به‌عنوان عامل کمکی در فرآیند گفتاردرمانی، با بهره‌گیری از فناوری‌های تحت وب، ابزاری ساده و با دسترس‌پذیری مطلوب را در اختیار کودکان و همراهان آموزشی آنان قرار می‌دهد تا تمارین گفتار درمانی از پروسه‌ای هزینه‌بر و سخت به فرآیندی شخصی‌سازی شده و آسان‌تر بدل شود و کودک طیف اتیسم بتواند بدون ایجاد وابستگی به عاملی خارجی، به‌طور روزمره تکلم را در محیطی قابل اعتماد و آشنا تمرین کند و درعین حال مهارت‌های تشخیصی، خواندن و نوشتن خود را تقویت کند. 


## Education images

Education images are now real replaceable slots under `images/education/`.

- Each category uses `images/education/<category>/cover.svg` on the education category page.
- Lesson cards use `01.svg`, `02.svg`, etc. inside that category folder.
- You can replace these files with your final artwork while keeping the same filenames, or update the paths in `js/education.js`.
- `speechText` is stored separately from the visible `label`, so speech continues to work even when a visible label is empty/hidden.

## Card persistence

Index and card customization now share `js/card-state.js`. Card text, image data and deletion state are written immediately to `localStorage` (`orkid-card-state-v3`) and survive refresh/browser restart for the same browser origin.


## اجرای صحیح در ویندوز

برای اینکه تغییر کارت‌ها بین `index.html` و `card-customization.html` واقعاً مشترک و ماندگار باشد، پروژه را مستقیماً با `file://` باز نکنید.

روی `start-orkid.bat` دوبار کلیک کنید. پروژه در `http://localhost:8765/` باز می‌شود. در این حالت تمام صفحات یک origin مشترک دارند و state کارت‌ها در localStorage مرورگر باقی می‌ماند.

تغییر متن، تصویر و حذف کارت در صفحه ویرایش بلافاصله ذخیره می‌شود و نیازی به دکمه Save جداگانه ندارد.
