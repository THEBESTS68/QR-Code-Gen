# QR Code Generator By DBC

เว็บสร้าง QR Code แบบกำหนดเอง รองรับลิงก์ ข้อความ Wi‑Fi อีเมล และเบอร์โทร ใส่โลโก้ได้ และดาวน์โหลดเป็น PNG / JPG / SVG

## โครงสร้างไฟล์

```
index.html                 โครงหน้าเว็บ (HTML)
css/styles.css             หน้าตาทั้งหมด: สี ธีมมืด/สว่าง และ responsive
js/script.js               การทำงาน: สร้าง QR, ธีมสำเร็จรูป, อัปโหลดโลโก้, ดาวน์โหลด
assets/logo.png            โลโก้ DBC
assets/fonts/              ฟอนต์ LINE Seed Sans TH (Regular / Bold / ExtraBold)
```

## แก้ไขบ่อย ๆ อยู่ตรงไหน

- **เปลี่ยนสีธีมของเว็บ** — ตัวแปร `--bg`, `--accent` ฯลฯ ใน `:root` (โหมดมืด) และ `body.light` (โหมดสว่าง) ที่ต้นไฟล์ `css/styles.css`
- **เพิ่ม/แก้ธีมสำเร็จรูปของ QR** — อาร์เรย์ `PRESETS` ต้นไฟล์ `js/script.js`
- **ค่าเริ่มต้นตอนเปิดเว็บ / ตอนกดรีเซ็ต** — ออบเจกต์ `DEFAULTS` ใน `js/script.js`
- **เปลี่ยนฟอนต์** — แก้ `@font-face` และ `--font` ใน `css/styles.css`

## รันในเครื่อง

เปิด `index.html` ในเบราว์เซอร์ได้เลย (ต้องต่ออินเทอร์เน็ตเพื่อโหลดไลบรารี [qr-code-styling](https://github.com/kozakdenys/qr-code-styling))
ปุ่ม "คัดลอกรูป" ใช้ได้เมื่อเปิดผ่าน https หรือ localhost เท่านั้น
