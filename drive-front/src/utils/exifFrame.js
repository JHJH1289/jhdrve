const SONY_LOGO_SRC = "/sony_logo.png"; // public 폴더 실제 파일명에 맞게 수정

export async function generateExifFrameBlob(photo) {
  const [{ image, revoke }, logo] = await Promise.all([
    loadProtectedImage(photo.imageUrl),
    loadOptionalImage(SONY_LOGO_SRC),
  ]);

  try {
    const width = image.width;
    const height = image.height;

    const footerHeight = Math.max(110, Math.round(width * 0.09));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height + footerHeight;

    const ctx = canvas.getContext("2d");

    // 전체 배경
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 원본 사진
    ctx.drawImage(image, 0, 0, width, height);

    // footer 배경
    ctx.fillStyle = "#f3f3f3";
    ctx.fillRect(0, height, width, footerHeight);

    // 상단 경계선
    ctx.strokeStyle = "#d6d6d6";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height + 0.5);
    ctx.lineTo(width, height + 0.5);
    ctx.stroke();

    // ---------- 레이아웃 ----------
    const paddingX = Math.round(width * 0.018);

    // 왼쪽 영역
    const leftX = paddingX;
    const leftMaxWidth = Math.round(width * 0.44);

    // 구분선
    const dividerX = Math.round(width * 0.78);

    // 구분선 기준 좌우 동일 여백
    const innerGap = Math.round(width * 0.018);

    // 오른쪽 텍스트 영역
    const rightX = width - paddingX; // 오른쪽 정렬 기준점
    const rightBlockLeft = dividerX + innerGap;
    const rightMaxWidth = rightX - rightBlockLeft;

    // 로고 영역
    // 로고의 오른쪽 끝이 dividerX - innerGap 위치에 오도록
    const logoRightX = dividerX - innerGap;
    const logoMaxWidth = Math.round(width * 0.16);

    // 왼쪽 줄간격 좁게
    const line1Y = height + Math.round(footerHeight * 0.40);
    const line2Y = height + Math.round(footerHeight * 0.66);

    // 폰트 크기
    const techFontSize = Math.max(16, Math.round(width * 0.016));
    const dateFontSize = Math.max(14, Math.round(width * 0.0125));
    const brandFontSize = Math.max(28, Math.round(width * 0.026));
    const cameraFontSize = Math.max(16, Math.round(width * 0.016));
    const lensFontSize = Math.max(14, Math.round(width * 0.013));

    // ---------- 좌측 정보 ----------
    const focalLength = formatFocalLength(photo.focalLength);
    const fNumber = formatFNumber(photo.fNumber || photo.fnumber);
    const exposureTime = formatExposureTime(photo.exposureTime);
    const iso = formatIso(photo.iso);

    const technicalText = [iso, focalLength, fNumber, exposureTime]
      .filter(Boolean)
      .join(" ");

    ctx.textBaseline = "middle";

    // 1줄
    ctx.fillStyle = "#111111";
    ctx.font = `500 ${techFontSize}px Arial`;
    drawSingleLineEllipsis(ctx, technicalText || "-", leftX, line1Y, leftMaxWidth, "left");

    // 2줄
    ctx.fillStyle = "#6f6f6f";
    ctx.font = `400 ${dateFontSize}px Arial`;
    drawSingleLineEllipsis(
      ctx,
      formatDateTime(photo.takenAt || photo.createdAt),
      leftX,
      line2Y,
      leftMaxWidth,
      "left"
    );

    // ---------- 가운데 로고 ----------
    if (logo) {
      drawRightAlignedLogo(
        ctx,
        logo,
        logoRightX,
        height + footerHeight / 2,
        logoMaxWidth,
        footerHeight * 0.3
      );
    } else {
      const brandText = safe(photo.cameraMake)?.toUpperCase() || "CAMERA";
      ctx.fillStyle = "#111111";
      ctx.font = `700 ${brandFontSize}px "Times New Roman", serif`;
      ctx.textAlign = "right";
      ctx.fillText(brandText, logoRightX, height + footerHeight / 2);
    }

    // ---------- 구분선 ----------
    const dividerTop = height + Math.round(footerHeight * 0.22);
    const dividerBottom = height + Math.round(footerHeight * 0.78);

    ctx.strokeStyle = "#bcbcbc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dividerX, dividerTop);
    ctx.lineTo(dividerX, dividerBottom);
    ctx.stroke();

    // ---------- 오른쪽 카메라 / 렌즈 ----------
    const cameraText = compactJoin([photo.cameraMake, photo.cameraModel], " ").toUpperCase();
    const lensText = safe(photo.lensModel);

    ctx.fillStyle = "#111111";
    ctx.font = `500 ${cameraFontSize}px Arial`;
    drawSingleLineEllipsis(ctx, cameraText || "-", rightX, line1Y, rightMaxWidth, "right");

    ctx.fillStyle = "#6f6f6f";
    ctx.font = `400 ${lensFontSize}px Arial`;
    drawSingleLineEllipsis(ctx, lensText || "-", rightX, line2Y, rightMaxWidth, "right");

    return await canvasToBlob(canvas, "image/jpeg", 0.95);
  } finally {
    revoke();
  }
}

function drawRightAlignedLogo(ctx, logo, rightX, centerY, maxWidth, maxHeight) {
  const logoWidth = logo.width;
  const logoHeight = logo.height;

  if (!logoWidth || !logoHeight) return;

  const scale = Math.min(maxWidth / logoWidth, maxHeight / logoHeight);
  const drawWidth = logoWidth * scale;
  const drawHeight = logoHeight * scale;

  const x = rightX - drawWidth;
  const y = centerY - drawHeight / 2;

  ctx.drawImage(logo, x, y, drawWidth, drawHeight);
}

async function loadProtectedImage(url) {
  const token = localStorage.getItem("token") || "";
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error("원본 이미지를 불러오지 못했습니다.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const image = await loadImage(objectUrl);

  return {
    image,
    revoke: () => URL.revokeObjectURL(objectUrl),
  };
}

async function loadOptionalImage(src) {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지 로드 실패"));
    img.src = src;
  });
}

function canvasToBlob(canvas, type = "image/jpeg", quality = 0.95) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("프레임 이미지 생성 실패"));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

function drawSingleLineEllipsis(ctx, text, x, y, maxWidth, align = "left") {
  let output = text || "-";

  while (ctx.measureText(output).width > maxWidth && output.length > 1) {
    output = `${output.slice(0, -2)}…`;
  }

  ctx.textAlign = align === "right" ? "right" : "left";
  ctx.fillText(output, x, y);
}

function formatIso(iso) {
  if (iso === null || iso === undefined || iso === "") return "";
  return `ISO${iso}`;
}

function formatFocalLength(value) {
  const text = safe(value);
  if (!text) return "";

  const normalized = text.replace(/\s+/g, "");
  return normalized.toLowerCase().endsWith("mm") ? normalized : `${normalized}mm`;
}

function formatFNumber(value) {
  const text = safe(value);
  if (!text) return "";

  const normalized = text.replace(/^f\//i, "").replace(/^f/i, "").trim();
  if (!normalized) return "";
  return `F${normalized}`;
}

function formatExposureTime(value) {
  const text = safe(value);
  if (!text) return "";

  return text
    .replace(/\s*sec$/i, "s")
    .replace(/\s+/g, "")
    .replace(/초$/, "s");
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
}

function compactJoin(values, separator = " ") {
  return values
    .map((value) => safe(value))
    .filter(Boolean)
    .join(separator);
}

function safe(value) {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return text || "";
}