import * as pdfjsLib from 'pdfjs-dist';
// Explicitly specify worker path (using unpkg or cdnjs as fallback if local isn't configured)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export class DocumentProcessor {
  /**
   * Extracts text from a file (PDF or TXT)
   */
  async extractText(fileData: string, mimeType: string): Promise<{ text: string, pages: { text: string, pageNumber: number }[] }> {
    if (mimeType === 'application/pdf') {
      return this.extractFromPDF(fileData);
    }
    
    // Fallback for simple text files
    if (fileData.startsWith('data:')) {
      const base64 = fileData.split(',')[1];
      const text = atob(base64);
      return { text, pages: [{ text, pageNumber: 1 }] };
    }
    return { text: fileData, pages: [{ text: fileData, pageNumber: 1 }] };
  }

  private async extractFromPDF(dataUrl: string): Promise<{ text: string, pages: { text: string, pageNumber: number }[] }> {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({ data: array });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      pages.push({ text: pageText, pageNumber: i });
      fullText += pageText + '\n\n';
    }

    return { text: fullText.trim(), pages };
  }

  /**
   * Splits pages of text into smaller logical chunks.
   */
  chunkText(pages: { text: string, pageNumber: number }[], chunkSize = 1000, overlap = 200) {
    const chunks: { content: string, pageNumber: number }[] = [];
    
    for (const page of pages) {
      if (!page.text.trim()) continue;
      
      // Simple chunking strategy for now: by length with overlap
      let startIndex = 0;
      while (startIndex < page.text.length) {
        let endIndex = startIndex + chunkSize;
        if (endIndex > page.text.length) {
          endIndex = page.text.length;
        } else {
          // Try to find a logical break like a period or newline
          const nextBreak = Math.max(
            page.text.lastIndexOf('. ', endIndex),
            page.text.lastIndexOf('\n', endIndex)
          );
          if (nextBreak > startIndex + chunkSize / 2) {
            endIndex = nextBreak + 1;
          }
        }
        
        const chunkContent = page.text.substring(startIndex, endIndex).trim();
        if (chunkContent.length > 50) {
          chunks.push({
            content: chunkContent,
            pageNumber: page.pageNumber
          });
        }
        
        startIndex = endIndex - overlap;
        if (startIndex < 0) startIndex = 0;
        if (endIndex === page.text.length) break;
      }
    }
    
    return chunks;
  }
}

export const documentProcessor = new DocumentProcessor();
