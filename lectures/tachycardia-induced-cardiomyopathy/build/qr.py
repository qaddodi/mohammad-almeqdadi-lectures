# Draws the QR code on the cover and the Questions slide: navy round dots, rounded finder squares, transparent background.
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
URL = "https://raw.githubusercontent.com/qaddodi/mohammad-almeqdadi-lectures/main/lectures/tachycardia-induced-cardiomyopathy/TIC-slides.pdf"
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=40, border=1)
q.add_data(URL); q.make(fit=True)
img = q.make_image(image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer(radius_ratio=1),
                   color_mask=SolidFillColorMask(back_color=(255, 255, 255), front_color=(0x1A, 0x1F, 0x31))).convert("RGBA")
px = img.load()
for y in range(img.size[1]):
    for x in range(img.size[0]):
        r, g, b, a = px[x, y]
        if r > 240 and g > 240 and b > 240: px[x, y] = (255, 255, 255, 0)
img.save("img/qr-slides.png")
print(img.size)
