const { Jimp } = require("jimp");

async function checkColor(filepath) {
    try {
        const image = await Jimp.read(filepath);
        const { width, height } = image.bitmap;
        let darkPixels = 0;
        let whitePixels = 0;
        let transparentPixels = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const hex = image.getPixelColor(x, y);
                const rgb = Jimp.intToRGBA(hex);
                if (rgb.a === 0) {
                    transparentPixels++;
                    continue;
                }
                const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                if (brightness < 128) {
                    darkPixels++;
                } else {
                    whitePixels++;
                }
            }
        }
        console.log(
            `${filepath}: Dark=${darkPixels}, White=${whitePixels}, Transparent=${transparentPixels}`
        );
    } catch (e) {
        console.error(e.message);
    }
}

checkColor("public/images/tfp.png");
checkColor("public/images/logo.png");
