export async function exportIdCardToPng(): Promise<void> {
  const cardElement = document.getElementById('id-card-preview');
  if (!cardElement) {
    throw new Error('ID card element not found');
  }

  // Use dom-to-image approach with canvas
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Get element dimensions
    const rect = cardElement.getBoundingClientRect();
    const scale = 2; // For higher quality
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    // Scale context for better quality
    ctx.scale(scale, scale);

    // Get computed styles
    const computedStyle = window.getComputedStyle(cardElement);
    
    // Draw background
    ctx.fillStyle = computedStyle.backgroundColor || '#0f172a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Convert HTML to SVG foreignObject
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${cardElement.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `roleplay-id-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fallback: just trigger print
      printIdCard();
    };

    img.src = url;
  } catch (error) {
    console.error('Export error:', error);
    // Fallback to print
    printIdCard();
  }
}

export function printIdCard(): void {
  const cardElement = document.getElementById('id-card-preview');
  if (!cardElement) {
    throw new Error('ID card element not found');
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const cardHtml = cardElement.outerHTML;
  const styles = Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ID Card</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; padding: 20px; }
            #id-card-preview { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        ${cardHtml}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
