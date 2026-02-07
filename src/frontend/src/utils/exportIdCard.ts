/**
 * Export ID card to PNG using native Canvas API
 */
export async function exportIdCardToPNG(
  firstName: string,
  lastName: string,
  dob: string,
  gender: string,
  height: string,
  eyeColor: string,
  idNumber: string,
  state: string,
  photoUrl?: string
): Promise<void> {
  const element = document.getElementById('id-card-preview');
  if (!element) {
    throw new Error('ID card preview element not found');
  }

  try {
    // Create a canvas with the same dimensions as the ID card
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const scale = 2; // Higher resolution
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Scale for higher resolution
    ctx.scale(scale, scale);

    // Create SVG with foreignObject containing the HTML
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const blob = new Blob([data], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `falcon-id-${idNumber}.png`;
          link.href = downloadUrl;
          link.click();
          URL.revokeObjectURL(downloadUrl);
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      throw new Error('Failed to load ID card image');
    };

    img.src = url;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

/**
 * Print ID card in new window
 */
export function printIdCard(): void {
  const element = document.getElementById('id-card-preview');
  if (!element) {
    throw new Error('ID card preview element not found');
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ID Card</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #000;
          }
          @media print {
            body {
              background: white;
            }
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
