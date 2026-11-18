type PngImage = {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray | Uint16Array;
  depth: number;
  channels: number;
  palette?: unknown;
};

type FastPng = {
  decode: (data: Uint8Array) => PngImage;
  encode: (png: {
    width: number;
    height: number;
    data: Uint8Array;
    channels: number;
    depth: 8;
  }) => Uint8Array;
  convertIndexedToRgb: (png: PngImage) => Uint8Array;
};

const NativeTextDecoder = globalThis.TextDecoder;

function isLatin1(label: string) {
  switch (label.trim().toLowerCase()) {
    case "latin1":
    case "latin-1":
    case "iso-8859-1":
    case "windows-1252":
    case "ascii":
      return true;
    default:
      return false;
  }
}

function toBytes(input: ArrayBuffer | ArrayBufferView) {
  if (input instanceof Uint8Array) return input;
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  return new Uint8Array(input);
}

// fast-png builds a latin1 TextDecoder at import time. Hermes rejects that encoding.
function installLatin1TextDecoder() {
  if (typeof NativeTextDecoder !== "function") return;
  try {
    new NativeTextDecoder("latin1");
    return;
  } catch {
    // Fall through and install a decoder that accepts latin1.
  }

  class TextDecoderWithLatin1 {
    private readonly native: TextDecoder | null;
    readonly encoding: string;

    constructor(label = "utf-8", options?: TextDecoderOptions) {
      if (isLatin1(label)) {
        this.encoding = "latin1";
        this.native = null;
        return;
      }
      this.native = new NativeTextDecoder(label, options);
      this.encoding = this.native.encoding;
    }

    decode(input?: ArrayBuffer | ArrayBufferView) {
      if (this.native) return this.native.decode(input);
      if (!input) return "";
      const bytes = toBytes(input);
      let text = "";
      const chunkSize = 0x2000;
      for (let index = 0; index < bytes.length; index += chunkSize) {
        text += String.fromCharCode(
          ...bytes.subarray(index, index + chunkSize),
        );
      }
      return text;
    }
  }

  globalThis.TextDecoder =
    TextDecoderWithLatin1 as unknown as typeof TextDecoder;
}

let fastPngPromise: Promise<FastPng> | null = null;

function loadFastPng() {
  installLatin1TextDecoder();
  fastPngPromise ??= import("fast-png");
  return fastPngPromise;
}

function base64ToBytes(base64: string) {
  const raw = globalThis.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index++) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x2000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return globalThis.btoa(binary);
}

function rgbaPixels(
  png: PngImage,
  convertIndexedToRgb: FastPng["convertIndexedToRgb"],
) {
  if (png.depth !== 8) {
    throw new Error("Share card image is not 8-bit.");
  }

  if (png.palette) {
    const rgb = convertIndexedToRgb(png);
    const channels = rgb.length === png.width * png.height * 4 ? 4 : 3;
    return expandToRgba(rgb, channels);
  }

  if (
    !(png.data instanceof Uint8Array || png.data instanceof Uint8ClampedArray)
  ) {
    throw new Error("Share card image is not 8-bit.");
  }

  return expandToRgba(png.data, png.channels);
}

function expandToRgba(
  pixels: Uint8Array | Uint8ClampedArray,
  channels: number,
) {
  if (channels === 4) return pixels;
  if (channels !== 3) {
    throw new Error("Share card image uses an unsupported color format.");
  }

  const rgba = new Uint8Array((pixels.length / 3) * 4);
  for (
    let source = 0, target = 0;
    source < pixels.length;
    source += 3, target += 4
  ) {
    rgba[target] = pixels[source];
    rgba[target + 1] = pixels[source + 1];
    rgba[target + 2] = pixels[source + 2];
    rgba[target + 3] = 255;
  }
  return rgba;
}

export async function stitchPngBase64(parts: string[]) {
  if (parts.length === 1) return parts[0];

  const { convertIndexedToRgb, decode, encode } = await loadFastPng();
  const images = parts.map((part) => decode(base64ToBytes(part)));
  const width = images[0]?.width ?? 0;
  const height = images.reduce((sum, image) => sum + image.height, 0);
  if (width < 1 || height < 1) {
    throw new Error("Share card image was empty.");
  }

  const output = new Uint8Array(width * height * 4);
  let row = 0;
  for (const image of images) {
    const pixels = rgbaPixels(image, convertIndexedToRgb);
    const copyWidth = Math.min(width, image.width);
    for (let y = 0; y < image.height; y++) {
      const sourceStart = y * image.width * 4;
      const targetStart = (row + y) * width * 4;
      output.set(
        pixels.subarray(sourceStart, sourceStart + copyWidth * 4),
        targetStart,
      );
    }
    row += image.height;
  }

  return bytesToBase64(
    encode({
      width,
      height,
      data: output,
      channels: 4,
      depth: 8,
    }),
  );
}
